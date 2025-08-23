const req_url = $request.url;
const req_headers = $request.headers;
const req_body = $request.body;
let rsp_body = "{}";

if (req_url.includes("adapi.waimai.meituan.com/api/ad/landingPage")) {
    console.log('美团 开始');
    // 推送通知，适配 Loon / Surge / QuanX
    if (typeof $notification !== 'undefined' && $notification.post) {
        $notification.post('美团token 获取成功✅', '', '');
    } else {
        console.log('通知：美团token 获取成功✅');
    }
}