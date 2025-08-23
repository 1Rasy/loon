const req_url = $request.url;
const req_headers = $request.headers;
const req_body = $request.body;
let rsp_body = "{}";

// 如果有响应体，赋值
if (typeof $response !== 'undefined' && $response !== null) {
  rsp_body = $response.body;
}

if (req_url.includes("offsiteact.meituan.com/act/ge/queryPoiByRecallBiz")) {
  try {
    let dataObj = JSON.parse(rsp_body || '{}');
    let infos = dataObj.infos || [];

    infos.forEach(item => {
      if (item.poiBaseInfo) {   // ✅ 只处理有 poiBaseInfo 的请求
        let name = item.poiBaseInfo.name;
        let gift = item.giftInfo;

        if (gift && gift.gift_id) {
          // 满减额度换算：1000-200 => 10-2
          let full = gift.order_amount_limit / 100;
          let minus = gift.coupon_amount / 100;

          let logText = `${name} ${full}-${minus}\n${gift.gift_id}`;
          console.log(logText);

          $notification(
            "美团商家信息获取成功✅",
            "",
            logText
          );
        }
      }
    });
  } catch (e) {
    console.log('解析失败:', e);
  }
}

// ✅ 返回原始响应体，保证 App 正常加载
$done({ body: rsp_body });