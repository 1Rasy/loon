const req_url = $request.url;
let rsp_body = "{}";

// ✅ 设置你要过滤的店铺名字，支持模糊匹配
const filterNames = [
    "爷爷不泡茶"
];

if (typeof $response !== 'undefined' && $response !== null) {
    rsp_body = $response.body;
}

if (req_url.includes("offsiteact.meituan.com/act/ge/queryPoiByRecallBiz")) {
    console.log('美团商家优惠券抓取开始');

    try {
        let dataObj = JSON.parse(rsp_body);
        let infos = dataObj.infos || [];
        let notifyMsg = "";

        infos.forEach(item => {
            if (item.poiBaseInfo && item.giftInfo) {
                let name = item.poiBaseInfo.name;

                // 过滤：只有名字里包含白名单关键字才继续
                let match = filterNames.some(keyword => name.includes(keyword));
                if (!match) return;

                let gift_id = item.giftInfo.gift_id;
                let coupon_amount = item.giftInfo.coupon_amount / 100;      
                let order_amount_limit = item.giftInfo.order_amount_limit / 100;

                let line1 = `${name} ${order_amount_limit}-${coupon_amount}`;
                let line2 = gift_id;

                console.log(line1);
                console.log(line2);

                notifyMsg += `${line1}\n${line2}\n\n`;
            }
        });

        if (notifyMsg.trim()) {
            if (typeof $notification !== 'undefined' && $notification.post) {
                $notification.post('美团优惠券抓取✅', '', notifyMsg.trim());
            }
        }
    } catch (e) {
        console.log('解析响应体失败', e);
    }
}

$done({ body: rsp_body });