let isChecked = false;

// executes content script
function executeContentScript() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['content/content.js']
    });
  });
}

// handles toggle state and executes content script
function handleToggleState() {
  chrome.storage.sync.get('toggleState', function (result) {
    isChecked = result.toggleState || false;
    console.log(isChecked);

    if (isChecked) {
      console.log("checked, running content script");
      executeContentScript();
    } else {
      console.log("not checked, hanging out");
    }
  });
}

// listen for page updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const specificPageUrl = "https://iowacapitaldispatch.com/";
  const specificPageUrlWithQuery = "https://iowacapitaldispatch.com/?";

  if (tab.url && (tab.url === specificPageUrl || tab.url.startsWith(specificPageUrlWithQuery))) {
    handleToggleState();
  }
});

// listen for other messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === 'toggleStateChange') {
      handleToggleState();
    } else if (message.action == 'refreshPage') {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.reload(tabs[0].id);
      });
      handleToggleState();
    }
});