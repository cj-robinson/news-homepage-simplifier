document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];
        const url = new URL(currentTab.url);

        if (!url.hostname.includes('iowacapitaldispatch.com')) {
            window.location.href = 'redirect.html';
            return;
        }

        const toggleScriptCheckbox = document.getElementById('toggle-script');

        // Load saved state
        chrome.storage.sync.get('toggleState', function (result) {
            toggleScriptCheckbox.checked = result.toggleState || false;
        });

        toggleScriptCheckbox.addEventListener('change', function () {
            const isChecked = this.checked;
            chrome.storage.sync.set({ toggleState: isChecked });

            console.log("changed!");
            if (isChecked) {
                chrome.runtime.sendMessage({ action: 'runContentScript' });
            } else {
                chrome.runtime.sendMessage({ action: 'restoreOriginalContent' });
                chrome.tabs.reload(currentTab.id);
            }
        });

        // Listen for messages to toggle the switch off
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'toggleSwitchOff') {
                toggleScriptCheckbox.checked = false;
                chrome.storage.sync.set({ toggleState: false });
            }
        });
    });
});