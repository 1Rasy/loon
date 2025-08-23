/**
 * @script-type http-request
 * @description 抓取并保存美团请求头中的 cookie 和 mtgsig（避免重复通知）
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

      // 读取旧数据
      const oldData = $persistentStore.read("mt_au");
      let needNotify = false;

      if (!oldData) {
        // 没有旧数据 → 必须通知
        needNotify = true;
      } else {
        try {
          const old = JSON.parse(oldData);
          if (old.cookie !== cookie || old.mtgsig !== mtgsig) {
            // 新旧数据不一样 → 通知
            needNotify = true;
          }
        } catch (_) {
          needNotify = true; // 如果旧数据解析失败，也更新
        }
      }

      // 写入新数据
      const success = $persistentStore.write(JSON.stringify(stored), "mt_au");

      if (success && needNotify) {
        $notification.post("✅ 美团 Cookie 更新", "", "已保存新的 cookie 和 mtgsig");
        console.log("[Loon] 已更新美团认证信息: " + JSON.stringify(stored));
      }
    }
  } catch (e) {
    console.log("[Loon] 脚本错误: " + e.message);
  } finally {
    $done({});
  }
})();