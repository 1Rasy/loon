/**
 * 自动翻页请求并提取美团商家优惠信息
 */

let url = "https://offsiteact.meituan.com/act/ge/queryPoiByRecallBiz?yodaReady=h5&csecplatform=4&csecversion=4.0.2";

// ------------------- 请求头配置 -------------------
let headers = {
  "accept-encoding": "gzip, deflate, br",
  "accept": "*/*",
  "mtgsig": "【这里填你实时抓到的mtgsig】", // 必须是最新的
  "origin": "https://offsiteact.meituan.com",
  "content-type": "application/json;charset=utf-8",
  "cookie": "【这里填抓到的完整cookie】",
  "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X)...",
  "referer": "https://offsiteact.meituan.com/web/hoae/collection_waimai_v8/index.html?...",
};

// ------------------- 请求体模板 -------------------
let bodyTemplate = {
  "lat": 22.99985,
  "lon": 113.120419,
  "geoType": "GCJ02",
  "geoSource": "html",
  "geoAccuracy": 9,
  "mediumParams": {
    "recallBizId": "cpsH5Coupon",
    "bizId": "0c3bfd35279b4140b3bd8ecbc41301d6",
    "mediumSrc1": "0c3bfd35279b4140b3bd8ecbc41301d6",
    "scene": "CPS_SELF_SRC",
    "pageSrc1": "CPS_SELF_OUT_SRC_H5_LINK",
    "pageSrc2": "0c3bfd35279b4140b3bd8ecbc41301d6",
    "pageSrc3": "ef7b54947b474a3ebff3d911e4b36f80",
    "activityId": "6",
    "mediaPvId": "dafkdsajffjafdfs",
    "mediaUserId": "10086",
    "outActivityId": "6",
    "hoaePageV": "8",
    "p": "993752907000602624"
  },
  "appContainer": "UNKNOW",
  "rootPvId": "d9742403-65ca-40dd-abfe-85eb849a678f",
  "pagePvId": "459940ed-6256-4953-be82-a9c6942c05e6",
  "pageSessionId": "bd67809e-4dba-42a6-ad88-77b2aab1f352",
  "outerPvId": "",
  "contentPvId": "",
  "recallBizId": "cpsSelfCouponAll",
  "pageNo": 1, // 👈 会修改翻页
  "hasMore": true,
  "phone": "135****6923",
  "categoryTypeList": ["0"],
  "channelType": "SELF",
  "riskParams": { "fpPlatform": 5 }
};

// ------------------- 翻页请求函数 -------------------
async function fetchPage(page) {
  return new Promise((resolve) => {
    let body = JSON.stringify({ ...bodyTemplate, pageNo: page });

    let params = {
      url,
      headers,
      body,
      timeout: 8000
    };

    $httpClient.post(params, function (error, response, data) {
      if (error) {
        console.log(`第${page}页请求失败: ` + error);
        return resolve([]);
      }

      try {
        let json = JSON.parse(data);
        let infos = json.infos || [];

        let results = [];
        infos.forEach(item => {
          let name = item.poiBaseInfo?.name;
          let gift = item.giftInfo;
          if (name && gift) {
            let gift_id = gift.gift_id;
            let coupon_amount = (gift.coupon_amount || 0) / 100; // 单位换算
            let order_amount_limit = (gift.order_amount_limit || 0) / 100;

            results.push(`${name} ${order_amount_limit}-${coupon_amount}\n${gift_id}`);
          }
        });
        resolve(results);
      } catch (e) {
        console.log(`第${page}页解析失败: ` + e.message);
        resolve([]);
      }
    });
  });
}

// ------------------- 主流程 -------------------
(async () => {
  let allResults = [];

  for (let i = 1; i <= 10; i++) {
    let res = await fetchPage(i);
    allResults.push(...res);
  }

  if (allResults.length > 0) {
    console.log("✅ 抓取结果：\n" + allResults.join("\n"));
    if ($notification && $notification.post) {
      $notification.post("美团优惠券抓取✅", "", allResults.join("\n\n"));
    }
  } else {
    console.log("⚠️ 没有获取到商家信息");
  }

  $done({ body: rsp_body });
})();