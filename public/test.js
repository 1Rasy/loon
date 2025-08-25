

const url = $request.url;
const headers = $request.headers;

// 判断目标网址 + 请求头
if (url.includes("https://httpbin.org") && headers && headers["123"]) {
  $notification.post("测试脚本", "检测成功", "https://httpbin.org/get 请求头包含 123");
}

$done({});