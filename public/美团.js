const req_url = $request.url;
let rsp_body = "{}";

// ✅ 设置你要过滤的店铺名字，支持模糊匹配
const filterNames = [
    "烧烤"
];

if (typeof $response !== 'undefined' && $response !== null) {
    rsp_body = $response.body;
}

if (req_url.includes("offsiteact.meituan.com/act/ge/queryPoiByRecallBiz")) {
    console.log('美团商家优惠券抓取开始');

    try {
        let dataObj = JSON.parse(rsp_body);
        let infos = dataObj.infos || [];

        infos.forEach(item => {
            if (item.poiBaseInfo && item.giftInfo) {
                let name = item.poiBaseInfo.name;

                // 过滤：只有名字里包含白名单关键字才继续
                if (!filterNames.some(keyword => name.includes(keyword))) return;

                let gift_id = item.giftInfo.gift_id;
                let coupon_amount = item.giftInfo.coupon_amount / 100;      
                let order_amount_limit = item.giftInfo.order_amount_limit / 100;

                let line1 = name ;
                let line2 = gift_id;
                let line3 = order_amount_limit-coupon_amount; 
                
                console.log(line1);
                console.log(line2);

                // ✅ 简化通知
                if (typeof $notification !== 'undefined' && $notification.post) {
                    $notification.post(line1, line3, line2, { clipboard: `${line1}\n${line2}` });
                }
            }
        });

    } catch (e) {
        console.log('解析响应体失败', e);
    }
}

$done({ body: rsp_body });