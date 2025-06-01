// SAP SuccessFactors Click Capture Popup Script

let currentSettings = {
  captureEnabled: false,
  serverUrl: 'http://127.0.0.1:5000',
  autoTaskGeneration: true
};

let sessionStats = {
  clicksCount: 0,
  tasksCount: 0
};

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
  loadSettings();
  updateUI();
  setupEventListeners();
  checkCurrentTab();
  loadSessionStats();
});

// Load settings from storage
function loadSettings() {
  chrome.runtime.sendMessage({ action: 'getSettings' }, function(response) {
    if (response) {
      currentSettings = { ...currentSettings, ...response };
      updateUI();
    }
  });
}

// Update UI elements
function updateUI() {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const toggleBtn = document.getElementById('toggleBtn');
  const serverUrl = document.getElementById('serverUrl');
  const autoTaskGeneration = document.getElementById('autoTaskGeneration');
  
  // Update status
  if (currentSettings.captureEnabled) {
    statusDot.classList.add('active');
    statusText.textContent = 'Capture Active';
    toggleBtn.textContent = 'Stop';
    toggleBtn.classList.add('stop');
  } else {
    statusDot.classList.remove('active');
    statusText.textContent = 'Capture Inactive';
    toggleBtn.textContent = 'Start';
    toggleBtn.classList.remove('stop');
  }
  
  // Update form fields
  serverUrl.value = currentSettings.serverUrl;
  autoTaskGeneration.checked = currentSettings.autoTaskGeneration;
}

// Setup event listeners
function setupEventListeners() {
  // Toggle capture button
  document.getElementById('toggleBtn').addEventListener('click', function() {
    currentSettings.captureEnabled = !currentSettings.captureEnabled;
    saveSettings();
    updateUI();
  });
  
  // Server URL input
  document.getElementById('serverUrl').addEventListener('change', function() {
    currentSettings.serverUrl = this.value;
    saveSettings();
  });
  
  // Auto task generation toggle
  document.getElementById('autoTaskGeneration').addEventListener('change', function() {
    currentSettings.autoTaskGeneration = this.checked;
    saveSettings();
  });
  
  // Server URL change updates settings automatically
}

// Save settings
function saveSettings() {
  chrome.runtime.sendMessage({ 
    action: 'saveSettings', 
    settings: currentSettings 
  }, function(response) {
    if (response && response.success) {
      console.log('Settings saved successfully');
    }
  });
}

// Test connection to application server
async function testConnection() {
  const statusElement = document.getElementById('connectionStatus');
  const testBtn = document.getElementById('testConnection');
  
  statusElement.style.display = 'block';
  statusElement.textContent = 'Testing connection...';
  statusElement.className = 'connection-status';
  testBtn.disabled = true;
  
  try {
    const response = await fetch(`${currentSettings.serverUrl}/api/statistics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      statusElement.textContent = '✓ Connected successfully';
      statusElement.classList.add('connected');
      
      // Update stats from server
      sessionStats.tasksCount = data.tasksGenerated || 0;
      updateStats();
    } else {
      throw new Error(`Server responded with ${response.status}`);
    }
  } catch (error) {
    statusElement.textContent = `✗ Connection failed: ${error.message}`;
    statusElement.classList.add('disconnected');
  } finally {
    testBtn.disabled = false;
    
    // Hide status after 3 seconds
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 3000);
  }
}

// Check current tab to see if it's a SAP page
function checkCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    const currentPageElement = document.getElementById('currentPage');
    
    if (currentTab && currentTab.url) {
      const sapDomains = [
        'successfactors.com',
        'successfactors.eu',
        'sfsf.com',
        'sap.com',
        'hr.cloud.sap',
        'cloud.sap'
      ];
      
      const isSAPPage = sapDomains.some(domain => currentTab.url.includes(domain));
      
      if (isSAPPage) {
        // Try to extract section from URL
        const url = new URL(currentTab.url);
        const pathParts = url.pathname.split('/').filter(p => p);
        let section = 'Explorer';
        
        if (pathParts.length > 0) {
          const sectionMap = {
            'home': 'Home Dashboard',
            'profile': 'Employee Profile',
            'directory': 'Employee Directory',
            'learning': 'Learning Center',
            'performance': 'Performance Management',
            'goals': 'Goal Management',
            'compensation': 'Compensation',
            'timeoff': 'Time Off',
            'recruiting': 'Recruiting',
            'onboarding': 'Onboarding'
          };
          
          for (const [key, value] of Object.entries(sectionMap)) {
            if (pathParts.some(part => part.toLowerCase().includes(key))) {
              section = value;
              break;
            }
          }
        }
        
        currentPageElement.textContent = section;
        currentPageElement.style.color = '#28a745';
      } else {
        currentPageElement.textContent = 'Not SAP SF';
        currentPageElement.style.color = '#dc3545';
      }
    }
  });
}

// Load session statistics
function loadSessionStats() {
  // Get from local storage
  chrome.storage.local.get(['sessionStats'], function(result) {
    if (result.sessionStats) {
      sessionStats = { ...sessionStats, ...result.sessionStats };
      updateStats();
    }
  });
  
  // Also try to get latest from server
  if (currentSettings.serverUrl) {
    fetch(`${currentSettings.serverUrl}/api/statistics`)
      .then(response => response.json())
      .then(data => {
        sessionStats.tasksCount = data.tasksGenerated || 0;
        updateStats();
      })
      .catch(error => {
        console.log('Could not fetch server stats:', error);
      });
  }
}

// Update statistics display
function updateStats() {
  document.getElementById('clicksCount').textContent = sessionStats.clicksCount;
  document.getElementById('tasksCount').textContent = sessionStats.tasksCount;
  
  // Save to local storage
  chrome.storage.local.set({ sessionStats: sessionStats });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updateStats') {
    sessionStats.clicksCount += 1;
    if (request.taskGenerated) {
      sessionStats.tasksCount += 1;
    }
    updateStats();
  }
});