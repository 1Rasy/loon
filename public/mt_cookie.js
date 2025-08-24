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

    // 本地存储 key
    const storeKey = `mt_au`;

    // 读取本地上次抓取信息（多账号数组）
    let storedArr = [];
    const storedStr = $persistentStore.read(storeKey);
    if (storedStr) {
      try {
        storedArr = JSON.parse(storedStr);
      } catch (e) {
        console.log("[Loon] 本地存储解析错误，重置数组");
        storedArr = [];
      }
    }

    // 检查该手机号是否已存在，并获取上次抓取时间
    let existingIndex = storedArr.findIndex(item => item.phone === phone);
    let lastTime = existingIndex !== -1 ? new Date(storedArr[existingIndex].time).getTime() : 0;

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
      phone,
      time: new Date(now).toISOString(),
      cookie,
      mtgsig
    };

    if (existingIndex !== -1) {
      // 更新已有账号信息
      storedArr[existingIndex] = toStore;
    } else {
      // 新增账号信息
      storedArr.push(toStore);
    }

    const success = $persistentStore.write(JSON.stringify(storedArr), storeKey);
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
