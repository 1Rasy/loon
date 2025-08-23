const req_url = $request.url;
const req_headers = $request.headers;
const req_body = $request.body;
let rsp_body = "{}";

if (req_url.includes("adapi.waimai.meituan.com/api/ad/landingPage")) {
    console.log('美团 开始');
    $notification('美团token 获取成功✅', '', '');
}
