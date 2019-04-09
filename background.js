import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

const initListeners = [];

async function init() {
  const kuroshiro = new Kuroshiro();
  await kuroshiro.init(new KuromojiAnalyzer({
    dictPath: `${browser.extension.getURL("/")}dict/`
  }));


  browser.runtime.onMessage.removeListener(waitInitMessageListener);
  browser.runtime.onMessage.addListener(async (message) => {
    if (message.type === 'convert') {
      return await kuroshiro.convert(message.content, {mode:"furigana", to:"hiragana"})
    } else if (message.type === 'ping') {
      return 'pong';
    }
  });

  initListeners.forEach((listener) => listener());
}

browser.contextMenus.create({
  id: "do-convert",
  title: browser.i18n.getMessage("contextMenuItemDoConvert"),
  contexts: ["page"]
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "do-convert":
      browser.tabs.sendMessage(tab.id, {type: 'init'})
      break;
  }
})

async function waitInitMessageListener(message) {
  if (message.type === 'ping') {
    return new Promise((resolve) => {
      initListeners.push(() => {
        resolve('pong');
      });
    });
  }
}

browser.runtime.onMessage.addListener(waitInitMessageListener);

init();