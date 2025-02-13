document.addEventListener('DOMContentLoaded', function() {
    // Get all checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    // Add change listener to each checkbox
    checkboxes.forEach(checkbox => {
        // Load saved state
        chrome.storage.sync.get(checkbox.id, function(result) {
            checkbox.checked = result[checkbox.id] || false;
        });

        // Save state on change
        checkbox.addEventListener('change', function() {
            let saveObj = {};
            saveObj[this.id] = this.checked;
            chrome.storage.sync.set(saveObj, function() {
                console.log('Checkbox state changed, reloading page...');
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    chrome.tabs.reload(tabs[0].id);
                });

                // Send message to toggle the switch off
                chrome.runtime.sendMessage({ action: 'toggleSwitchOff' });
            });
        });
    });
});