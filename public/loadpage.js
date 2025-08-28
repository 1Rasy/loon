(() => {
  const url = "https://offsiteact.meituan.com/act/ge/queryPoiByRecallBiz?yodaReady=h5&csecplatform=4&csecversion=4.0.2";

  const storedStr = $persistentStore.read("mt_au_135");
  if (!storedStr) {
    console.log("[Loon] 未找到本地 cookie，请先运行获取 cookie 脚本");
    $done();
    return;
  }

  let account;
  try {
    account = JSON.parse(storedStr);
    account.mtgsig.a2 = Date.now();
  } catch (e) {
    console.log("[Loon] 解析本地 cookie 失败");
    $done();
    return;
  }

  const headers = {
    'user-agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
    'origin':'https://offsiteact.meituan.com',
    'sec-fetch-site':'same-origin',
    'sec-fetch-dest':'empty',
    'sec-fetch-mode':'cors',
    'mtgsig': JSON.stringify(account.mtgsig),
    'cookie': account.cookie,
    'accept':'*/*',
    'accept-encoding':'gzip, deflate, br',
    'content-type':'application/json;charset=utf-8'
  };

  let totalPages = 0;
  let allLogs = []; // 存储本次脚本输出内容

  function randomDelay() {
    return 2000 + Math.floor(Math.random() * 1000); // 2000~2999 ms
  }

  function fetchPage(page) {
    console.log(`获取第 ${page} 页`);
    const bodyObj = {
      "lat":22.999832,
      "lon":113.120421,
      "geoType":"GCJ02",
      "geoSource":"html",
      "geoAccuracy":10,
      "mediumParams":{
        "recallBizId":"cpsH5Coupon",
        "bizId":"0c3bfd35279b4140b3bd8ecbc41301d6",
        "mediumSrc1":"0c3bfd35279b4140b3bd8ecbc41301d6",
        "scene":"CPS_SELF_SRC",
        "pageSrc1":"CPS_SELF_OUT_SRC_H5_LINK",
        "pageSrc2":"0c3bfd35279b4140b3bd8ecbc41301d6",
        "pageSrc3":"ef7b54947b474a3ebff3d911e4b36f80",
        "activityId":"6",
        "mediaPvId":"dafkdsajffjafdfs",
        "mediaUserId":"10086",
        "outActivityId":"6",
        "hoaePageV":"8",
        "p":"993752907000602624"
      },
      "appContainer":"UNKNOW",
      "rootPvId":"13ec190e-5147-4849-8633-e4852d70b70d",
      "pagePvId":"3504d45d-a846-4fde-8750-2be012387fef",
      "pageSessionId":"28a74d09-26bf-40e9-92f7-76ca1e702eb4",
      "outerPvId":"",
      "contentPvId":"",
      "recallBizId":"cpsSelfCouponAll",
      "pageNo": page,
      "channelType":"SELF",
      "categoryTypeList":["0"],
      "riskParams":{"fpPlatform":5}
    };

    $httpClient.post({
      url: url,
      headers: headers,
      body: JSON.stringify(bodyObj),
      timeout: 5000
    }, (err, resp, data) => {
      if (err) {
        console.log(`[Loon] 请求第 ${page} 页失败: ${err}`);
        retrySamePage(page);
        return;
      }

      if (!data.trim().startsWith('{')) {
        console.log(`[Loon] 返回非 JSON，重试第 ${page} 页, 前 100 字: ${data.slice(0,100)}`);
        retrySamePage(page);
        return;
      }

      let json;
      try {
        json = JSON.parse(data);
      } catch (e) {
        console.log(`[Loon] JSON 解析错误，重试第 ${page} 页: ${e}`);
        retrySamePage(page);
        return;
      }

      // ... (脚本开头部分保持不变)

// ... (fetchPage 函数内部)

if (json.ret === 0 && json.infos && json.infos.length === 0) {
    console.log(`[Loon] 已经加载完所有商家，总页数: ${totalPages}`);
    // 存储到本地 mt_日期
    const date = new Date().getDate(); // 今天是几号
    const key = `mt_${date}`;
    let prevData = $persistentStore.read(key) || "";
    const newData = prevData + allLogs.join("\n") + "\n";
    
    // --- 在这里进行编码 ---
    const encodedData = encodeURIComponent(newData); // 确保中文不乱码
    
    $persistentStore.write(encodedData, key);
    $notification.post("美团领券", `✅ 完成，总页数: ${totalPages}`, "");
    $done();
    return;
}

// ... (脚本其他部分保持不变)

      const infos = json.infos || [];
      infos.forEach(item => {
        const name = item.poiBaseInfo?.name || "无名";
        let giftStr = "无券";
        if (item.giftInfo) {
          const coupon = item.giftInfo.coupon_amount || 0;
          const limit = item.giftInfo.order_amount_limit || 0;
          giftStr = `${Math.floor(limit/100)}-${Math.floor(coupon/100)}`;
        }
        const logLine = `${name} ${giftStr}`;
        console.log(logLine);
        allLogs.push(logLine);

        if (item.giftInfo?.gift_id) {
          console.log(item.giftInfo.gift_id);
          allLogs.push(item.giftInfo.gift_id);
        }
      });

      totalPages = page;

      setTimeout(() => {
        fetchPage(page + 1);
      }, randomDelay());
    });
  }

  function retrySamePage(page) {
    setTimeout(() => {
      fetchPage(page);
    }, randomDelay());
  }

  fetchPage(1);
})();