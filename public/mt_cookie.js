/**
 * @script-type http-request
 * @description 美团 cookie/mtgsig 抓取脚本，每 10 分钟更新一次，mtgsig a2 本地生成
 */

(() => {
  try {
    const target = "offsiteact.meituan.com/act/ge/queryPoiByRecallBiz";
    const now = Date.now();

    // 仅处理目标请求
    if (!$request.url.includes(target)) return $done({});

    // 读取本地上次抓取信息
    const storedStr = $persistentStore.read("mt_au");
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
      // 本地生成 a2 时间戳
      mtgsig.a2 = now;
    } catch (e) {
      console.log("[Loon] mtgsig 解析失败");
      return $done({});
    }

    // 保存完整信息
    const toStore = {
      time: new Date(now).toISOString(),
      cookie,
      mtgsig
    };

    const success = $persistentStore.write(JSON.stringify(toStore), "mt_au");
    if (success) {
      $notification.post("✅ 美团 Cookie 抓取成功", "", "已保存完整 cookie 和 mtgsig（a2 本地生成）");
      console.log("[Loon] 已保存美团认证信息: " + JSON.stringify(toStore));
    } else {
      console.log("[Loon] 保存本地失败");
    }
  } catch (e) {
    console.log("[Loon] 脚本错误: " + e.message);
  } finally {
    $done({});
  }
})();
