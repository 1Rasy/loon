const req_url = $request.url;
let rsp_body = "{}";

if (typeof $response !== 'undefined' && $response !== null) {
    rsp_body = $response.body;
}

// 匹配目标 URL
if (req_url.includes("offsiteact.meituan.com/act/ge/queryPoiByRecallBiz")) {
    console.log('美团商家优惠券抓取开始');

    // 推送通知
    if (typeof $notification !== 'undefined' && $notification.post) {
        $notification.post('美团优惠券抓取✅', '', '');
    }

    try {
        let dataObj = JSON.parse(rsp_body);
        let infos = dataObj.infos || [];

        infos.forEach(item => {
            let name = item.poiBaseInfo?.name;
            let gift = item.giftInfo;

            if (name && gift) {
                let gift_id = gift.gift_id;
                let coupon_amount = gift.coupon_amount;
                let order_amount_limit = gift.order_amount_limit;

                console.log(`店铺名：${name}，券码：${gift_id}，满减：${order_amount_limit}-${coupon_amount}`);
            }
        });
    } catch (e) {
        console.log('解析响应体失败', e);
    }
}

// ✅ 返回原始响应体，保证 App 正常加载
$done({ body: rsp_body });