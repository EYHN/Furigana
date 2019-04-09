function saveOptions(e) {
  function onError(error) {
    console.log(`Error: ${error}`);
  }

  e.preventDefault();
  browser.storage.local.set({
    japanese_website: document.querySelector("#japanese_website").checked
  }).catch(onError);
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#japanese_website").checked = typeof result.japanese_website === 'undefined' ? true : result.japanese_website;
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get("japanese_website");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);