/**
 * http-request 脚本（触发示例：拦截 httpbin.org/get）
 * 功能：
 *  - 遍历请求头，查找形如 "手机号:券码" 的条目（支持 ":" 或 "："）
 *  - 从 mt_au（数组）中选择对应手机号的账号（支持部分/掩码匹配）
 *  - 用该账号的 cookie & mtgsig 发起美团领券请求（recv_ver4_multi）
 *
 * 使用：
 *  - 在快捷指令中向 https://httpbin.org/get 发请求，任意 header 中放 "135:abcd1234" 即可触发
 *  - 本地账号存储 key 为 "mt_au"，格式为 [{ phone:"135****6923", cookie:"...", mtgsig:{...}, time:"..." }, ...]
 */

(() => {
  try {
    if (!$request || !$request.headers) return $done({});

    // 1) 在所有请求头里查找第一个形如 phone:code 的项（同时检查 header 名与 header 值）
    const headers = $request.headers;
    const couponRegex = /([0-9\*]{2,15})\s*[:：]\s*(\S+)/; // phone 允许 *，长度宽松
    let phoneRaw = null;
    let codeRaw = null;
    for (const k in headers) {
      const v = String(headers[k] || "");
      // 先检查 header 值，再检查 header 名
      let m = v.match(couponRegex) || String(k).match(couponRegex);
      if (m) {
        phoneRaw = (m[1] || "").trim();
        codeRaw = (m[2] || "").trim();
        break;
      }
    }

    if (!phoneRaw || !codeRaw) {
      // 没找到 coupon header，直接放行（不干预原始请求）
      console.log("[Loon] 未在请求头中找到 phone:code 格式的数据，跳过。");
      return $done({});
    }

    console.log(`[Loon] 解析到 phone: "${phoneRaw}", code: "${codeRaw}"`);

    // 2) 读取 mt_au（数组）
    const storeKey = "mt_au";
    const raw = $persistentStore.read(storeKey) || "[]";
    let accounts = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) accounts = parsed;
      else {
        console.log("[Loon] mt_au 解析后不是数组，初始化为空数组");
        accounts = [];
      }
    } catch (e) {
      console.log("[Loon] 解析 mt_au 失败: " + e.message);
      accounts = [];
    }

    if (!accounts.length) {
      console.log("[Loon] mt_au 无账号数据或为空数组");
      // 仍放行原始请求
      return $done({});
    }

    // 3) 匹配账号：考虑掩码与部分匹配
    function normalizeDigits(s) {
      return String(s || "").replace(/\D/g, "");
    }
    const phoneDigits = normalizeDigits(phoneRaw);
    let account = null;
    for (const acc of accounts) {
      if (!acc) continue;
      const pAlt = acc.phone || acc.mobile || acc.mobileNo || "";
      if (!pAlt) continue;
      // 精确包含判断（包含掩码或明文）
      if (pAlt === phoneRaw) { account = acc; break; }
      if (pAlt.indexOf(phoneRaw) !== -1) { account = acc; break; }
      const accDigits = normalizeDigits(pAlt);
      if (phoneDigits && accDigits) {
        // 如果 header 给的是前面几位（如 135）或末尾几位，也能匹配
        if (accDigits === phoneDigits || accDigits.indexOf(phoneDigits) !== -1 || phoneDigits.indexOf(accDigits) !== -1) {
          account = acc; break;
        }
        // 如果 header 只是前三位（如 135），则匹配 account 的开头
        if (accDigits.startsWith(phoneDigits) || accDigits.endsWith(phoneDigits)) { account = acc; break; }
      }
    }

    if (!account) {
      console.log(`[Loon] 未在 mt_au 中找到匹配手机号: ${phoneRaw}`);
      return $done({});
    }

    if (!account.cookie || !account.mtgsig) {
      console.log(`[Loon] 账号信息不完整（缺 cookie 或 mtgsig）：${phoneRaw}`);
      return $done({});
    }

    // 4) 组装领券请求（使用你之前提供的 recv_ver4_multi 的 URL + body，只替换 cookie 与 mtgsig，以及 giftIds）
    const targetUrl = "https://offsiteact.meituan.com/act/ge/recv_ver4_multi?yodaReady=h5&csecplatform=4&csecversion=4.0.2";
    const mtgsigHeader = (typeof account.mtgsig === "string") ? account.mtgsig : JSON.stringify(account.mtgsig);
    const headersOut = {
      "content-type": "application/json;charset=utf-8",
      "sec-fetch-mode": "cors",
      "accept-language": "zh-CN,zh-Hans;q=0.9",
      "sec-fetch-site": "same-origin",
      "cookie": account.cookie,
      "mtgsig": mtgsigHeader,
      "sec-fetch-dest": "empty",
      "accept": "*/*",
      "accept-encoding": "gzip, deflate, br",
      "origin": "https://offsiteact.meituan.com",
      "referer": "https://offsiteact.meituan.com/web/hoae/collection_waimai_v8/index.html",
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1"
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
        pageSrc3: "ef7b54947b474a3ebff3d911e4b36f80",
        activityId: "6",
        mediaPvId: "dafkdsajffjafdfs",
        mediaUserId: "10086",
        outActivityId: "6",
        hoaePageV: "8",
        p: "993752907000602624"
      },
      appContainer: "UNKNOW",
      rootPvId: "32288adc-2c44-4827-9a80-79c532aae802",
      pagePvId: "5b7a50da-45f4-46f9-848c-67544f75c551",
      pageSessionId: "958f030a-540f-49a5-ab10-43d2b65f7cd5",
      outerPvId: "",
      contentPvId: "",
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

    // 5) 发起请求并在回调中通知结果，然后释放脚本资源 ($done)
    $httpClient.post(params, function (err, resp, data) {
      try {
        if (err) {
          console.log(`[Loon] ${phoneRaw} 领券请求出错: ${err}`);
          $notification.post("领券失败", `${phoneRaw}`, String(err));
        } else {
          console.log(`[Loon] ${phoneRaw} 领券响应状态: ${resp && resp.status}`);
          console.log(`[Loon] ${phoneRaw} 领券响应体: ${data}`);
          $notification.post("领券结果", `${phoneRaw}`, `状态: ${resp && resp.status}`);
        }
      } catch (e) {
        console.log("[Loon] 回调处理异常: " + e.message);
      } finally {
        $done({});
      }
    });

  } catch (e) {
    console.log("[Loon] 脚本顶层异常: " + e.message);
    $done({});
  }
})();