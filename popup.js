document.addEventListener('DOMContentLoaded', function () {
    // chrome.storage.sync.get(['toggleState'], function (result) {
    //     document.getElementById('toggle-script').checked = result.toggleState || false;
    // });

    document.getElementById('toggle-script').addEventListener('change', function () {
        const isChecked = this.checked;
        chrome.storage.sync.set({ toggleState: isChecked });

        console.log("changed!");
        if (isChecked) {
            chrome.runtime.sendMessage({ action: 'runContentScript' });
        } else {
            chrome.runtime.sendMessage({ action: 'restoreOriginalContent' });
        }
    });
});