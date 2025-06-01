// SAP SuccessFactors Click Capture Content Script
(function() {
  'use strict';
  
  let captureEnabled = false;
  let appServerUrl = 'http://127.0.0.1:5000'; // Default to local development
  
  // Initialize capture system
  function initializeCapture() {
    console.log('SAP SuccessFactors Click Capture initialized');
    
    // Check if capture is enabled
    chrome.storage.sync.get(['captureEnabled', 'serverUrl'], function(result) {
      captureEnabled = result.captureEnabled || false;
      appServerUrl = result.serverUrl || 'http://localhost:5000';
      
      if (captureEnabled) {
        startClickCapture();
      }
    });
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.action === 'toggleCapture') {
        captureEnabled = request.enabled;
        if (captureEnabled) {
          startClickCapture();
        } else {
          stopClickCapture();
        }
        sendResponse({ success: true });
      } else if (request.action === 'updateServerUrl') {
        appServerUrl = request.url;
        sendResponse({ success: true });
      }
    });
  }
  
  // Start capturing clicks
  function startClickCapture() {
    console.log('Starting SAP SuccessFactors click capture...');
    document.addEventListener('click', handleClick, true);
    
    // Add visual indicator
    addCaptureIndicator();
  }
  
  // Stop capturing clicks
  function stopClickCapture() {
    console.log('Stopping SAP SuccessFactors click capture...');
    document.removeEventListener('click', handleClick, true);
    
    // Remove visual indicator
    removeCaptureIndicator();
  }
  
  // Handle click events
  function handleClick(event) {
    if (!captureEnabled) return;
    
    const element = event.target;
    const clickData = extractClickData(element, event);
    
    // Filter for meaningful interactions
    if (isRelevantClick(clickData)) {
      sendClickData(clickData);
      
      // Visual feedback
      highlightClickedElement(element);
    }
  }
  
  // Extract meaningful data from click
  function extractClickData(element, event) {
    const rect = element.getBoundingClientRect();
    
    return {
      elementSelector: generateSelector(element),
      elementText: getElementText(element),
      elementType: element.tagName.toLowerCase(),
      elementId: element.id || '',
      elementClass: element.className || '',
      pageUrl: window.location.href,
      pageTitle: document.title,
      timestamp: new Date().toISOString(),
      coordinates: {
        x: event.clientX,
        y: event.clientY
      },
      elementPosition: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      },
      section: detectSAPSection(),
      module: detectSAPModule()
    };
  }
  
  // Generate unique CSS selector for element
  function generateSelector(element) {
    if (element.id) {
      return '#' + element.id;
    }
    
    let selector = element.tagName.toLowerCase();
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        selector += '.' + classes.slice(0, 3).join('.');
      }
    }
    
    // Add data attributes if they exist (common in SAP)
    const dataAttrs = Array.from(element.attributes)
      .filter(attr => attr.name.startsWith('data-'))
      .slice(0, 2)
      .map(attr => `[${attr.name}="${attr.value}"]`)
      .join('');
    
    selector += dataAttrs;
    
    return selector;
  }
  
  // Get meaningful text from element
  function getElementText(element) {
    // Try different text sources
    const text = element.textContent || 
                element.innerText || 
                element.title || 
                element.alt || 
                element.placeholder || 
                element.value ||
                element.getAttribute('aria-label') ||
                element.getAttribute('data-original-title') ||
                '';
    
    return text.trim().substring(0, 200); // Limit length
  }
  
  // Detect SAP SuccessFactors section
  function detectSAPSection() {
    const url = window.location.href;
    const pathname = window.location.pathname;
    
    // Common SAP SuccessFactors sections
    const sections = {
      'home': /\/home|\/dashboard/i,
      'profile': /\/profile|\/personal/i,
      'directory': /\/directory|\/people/i,
      'learning': /\/learning|\/lms/i,
      'performance': /\/performance|\/goals/i,
      'compensation': /\/compensation|\/pay/i,
      'timeoff': /\/timeoff|\/leave/i,
      'recruiting': /\/recruiting|\/jobs/i,
      'onboarding': /\/onboarding/i,
      'admin': /\/admin|\/setup/i
    };
    
    for (const [section, pattern] of Object.entries(sections)) {
      if (pattern.test(pathname) || pattern.test(url)) {
        return section;
      }
    }
    
    // Try to detect from page elements
    const pageTitle = document.title.toLowerCase();
    for (const [section, pattern] of Object.entries(sections)) {
      if (pattern.test(pageTitle)) {
        return section;
      }
    }
    
    return 'explorer';
  }
  
  // Detect SAP module
  function detectSAPModule() {
    const moduleElement = document.querySelector('[data-module], [data-app-id], .sapUiApp');
    if (moduleElement) {
      return moduleElement.getAttribute('data-module') || 
             moduleElement.getAttribute('data-app-id') || 
             'unknown';
    }
    
    // Try to extract from URL
    const match = window.location.pathname.match(/\/ui\/([^\/]+)/);
    return match ? match[1] : 'unknown';
  }
  
  // Check if click is relevant for capture
  function isRelevantClick(clickData) {
    const element = document.querySelector(clickData.elementSelector);
    if (!element) return false;
    
    // Include interactive elements
    const interactiveElements = ['button', 'a', 'input', 'select', 'textarea'];
    const isInteractive = interactiveElements.includes(clickData.elementType) ||
                         element.hasAttribute('onclick') ||
                         element.hasAttribute('ng-click') ||
                         element.classList.contains('sapMBtn') ||
                         element.classList.contains('sapUiBtn') ||
                         element.role === 'button';
    
    // Exclude very generic or system elements
    const excludePatterns = [
      /sapUiBody/,
      /sapUiGlobalContainer/,
      /scroll/i,
      /loading/i
    ];
    
    const hasExcludedClass = excludePatterns.some(pattern => 
      pattern.test(clickData.elementClass)
    );
    
    // Must have meaningful text or be an interactive element
    const hasMeaningfulText = clickData.elementText.length > 2;
    
    return isInteractive && !hasExcludedClass && (hasMeaningfulText || isInteractive);
  }
  
  // Send click data to application
  async function sendClickData(clickData) {
    try {
      const response = await fetch(`${appServerUrl}/api/captures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elementSelector: clickData.elementSelector,
          elementText: clickData.elementText,
          pageUrl: clickData.pageUrl
        })
      });
      
      if (response.ok) {
        console.log('Click data sent successfully:', clickData.elementText);
        showNotification(`Captured: ${clickData.elementText}`, 'success');
      } else {
        console.error('Failed to send click data:', response.statusText);
        showNotification('Failed to capture click', 'error');
      }
    } catch (error) {
      console.error('Error sending click data:', error);
      showNotification('Connection error - check server', 'error');
    }
  }
  
  // Add visual indicator that capture is active
  function addCaptureIndicator() {
    if (document.getElementById('sap-capture-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.id = 'sap-capture-indicator';
    indicator.innerHTML = `
      <div style="
        position: fixed;
        top: 10px;
        right: 10px;
        background: #0073E6;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-family: Arial, sans-serif;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 6px;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: #30914C;
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
        SAP Click Capture Active
      </div>
      <style>
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      </style>
    `;
    
    document.body.appendChild(indicator);
  }
  
  // Remove visual indicator
  function removeCaptureIndicator() {
    const indicator = document.getElementById('sap-capture-indicator');
    if (indicator) {
      indicator.remove();
    }
  }
  
  // Highlight clicked element temporarily
  function highlightClickedElement(element) {
    const originalStyle = element.style.cssText;
    
    element.style.cssText += `
      outline: 2px solid #0073E6 !important;
      outline-offset: 2px !important;
      transition: outline 0.3s ease !important;
    `;
    
    setTimeout(() => {
      element.style.cssText = originalStyle;
    }, 1000);
  }
  
  // Show notification
  function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.getElementById('sap-capture-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'sap-capture-notification';
    
    const bgColor = type === 'success' ? '#30914C' : 
                   type === 'error' ? '#BB0000' : '#0073E6';
    
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 60px;
        right: 10px;
        background: ${bgColor};
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-family: Arial, sans-serif;
        z-index: 10001;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        max-width: 250px;
      ">
        ${message}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCapture);
  } else {
    initializeCapture();
  }
  
})();