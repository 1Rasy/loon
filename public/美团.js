const req_url = $request.url;
let rsp_body = "{}";

if (typeof $response !== 'undefined' && $response !== null) {
    rsp_body = $response.body;
}

// 匹配目标 URL
if (req_url.includes("offsiteact.meituan.com/act/ge/queryPoiByRecallBiz")) {
    console.log('美团商家优惠券抓取开始');

    try {
        let dataObj = JSON.parse(rsp_body);
        let infos = dataObj.infos || [];
        let notifyMsg = "";

        infos.forEach(item => {
            if (item.poiBaseInfo && item.giftInfo) {
                let name = item.poiBaseInfo.name;
                let gift_id = item.giftInfo.gift_id;
                let coupon_amount = item.giftInfo.coupon_amount / 100;      // 除法换算
                let order_amount_limit = item.giftInfo.order_amount_limit / 100;

                let line1 = `${name} ${order_amount_limit}-${coupon_amount}`;
                let line2 = gift_id;

                // 控制台逐条打印
                console.log(line1);
                console.log(line2);

                // 通知里拼接
                notifyMsg += `${line1}\n${line2}\n\n`;
            }
        });

        // 如果有内容，推送一次通知
        if (notifyMsg.trim()) {
            if (typeof $notification !== 'undefined' && $notification.post) {
                $notification.post('美团优惠券抓取✅', '', notifyMsg.trim());
            }
        }
    } catch (e) {
        console.log('解析响应体失败', e);
    }
}

// ✅ 返回原始响应体，保证 App 正常加载
$done({ body: rsp_body });