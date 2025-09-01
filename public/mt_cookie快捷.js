/**
 * Loon Rewrite 脚本：获取美团 Cookie 示例
 * 触发条件：请求 URL = https://httpbin.org/get
 */
(() => {
  try {
    const target = "httpbin.org/get";
    const now = Date.now();

    // 检查请求 URL 是否包含目标网址
    if (!$request.url.includes(target)) return $done({});

    // 解析请求体
    let bodyObj = {};
    try {
      bodyObj = JSON.parse($request.body || "{}");
    } catch (e) {
      console.log("[Loon] 请求体解析失败");
      return $done({});
    }

    // 获取手机号
    const phone = bodyObj.phone || "";
    if (!phone) return $done({});

    // 获取 rootPvId 和 pageSrc3
    const rootPvId = bodyObj.rootPvId || "";
    const pageSrc3 = bodyObj.pageSrc3 || "";

    // 存储 key 直接用完整手机号
    const storeKey = `mt_au_${phone}`;

    // 读取已有数据
    let storedObj = {};
    const storedStr = $persistentStore.read(storeKey);
    if (storedStr) {
      try {
        storedObj = JSON.parse(storedStr);
      } catch (e) {
        console.log("[Loon] 本地存储解析失败，初始化为空对象");
      }
    }

    // 如果已经存在并且 1 分钟内更新过，就不再重复通知
    if (storedObj.phone === phone && now - (new Date(storedObj.time).getTime() || 0) < 1 * 60 * 1000) {
      return $done({});
    }

    // 提取 cookie 和 mtgsig
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

    // 构建存储对象
    const toStore = {
      phone,
      time: new Date(now).toISOString(),
      cookie,
      mtgsig,
      rootPvId,
      pageSrc3
    };

    // 存储
    const success = $persistentStore.write(JSON.stringify(toStore), storeKey);
    if (success) {
      $notification.post("美团Cookie", `✅ ${phone}获取成功`, "");
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