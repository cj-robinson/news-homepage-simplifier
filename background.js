chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'runContentScript') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['content.js']
      });
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0].id === tabId) {
                chrome.runtime.sendMessage({ action: 'toggleSwitchOff' });
            }
        });
    }
});
