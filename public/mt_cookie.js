/**
 * @script-type http-request
 * @description 抓取并保存美团请求头中的 cookie 和 mtgsig
 */

(() => {
  try {
    const url = $request.url || "";
    const target = "offsiteact.meituan.com/act/ge/queryPoiByRecallBiz";

    if (url.includes(target)) {
      const headers = $request.headers || {};
      const cookie = headers["cookie"] || "";
      const mtgsig = headers["mtgsig"] || "";

      let stored = {
        time: new Date().toISOString(),
        cookie,
        mtgsig
      };

      // 写入本地存储
      const success = $persistentStore.write(JSON.stringify(stored), "meituan_auth");

      if (success) {
        $notification.post("✅ 美团 Cookie 抓取成功", "", "已保存 cookie 和 mtgsig");
        console.log("[Loon] 已保存美团认证信息: " + JSON.stringify(stored));
      } else {
        $notification.post("❌ 美团 Cookie 抓取失败", "", "写入本地存储失败");
      }
    }
  } catch (e) {
    console.log("[Loon] 脚本错误: " + e.message);
  } finally {
    // 不修改请求，直接放行
    $done({});
  }
})();