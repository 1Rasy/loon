#!name=领美团的
#!icon=https://github.com/Toperlock/Quantumult/raw/main/icon/Doraemon/Doraemon-1096.png

[Argument]
/*津贴提取 = switch,false,tag=津贴提取*/
美团领券 = switch,false,tag=领券提取
自动翻页 = switch,false,tag=自动翻页
提取cookie = switch,false,tag=提取cookie
/*晓晓测试 = switch,false,tag=晓晓测试*/

[Script]
/*
cron "17 7 * * *" script-path=https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/xxyx/xxyx_signin.js, timeout=300, tag=晓晓优选每日任务, img-url=https://raw.githubusercontent.com/fmz200/wool_scripts/main/icons/apps/xxyx_01.jpeg
http-response ^https:\/\/xxyx-client-api\.xiaoxiaoyouxuan\.com\/my script-path=https://loon-nine.vercel.app/xxyx.js, requires-body=true, timeout=60, tag=晓晓测试, enable={晓晓测试}
http-response ^https:\/\/adapi\.waimai\.meituan\.com\/api\/ad\/landingPage script-path=https://loon-nine.vercel.app/loon.js, requires-body=true, timeout=60, tag=提取津贴, enable={津贴提取}
*/

http-response ^https:\/\/offsiteact\.meituan\.com\/act\/ge\/queryPoiByRecallBiz script-path=https://loon-nine.vercel.app/美团.js, requires-body=true, timeout=60, tag=美团领券, enable={美团领券}

http-response ^https:\/\/offsiteact\.meituan\.com\/act\/ge\/queryPoiByRecallBiz script-path=https://loon-nine.vercel.app/翻页.js, requires-body=true, timeout=60, tag=领券翻页, enable={自动翻页}

http-response ^https:\/\/offsiteact\.meituan\.com\/act\/ge\/queryPoiByRecallBiz script-path=https://loon-nine.vercel.app/mt_cookie.js, requires-body=true, timeout=60, tag=美团cookie, enable={提取cookie}

[MITM]
hostname = adapi.waimai.meituan.com, offsiteact.meituan.com, gw.xiaocantech.com
[rewrite]
^https:\/\/gw\.xiaocantech\.com\/rpc response-body-replace-regex "mt_pwd":\".+\" "mt_pwd":""
