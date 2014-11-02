// Saves options to chrome.storage
function save_options() {
  var key = document.getElementById('api_key').value;
    chrome.storage.sync.set({
    github_key: key
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    github_key: '',
  }, function(items) {
    document.getElementById('api_key').value = items.github_key;
    alert(items.github_key);
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
