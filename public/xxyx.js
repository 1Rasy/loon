/******************************************
 * 晓晓优选 获取cookie
 *
 * @url https://xxyx-client-api.xiaoxiaoyouxuan.com/my
 * @keyword fmz200_xxyx_token 打开APP点击“我的”页面获取
 ******************************************/
if ($request.url.includes("xxyx-client-api.xiaoxiaoyouxuan.com/my")) {
  console.log('晓晓优选 开始');
  const token = $request.headers['xx-token'];
  let rsp_body = $response.body || "{}";
  let rsp_data = JSON.parse(rsp_body).data;

  if (token && rsp_data) {
    let mobile = rsp_data.mobile;
    let username = rsp_data.nick;
    let avatar = rsp_data.avatar;
    console.log(`获取到uid：${mobile}，username：${username}`);

    let cache = $.read("#fmz200_xxyx_token") || "[]";
    console.log("读取缓存数据：" + cache);

    let json_data = JSON.parse(cache);
    updateOrAddObject(json_data, "mobile", mobile, "username", username, "token", token, "avatar", avatar);
    const cacheValue = JSON.stringify(json_data, null, "\t");
    
    $.write(cacheValue, '#fmz200_xxyx_token');
    $.notify('晓晓优选token 获取成功✅', '', '');
  } else {
    $.notify('晓晓优选token 获取失败❗️', '', '');
  }
}
