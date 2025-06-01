// SAP SuccessFactors Click Capture Background Script

// Handle extension installation
chrome.runtime.onInstalled.addListener(function() {
  console.log('SAP SuccessFactors Click Capture extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    captureEnabled: false,
    serverUrl: 'http://127.0.0.1:5000',
    autoTaskGeneration: true
  });
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['captureEnabled', 'serverUrl', 'autoTaskGeneration'], function(result) {
      sendResponse(result);
    });
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set(request.settings, function() {
      sendResponse({ success: true });
      
      // Notify all SAP SuccessFactors tabs about the change
      notifyContentScripts(request.settings);
    });
    return true;
  }
});

// Notify all content scripts about settings changes
function notifyContentScripts(settings) {
  chrome.tabs.query({
    url: [
      "*://*.successfactors.com/*",
      "*://*.successfactors.eu/*", 
      "*://*.sfsf.com/*",
      "*://*.sap.com/*",
      "*://*.hr.cloud.sap/*",
      "*://*.cloud.sap/*"
    ]
  }, function(tabs) {
    tabs.forEach(function(tab) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'toggleCapture',
        enabled: settings.captureEnabled
      });
      
      if (settings.serverUrl) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateServerUrl',
          url: settings.serverUrl
        });
      }
    });
  });
}

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url) {
    const sapDomains = [
      'successfactors.com',
      'successfactors.eu', 
      'sfsf.com',
      'sap.com',
      'hr.cloud.sap',
      'cloud.sap'
    ];
    
    const isSAPPage = sapDomains.some(domain => tab.url.includes(domain));
    
    if (isSAPPage) {
      // Get current settings and send to content script
      chrome.storage.sync.get(['captureEnabled', 'serverUrl'], function(result) {
        chrome.tabs.sendMessage(tabId, {
          action: 'toggleCapture',
          enabled: result.captureEnabled || false
        });
        
        if (result.serverUrl) {
          chrome.tabs.sendMessage(tabId, {
            action: 'updateServerUrl',
            url: result.serverUrl
          });
        }
      });
    }
  }
});