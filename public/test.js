/**
 * 测试脚本
 * 目标：当检测到 www.rasy.com 发出的请求，并且请求头包含 "123" 时，弹出通知成功
 */

const url = $request.url;
const headers = $request.headers;

// 判断目标网址 + 请求头
if (url.includes("https://httpbin.org/get") && headers && headers["123"]) {
  $notification.post("测试脚本", "检测成功", "https://httpbin.org/get 请求头包含 123");
}

$done({});