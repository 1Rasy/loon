const req_url = $request.url;
let rsp_body = "{}";

if (typeof $response !== 'undefined' && $response !== null) {
    rsp_body = $response.body;
}

// 匹配目标 URL
if (req_url.includes("offsiteact.meituan.com/act/ge/queryPoiByRecallBiz")) {
    console.log('美团商家优惠券抓取开始');

    // 推送通知（只提示一次，不包含具体内容）
    if (typeof $notification !== 'undefined' && $notification.post) {
        $notification.post('美团优惠券抓取✅', '', '');
    }

    try {
        let dataObj = JSON.parse(rsp_body);
        let infos = dataObj.infos || [];

        infos.forEach(item => {
            if (item.poiBaseInfo && item.giftInfo) {
                let name = item.poiBaseInfo.name;
                let gift_id = item.giftInfo.gift_id;
                let coupon_amount = item.giftInfo.coupon_amount / 100;      // 除法换算
                let order_amount_limit = item.giftInfo.order_amount_limit / 100;

                // 按要求输出格式
                console.log(`${name} ${order_amount_limit}-${coupon_amount}`);
                console.log(gift_id);
            }
        });
    } catch (e) {
        console.log('解析响应体失败', e);
    }
}

// ✅ 返回原始响应体，保证 App 正常加载
$done({ body: rsp_body });