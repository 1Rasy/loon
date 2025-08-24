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

    const storeKey = "mt_au";

    // 读取本地上次抓取信息
    let storedArr = [];
    const storedStr = $persistentStore.read(storeKey);
    if (storedStr) {
      try {
        const parsed = JSON.parse(storedStr);
        if (Array.isArray(parsed)) {
          storedArr = parsed;
        } else {
          console.log("[Loon] 本地存储不是数组，初始化为空数组");
        }
      } catch (e) {
        console.log("[Loon] 本地存储解析失败，初始化为空数组");
      }
    }

    // 检查当前手机号是否存在且更新时间是否 < 10 分钟
    const index = storedArr.findIndex(item => item.phone === phone);
    if (index !== -1 && now - (new Date(storedArr[index].time).getTime() || 0) < 10 * 60 * 1000) {
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

    if (index !== -1) {
      // 更新已有账号
      storedArr[index] = toStore;
    } else {
      // 新增账号
      storedArr.push(toStore);
    }

    const success = $persistentStore.write(JSON.stringify(storedArr), storeKey);
    if (success) {
      $notification.post("", "✅ 美团 Cookie 抓取成功", "${phone}获取成功");
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
