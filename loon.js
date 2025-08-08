// 阻止 gw.xiaocantech.com 返回的剪贴板字段被复制
let body = $response.body;

try {
  let json = JSON.parse(body);

  if (json?.ul) {
    const clipFields = ["mt_pwd", "ele_pwd", "jd_pwd", "pwd"];
    clipFields.forEach(f => {
      if (json.ul[f]) {
        console.log(`已清空字段: ${f}`);
        json.ul[f] = "";
      }
    });
  }

  body = JSON.stringify(json);
} catch (e) {
  console.log("解析 JSON 失败:", e);
}

$done({ body });
