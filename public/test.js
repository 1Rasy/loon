/**
 * Loon - http-request 脚本
 * 假设请求头就是 "135:xxxx"
 */

let headers = $request.headers;
let phone, code;

// 遍历 headers，找出形如 "135:xxxx" 的键值
for (let key in headers) {
  if (/^\d{3}$/.test(key)) {  // key 必须是 3 位数字
    phone = key;              // 例如 135
    code = headers[key];      // 例如 xxxx
    console.log(`[Loon] 匹配到请求头: ${key}: ${headers[key]}`); // 新增打印
    break;
  }
}

if (!phone || !code) {
  console.log("[Loon] 请求头中未找到 phone:code 格式的数据");
  $done({});
}

// 打印确认
console.log(`[Loon] 捕获到手机号: ${phone}, 券码: ${code}`);

// 假设 mt_au 是本地存储的账号映射
let mt_au = {
  "135": { token: "xxxx_token1" },
  "130": { token: "xxxx_token2" }
};

// 取对应手机号的账号信息
let account = mt_au[phone];
if (!account) {
  console.log(`[Loon] 未找到手机号 ${phone} 的账号信息`);
  $done({});
}

// 这里执行领券逻辑
// 例如调用美团接口
let url = "https://example.com/coupon/receive";
let body = { code: code };

$httpClient.post({
  url,
  headers: {
    "Authorization": `Bearer ${account.token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(body)
}, (err, resp, data) => {
  if (err) {
    console.log(`[Loon] 请求失败: ${err}`);
  } else {
    console.log(`[Loon] 领券结果: ${data}`);
  }
  $done({});
});