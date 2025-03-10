// on load, check toggle state from storage and run script
document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];
        const url = new URL(currentTab.url);

        if (!url.hostname.includes('iowacapitaldispatch.com')) {
            window.location.href = 'redirect.html';
            return;
        }

        const toggleScriptCheckbox = document.getElementById('toggle-script');

        // load toggled state
        chrome.storage.sync.get('toggleState', function (result) {
            toggleScriptCheckbox.checked = result.toggleState || false;
        });

        // when toggled on or off, save state and run state change
        toggleScriptCheckbox.addEventListener('change', function () {
            const isToggled = this.checked;
            chrome.storage.sync.set({ toggleState: isToggled });

            console.log(isToggled)
            if (!isToggled) {
                chrome.runtime.sendMessage({ action: 'refreshPage' });
            }
            chrome.runtime.sendMessage({ action: 'toggleStateChange' });
        });
    });
});