(() => {
  try {
    const target = "offsiteact.meituan.com/act/ge/queryPoiByRecallBiz";
    const now = Date.now();

    if (!$request.url.includes(target)) return $done({});

    // 解析请求体中的 phone
    let phone = "";
    try {
      const bodyObj = JSON.parse($request.body || "{}");
      phone = bodyObj.phone || "";
      if (!phone) return $done({}); // 没有 phone 则跳过
    } catch (e) {
      console.log("[Loon] 请求体解析失败");
      return $done({});
    }

    // 只取手机号前三位作为存储 key
    const phonePrefix = phone.slice(0, 3);
    const storeKey = `mt_au_${phonePrefix}`;

    const headers = $request.headers || {};
    const cookie = headers["cookie"] || "";
    const mtgsigRaw = headers["mtgsig"] || "";
    if (!cookie || !mtgsigRaw) return $done({});

    let mtgsig;
    try {
      mtgsig = JSON.parse(mtgsigRaw);
      mtgsig.a2 = now; // 本地生成 a2
    } catch (e) {
      console.log("[Loon] mtgsig 解析失败");
      return $done({});
    }

    const toStore = {
      phone,
      time: new Date(now).toISOString(),
      cookie,
      mtgsig
    };

    // 直接存储为单独的 key，不再用数组
    const success = $persistentStore.write(JSON.stringify(toStore), storeKey);
    if (success) {
      $notification.post("美团Cookie", `✅ ${phone}获取成功`, "");
      console.log(`[Loon] 已保存账号 ${phone} (${phonePrefix}) 的信息: ` + JSON.stringify(toStore));
    } else {
      console.log("[Loon] 保存本地失败");
    }

  } catch (e) {
    console.log("[Loon] 脚本错误: " + e.message);
  } finally {
    $done({});
  }
})();
