const { Post } = require("./utils/request");
const APIKEY = ""; // 调用OpenAI的密钥
const ROBOT = "9527"; // 群聊触发机器人的首字符串

const config = {
  AutoReply: true, // 启动自动回复
  MakeFriend: false, // 自动加好友
};
var bot = null;
async function replyMessage(contact, content) {
  try {
    const _config = {
      model: "text-davinci-003",
      prompt: content,
      frequency_penalty: 0,
      max_tokens: 2048,
      presence_penalty: 0,
      temperature: 0.5,
      top_p: 1,
    };
    const completion = await Post(
      "https://api.openai.com/v1/completions",
      _config,
      { headers: { Authorization: `Bearer ${APIKEY}` } }
    );
    const text = completion.choices[0].text;
    await contact.say(text);
  } catch (e) {
    await contact.say("触及到知识盲区了");
  }
}

async function onMessage(msg) {
  // const alias = (await contact.alias()) || (await contact.name());
  const contact = msg.talker();
  const content = msg.text();
  const receiver = msg.to();
  const room = msg.room();
  const isText = msg.type() === bot.Message.Type.Text;
  if (isText && room) {
    if (new RegExp(`/^${ROBOT}/`).test(content)) {
      const groupContent = content.replace(new RegExp(`/^${ROBOT}/g`), "");
      if (!groupContent) return;
      replyMessage(room, groupContent.trim());
      const topic = await room.topic();
      console.log(
        `Group name: ${topic} talker: ${await contact.name()} content: ${content}`
      );
    }

    if (await msg.mentionSelf()) {
      const groupContent = content.replace(
        new RegExp(`/@${receiver.name()}/g`),
        ""
      );
      if (!groupContent) return;
      replyMessage(room, groupContent.trim());
      const topic = await room.topic();
      console.log(
        `Group name: ${topic} talker: ${await contact.name()} content: ${content}`
      );
    }
  }
}
// 启用私聊
// if (config.AutoReply && content) {
//   replyMessage(contact, content);
// }

async function onScan(qrcode, status) {
  const qrcodeTerminal = require("qrcode-terminal");
  qrcodeTerminal.generate(qrcode); // 在console端显示二维码
  const qrcodeImageUrl = [
    "https://api.qrserver.com/v1/create-qr-code/?data=",
    encodeURIComponent(qrcode),
  ].join("");
  console.log(qrcodeImageUrl);
}

async function onLogin(user) {
  const date = new Date();
  console.log(`${user} has logged in at ${date}`);
  if (config.AutoReply) {
    console.log(`Automatic robot chat mode has been activated`);
  }
}

function onLogout(user) {
  console.log(`${user} has logged out`);
}
async function onFriendShip(friendship) {
  const frienddShipRe = /chatgpt|chat/;
  if (friendship.type() === 2) {
    if (frienddShipRe.test(friendship.hello())) {
      await friendship.accept();
    }
  }
}
process.on("uncaughtException", (err, origin) => {
  //捕捉uncaughtException
  console.error("[uncaughtException]", err, origin);
});
process.on("unhandledRejection", (err, promise) => {
  //捕捉unhandledRejection
  console.error("[unhandledRejection]", err, err.options);
});
(async () => {
  const { WechatyBuilder } = await import("wechaty");
  bot = WechatyBuilder.build({
    name: "WechatEveryDay",
    puppet: "wechaty-puppet-wechat", // 如果有token，记得更换对应的puppet
    puppetOptions: {
      uos: true,
    },
  });
  bot.on("scan", onScan);
  bot.on("login", onLogin);
  bot.on("logout", onLogout);
  bot.on("message", onMessage);
  if (config.MakeFriend) {
    bot.on("friendship", onFriendShip);
  }
  bot
    .start()
    .then(() => console.log("Start to log in wechat..."))
    .catch((e) => console.error(e));
})();
