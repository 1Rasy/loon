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

    // 本地存储 key 根据 phone 动态生成
    const storeKey = `mt_au_${phone}`;

    // 读取本地上次抓取信息
    const storedStr = $persistentStore.read(storeKey);
    let lastTime = 0;
    if (storedStr) {
      try {
        const stored = JSON.parse(storedStr);
        lastTime = new Date(stored.time).getTime() || 0;
      } catch (e) {
        console.log("[Loon] 本地存储解析错误，重置时间");
        lastTime = 0;
      }
    }

    // 如果距离上次抓取 < 10 分钟，则跳过
    if (now - lastTime < 10 * 60 * 1000) {
      return $done({});
    }

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
      time: new Date(now).toISOString(),
      cookie,
      mtgsig
    };

    const success = $persistentStore.write(JSON.stringify(toStore), storeKey);
    if (success) {
      $notification.post("✅ 美团 Cookie 抓取成功", "", `${phone}`);
      console.log(`[Loon] 已保存账号 ${phone} 的信息: ` + JSON.stringify(toStore));
    } else {
      console.log("[Loon] 保存本地失败");
    }
  } catch (e) {
    console.log("[Loon] 脚本错误: " + e.message);
  } finally {
    $done({});
  }
})();
