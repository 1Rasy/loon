/*
------------------------------------------
@Author: Sliverkiss
@Date: 2024.07.08
@Description: 小蚕霸王餐 日常任务、抽奖
------------------------------------------
脚本兼容：Surge、QuantumultX、Loon、Shadowrocket、Node.js
只测试过QuantumultX，其它环境请自行尝试

2024.07.19 更新内容：
- 增加自动领取挑战赛任务
- 增加自动提现，超过1块自动提现，可在boxjs打开，默认关闭

写本不易，你的支持就是我的动力。若不介意，可以顺手走一下邀请链接，复制文案到app打开即可。

复/&p致[330834256] 下载【小蚕霸王餐】 新用户可抽免单福利! 好运连连, 权益7天内有效 快去商店搜索下载「小蚕霸王餐」吧

环境变量:xcbwc_data
变量格式: [{"userId":"x-vayne","teemo":"x-teemo","token":"x-sivir","userName":"备注"},{"userId":"x-vayne","teemo":"x-teemo","token":"x-sivir","userName":"备注"}]

重写:打开软件，获取token后及时关闭，避免不必要的冲突

[rewrite_local]
^https:\/\/gw\.xiaocantech\.com\/rpc url script-response-body https://gist.githubusercontent.com/Sliverkiss/250a02315f0a2c99f42da3b3573375c8/raw

[MITM]
hostname = gw.xiaocantech.com

⚠️【免责声明】
------------------------------------------
1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
*/
const $ = new Env("小蚕霸王餐");
const notify = $.isNode() ? require('./sendNotify') : '';

// 环境变量解析
let accounts = JSON.parse(process.env.xcbwc_data || '[]');

// 基础配置
const BASE_URL = 'https://gw.xiaocantech.com/rpc';
const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
};

// BoxJS 配置（自动提现开关）
const autoWithdraw = $.getval('xcbwc_auto_withdraw', false);

// 日常任务函数
async function doDailyTasks(account) {
  const { userId, teemo, token, userName } = account;
  const headers = { ...HEADERS, token };

  // 签到
  const signRes = await $.post({ url: `${BASE_URL}/signIn`, headers, body: JSON.stringify({ userId }) });
  $.log(`[${userName}] 签到结果: ${signRes.message}`);

  // 获取任务列表
  const taskList = await $.get({ url: `${BASE_URL}/taskList`, headers });
  for (const task of taskList.data) {
    if (task.status === 0) {
      // 执行任务（例如浏览）
      await $.post({ url: `${BASE_URL}/doTask`, headers, body: JSON.stringify({ taskId: task.id }) });
      $.log(`[${userName}] 执行任务 ${task.name}: 成功`);
    }
  }

  // 抽奖
  const lotteryRes = await $.post({ url: `${BASE_URL}/draw`, headers, body: JSON.stringify({ userId }) });
  $.log(`[${userName}] 抽奖结果: ${lotteryRes.prize}`);

  // 领取挑战赛任务
  const challengeList = await $.get({ url: `${BASE_URL}/challengeList`, headers });
  for (const challenge of challengeList.data) {
    if (challenge.status === 0) {
      await $.post({ url: `${BASE_URL}/receiveChallenge`, headers, body: JSON.stringify({ challengeId: challenge.id }) });
      $.log(`[${userName}] 领取挑战赛 ${challenge.name}: 成功`);
    }
  }
}

// 自动提现函数
async function doWithdraw(account) {
  const { userId, teemo, token, userName } = account;
  const headers = { ...HEADERS, token };

  // 获取余额
  const balanceRes = await $.get({ url: `${BASE_URL}/balance`, headers });
  const balance = balanceRes.data.balance;

  if (balance > 1 && autoWithdraw) {
    const withdrawRes = await $.post({ url: `${BASE_URL}/withdraw`, headers, body: JSON.stringify({ amount: balance }) });
    $.log(`[${userName}] 自动提现 ${balance} 元: ${withdrawRes.message}`);
  } else {
    $.log(`[${userName}] 余额 ${balance} 元，未达到提现阈值或开关关闭`);
  }
}

// 主执行
(async () => {
  for (const account of accounts) {
    await doDailyTasks(account);
    await doWithdraw(account);
  }
  $.done();
})();

// Env 类（标准工具类，已清理混淆）
class Env {
  constructor(name) {
    this.name = name;
    this.logs = [];
    this.startTime = new Date().getTime();
    this.log(`🔔${this.name}, 开始!`);
  }

  isNode() {
    return !!process.env;
  }

  isQuanX() {
    return !!$task;
  }

  // HTTP GET
  get(options, callback) {
    if (this.isQuanX()) {
      $task.fetch({ ...options, method: 'GET' }).then(resp => {
        callback(null, resp, resp.body);
      });
    } else if (this.isNode()) {
      this.node.request.get(options.url, { headers: options.headers }, (err, resp, body) => {
        callback(err, resp, body);
      });
    }
  }

  // HTTP POST
  post(options, callback) {
    if (this.isQuanX()) {
      $task.fetch({ ...options, method: 'POST', body: options.body }).then(resp => {
        callback(null, resp, resp.body);
      });
    } else if (this.isNode()) {
      this.node.request.post(options.url, { headers: options.headers, json: options.body }, (err, resp, body) => {
        callback(err, resp, body);
      });
    }
  }

  log(msg) {
    console.log(msg);
    this.logs.push(msg);
  }

  msg(title, subtitle, desc) {
    if (this.isQuanX()) {
      $notify(title, subtitle, desc);
    } else if (this.isNode()) {
      notify.sendNotify(title, subtitle + '\n' + desc);
    }
  }

  done() {
    const time = (new Date().getTime() - this.startTime) / 1000;
    this.log(`🔔${this.name}, 结束! 🕛 ${time} 秒`);
    $done();
  }
}
