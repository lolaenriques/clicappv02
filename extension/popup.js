// Add authentication logic to popup.js
let isAuthenticated = false;

let currentSettings = {
  captureEnabled: false,
  serverUrl: 'http://127.0.0.1:5000',
  autoTaskGeneration: true
};

let sessionStats = {
  clicksCount: 0,
  tasksCount: 0
};

document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus();
  
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  loadSettings();
  updateUI();
  setupEventListeners();
  checkCurrentTab();
  loadSessionStats();
});

async function checkAuthStatus() {
  try {
    const response = await fetch(`${currentSettings.serverUrl}/api/auth/status`, {
      credentials: 'include'
    });
    
    isAuthenticated = response.ok;
    updateAuthUI();
  } catch (error) {
    console.error('Auth check failed:', error);
    isAuthenticated = false;
    updateAuthUI();
  }
}

async function handleLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch(`${currentSettings.serverUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });
    
    if (response.ok) {
      isAuthenticated = true;
      updateAuthUI();
    } else {
      document.getElementById('loginError').style.display = 'block';
    }
  } catch (error) {
    console.error('Login failed:', error);
    document.getElementById('loginError').style.display = 'block';
  }
}

function updateAuthUI() {
  const loginForm = document.getElementById('loginForm');
  const mainContent = document.getElementById('mainContent');
  
  if (isAuthenticated) {
    loginForm.style.display = 'none';
    mainContent.style.display = 'block';
    loadSettings();
  } else {
    loginForm.style.display = 'block';
    mainContent.style.display = 'none';
  }
}

function loadSettings() {
  chrome.runtime.sendMessage({ action: 'getSettings' }, function(response) {
    if (response) {
      currentSettings = { ...currentSettings, ...response };
      updateUI();
    }
  });
}

function updateUI() {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const toggleBtn = document.getElementById('toggleBtn');
  const serverUrl = document.getElementById('serverUrl');
  const autoTaskGeneration = document.getElementById('autoTaskGeneration');
  
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
  
  serverUrl.value = currentSettings.serverUrl;
  autoTaskGeneration.checked = currentSettings.autoTaskGeneration;
}

function setupEventListeners() {
  document.getElementById('toggleBtn').addEventListener('click', function() {
    currentSettings.captureEnabled = !currentSettings.captureEnabled;
    saveSettings();
    updateUI();
  });
  
  document.getElementById('serverUrl').addEventListener('change', function() {
    currentSettings.serverUrl = this.value;
    saveSettings();
  });
  
  document.getElementById('autoTaskGeneration').addEventListener('change', function() {
    currentSettings.autoTaskGeneration = this.checked;
    saveSettings();
  });
}

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
    
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 3000);
  }
}

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

function loadSessionStats() {
  chrome.storage.local.get(['sessionStats'], function(result) {
    if (result.sessionStats) {
      sessionStats = { ...sessionStats, ...result.sessionStats };
      updateStats();
    }
  });
  
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

function updateStats() {
  document.getElementById('clicksCount').textContent = sessionStats.clicksCount;
  document.getElementById('tasksCount').textContent = sessionStats.tasksCount;
  
  chrome.storage.local.set({ sessionStats: sessionStats });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updateStats') {
    sessionStats.clicksCount += 1;
    if (request.taskGenerated) {
      sessionStats.tasksCount += 1;
    }
    updateStats();
  }
});