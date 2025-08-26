const req_url = $request.url;
let rsp_body = "{}";

// 如果有响应体
if (typeof $response !== 'undefined' && $response !== null) {
    rsp_body = $response.body;
}

if (req_url.includes("adapi.waimai.meituan.com/api/ad/landingPage")) {
    console.log('美团 开始');

    try {
        let dataObj = JSON.parse(rsp_body);
        let virtualList = dataObj.data?.["虚拟列表"];
        let results = [];

        if (virtualList && virtualList.string_data) {
            let stringData = JSON.parse(virtualList.string_data); // 第二层解析
            let adList = stringData.adList || [];

            adList.forEach(adStr => {
                try {
                    let adObj = JSON.parse(adStr); // 第三层解析
                    let name = adObj.poi_name;
                    let link = adObj.scheme;
                    if (name && link) {
                        let msg = `店铺名：${name}\n链接：${link}`;
                        console.log(msg);
                        results.push(msg);
                    }
                } catch (e) {
                    console.log("单条广告解析失败", e);
                }
            });
        }

        // 只在有结果时通知一次
        if (results.length > 0) {
            if (typeof $notification !== 'undefined' && $notification.post) {
                $notification.post('美团token 获取成功✅', '', results.join("\n\n"));
            } else {
                console.log('通知：美团token 获取成功✅\n' + results.join("\n\n"));
            }
        }

    } catch (e) {
        console.log('解析响应体失败', e);
    }
}

$done({ body: rsp_body }); // 保证 App 正常加载