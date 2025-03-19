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
                chrome.runtime.sendMessage({ action: 'refreshPage' });
                chrome.runtime.sendMessage({ action: 'run' });

            });
        });
    });
});