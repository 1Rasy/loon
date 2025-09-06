/**
 * http-request 脚本（触发示例：拦截 httpbin.org/get）
 */

(() => {
  try {
    if (!$request || !$request.headers) return $done({});

    const headers = $request.headers;
    let storageKey = null;
    let codeRaw = null;

    // 遍历 headers，找 mt_au_xxx:code
    for (const k in headers) {
      if (/^mt_au_\d{3}\*{4}\d{4}$/i.test(k)) {
        storageKey = k;
        codeRaw = String(headers[k] || "").trim();
        break;
      }
    }

    if (!storageKey || !codeRaw) {
      console.log("[Loon] 未在请求头中找到 mt_au_xxx:code 格式的数据，跳过。");
      return $done({});
    }

    // 去掉前缀，显示更简洁
    const displayKey = storageKey.replace(/^mt_au_/, "");

    console.log(`[Loon] 解析到账号Key="${displayKey}", 券码="${codeRaw}"`);

    // 取出账号
    const raw = $persistentStore.read(storageKey);
    if (!raw) {
      console.log(`[Loon] 未找到本地账号数据: ${displayKey}`);
      return $done({});
    }

    let account;
    try {
      account = JSON.parse(raw);
    } catch (e) {
      console.log(`[Loon] 解析 ${displayKey} 数据失败: ${e.message}`);
      return $done({});
    }

    if (!account.cookie || !account.mtgsig) {
      console.log(`[Loon] 账号数据缺少 cookie 或 mtgsig: ${displayKey}`);
      return $done({});
    }

    // 组装领券请求
    const targetUrl = "https://offsiteact.meituan.com/act/ge/recv_ver4_multi?yodaReady=h5&csecplatform=4&csecversion=4.0.2";
    const mtgsigHeader = (typeof account.mtgsig === "string") ? account.mtgsig : JSON.stringify(account.mtgsig);
    const headersOut = {
      "content-type": "application/json;charset=utf-8",
      "cookie": account.cookie,
      "mtgsig": mtgsigHeader,
      "accept": "*/*",
      "accept-language": "zh-CN,zh-Hans;q=0.9",
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
      "origin": "https://offsiteact.meituan.com",
      "referer": "https://offsiteact.meituan.com/web/hoae/collection_waimai_v8/index.html"
    };

    const bodyObj = {
      lat: 22.99985,
      lon: 113.120419,
      geoType: "GCJ02",
      geoSource: "html",
      geoAccuracy: 9,
      mediumParams: {
        recallBizId: "cpsH5Coupon",
        bizId: "0c3bfd35279b4140b3bd8ecbc41301d6",
        mediumSrc1: "0c3bfd35279b4140b3bd8ecbc41301d6",
        scene: "CPS_SELF_SRC",
        pageSrc1: "CPS_SELF_OUT_SRC_H5_LINK",
        pageSrc2: "0c3bfd35279b4140b3bd8ecbc41301d6",
        pageSrc3: "e15d0d4258004ba5b44c1c85e4db4084",
        activityId: "6",
        mediaPvId: "dafkdsajffjafdfs",
        mediaUserId: "10086",
        outActivityId: "6",
        hoaePageV: "8",
        p: "1016502508465025024"
      },
      appContainer: "UNKNOW",
      rootPvId: "32288adc-2c44-4827-9a80-79c532aae802",
      pagePvId: "5b7a50da-45f4-46f9-848c-67544f75c551",
      pageSessionId: "958f030a-540f-49a5-ab10-43d2b65f7cd5",
      giftIds: [codeRaw],
      recallBizId: "cpsSelfCouponAll"
    };

    const params = {
      url: targetUrl,
      timeout: 8000,
      headers: headersOut,
      alpn: "h2",
      body: JSON.stringify(bodyObj)
    };

    $httpClient.post(params, (err, resp, data) => {
      try {
        if (err) {
          console.log(`[Loon] ${displayKey} 领券出错: ${err}`);
          $notification.post("领券失败", displayKey, String(err));
        } else {
          console.log(`[Loon] ${displayKey} 领券响应状态: ${resp && resp.status}`);
          console.log(`[Loon] ${displayKey} 响应体: ${data}`);

          let msg = "";
          try {
            const obj = JSON.parse(data);
            if (Array.isArray(obj.showMsgs) && obj.showMsgs.length) {
              msg = obj.showMsgs.join(" / ");
            } else if (Array.isArray(obj.msgs) && obj.msgs.length) {
              msg = obj.msgs.join(" / ");
            } else if (obj.msg) {
              msg = obj.msg;
            }
          } catch (e) {
            msg = "响应解析失败";
          }

          $notification.post("领券结果", displayKey, msg || `状态: ${resp && resp.status}`);
        }
      } finally {
        $done({});
      }
    });

  } catch (e) {
    console.log("[Loon] 脚本执行异常:", e);
    $done({});
  }
})();