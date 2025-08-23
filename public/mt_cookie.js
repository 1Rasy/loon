/**
 * @script-type http-request
 * @description 抓取并保存美团 cookie 和 mtgsig，仅首次获取
 */

(() => {
  try {
    const url = $request.url || "";
    const target = "offsiteact.meituan.com/act/ge/queryPoiByRecallBiz";

    if (!url.includes(target)) return $done({});

    // 检查是否已保存过（本地标记）
    const doneFlag = $persistentStore.read("mt_au_done");
    if (doneFlag === "true") {
      // 已经获取过，直接跳过
      return $done({});
    }

    const headers = $request.headers || {};
    const cookie = headers["cookie"] || "";
    const mtgsig = headers["mtgsig"] || "";

    if (!cookie || !mtgsig) {
      // 未获取到关键字段，跳过
      return $done({});
    }

    // 保存完整信息
    const stored = {
      time: new Date().toISOString(),
      cookie,
      mtgsig
    };

    const success = $persistentStore.write(JSON.stringify(stored), "mt_au");
    if (success) {
      // 设置完成标记，后续请求直接跳过
      $persistentStore.write("true", "mt_au_done");
      $notification.post("✅ 美团 Cookie 抓取成功", "", "已保存完整 cookie 和 mtgsig");
      console.log("[Loon] 已保存美团认证信息: " + JSON.stringify(stored));
    }
  } catch (e) {
    console.log("[Loon] 脚本错误: " + e.message);
  } finally {
    $done({});
  }
})();