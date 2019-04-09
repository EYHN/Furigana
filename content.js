
let inited = false;

async function convert(text) {
  return await browser.runtime.sendMessage({type: 'convert', content: text});
}

function replace(node, html) {
  const e = document.createRange().createContextualFragment(html);
  const newNodes = [];
  e.childNodes.forEach((node) => newNodes.push(node));
  node.parentNode.replaceChild(e, node);
  return newNodes;
}

function watchChildList(target, cb) {
  const observer = new MutationObserver(cb);
  observer.observe(target, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

async function detectLanguage() {
  if (document.documentElement.lang) {
    return document.documentElement.lang;
  } else {
    const detect = await browser.i18n.detectLanguage(document.body.innerText)
    if (detect.isReliable) {
      return detect.languages[0].language
    } else {
      return null;
    }
  }
}

async function init() {
  if (inited) return;
  inited = true;
  let ignoreNodes = [];

  async function convertAndReplace(node) {
    if (!node.nodeValue.trim()) return;
    if (node.parentNode.nodeName === 'RUBY') return;
    if (!node.nodeValue.match(/[\u3400-\u9FBF]/)) return;
    const result = await convert(node.nodeValue);
    ignoreNodes.push(...replace(node, result));
  }
  
  const walk = document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);
  const nodeList = [];
  while(walk.nextNode()) nodeList.push(walk.currentNode);
  for (const node of nodeList) {
    convertAndReplace(node)
  }

  watchChildList(document.body, async (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type == 'childList') {
        for (const node of mutation.addedNodes) {
          if (ignoreNodes.includes(node)) {
            ignoreNodes.splice(ignoreNodes.indexOf(node), 1);
            continue;
          }
          if (node instanceof Text) {
            iconvertAndReplace(node)
          } else {
            const walk = document.createTreeWalker(node,NodeFilter.SHOW_TEXT,null,false);
            const nodeList = [];
            while(walk.nextNode()) nodeList.push(walk.currentNode);
            for (const node of nodeList) {
              convertAndReplace(node)
            }
          }
        }
      }
    }
  });
}

async function autoInit() {
  if ((await browser.storage.local.get("japanese_website")).japanese_website === false) return;
  if (await detectLanguage() !== 'ja') return;

  await browser.runtime.sendMessage({type: 'ping'});

  init();
}

autoInit();

browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'init') {
    init();
  }
});