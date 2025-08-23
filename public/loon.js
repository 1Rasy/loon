const req_url = $request.url;
let rsp_body = "{}";

// 如果有响应体
if (typeof $response !== 'undefined' && $response !== null) {
    rsp_body = $response.body;
}

// 匹配目标 URL
if (req_url.includes("adapi.waimai.meituan.com/api/ad/landingPage")) {
    console.log('美团 开始');

    // 推送通知
    if (typeof $notification !== 'undefined' && $notification.post) {
        $notification.post('美团token 获取成功✅', '', '');
    } else {
        console.log('通知：美团token 获取成功✅');
    }

    try {
        let dataObj = JSON.parse(rsp_body);
        // 先找到“虚拟列表”字段
        let virtualList = dataObj.data["虚拟列表"];
        if (virtualList && virtualList.string_data) {
            let stringData = JSON.parse(virtualList.string_data); // 第二层解析
            let adList = stringData.adList || [];

            adList.forEach(adStr => {
                let adObj = JSON.parse(adStr); // 第三层解析
                let name = adObj.poi_name;
                let link = adObj.scheme;
                if (name && link) {
                    console.log(`店铺名：${name}，链接：${link}`);
                }
            });
        }
    } catch (e) {
        console.log('解析响应体失败', e);
    }
}
$.done();