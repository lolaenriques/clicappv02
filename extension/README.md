# SAP SuccessFactors Click Capture Extension

This browser extension captures real clicks from SAP SuccessFactors and automatically generates tasks in your web application.

## Installation Instructions

### Step 1: Prepare the Extension
1. Download or copy all files from the `extension` folder to your computer
2. Make sure you have these files:
   - `manifest.json`
   - `content.js`
   - `background.js`
   - `popup.html`
   - `popup.js`
   - `icons/icon.svg`

### Step 2: Install in Chrome/Edge
1. Open Chrome/Edge and go to `chrome://extensions/` (or `edge://extensions/`)
2. Turn on "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. The extension should now appear in your extensions list

### Step 3: Install in Firefox
1. Open Firefox and go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from the extension folder
5. The extension should now appear in your add-ons list

### Step 4: Configure the Extension
1. Click the extension icon in your browser toolbar
2. Set the "Application Server URL" to: `http://localhost:5000`
3. Click "Test Connection" to verify it works
4. Toggle "Auto Task Generation" if needed

### Step 5: Start Capturing
1. Navigate to any SAP SuccessFactors page
2. Click the extension icon and click "Start" to begin capture
3. You'll see a blue indicator on SAP pages when capture is active
4. Click any elements in SAP SuccessFactors (buttons, links, menus)
5. Tasks will automatically appear in your web application!

## How It Works

### Real Click Detection
- Captures clicks on interactive elements (buttons, links, menus)
- Extracts element text, selectors, and page context
- Detects SAP SuccessFactors sections automatically
- Filters out irrelevant system clicks

### Task Generation
- Sends click data to your web application
- Automatically creates tasks like "Click in View My Profile"
- Includes context about the SAP section and element
- Real-time updates in your dashboard

### Visual Feedback
- Blue indicator shows when capture is active
- Clicked elements briefly highlight
- Notifications show when tasks are created
- Popup shows current page and statistics

## Supported SAP SuccessFactors Domains
- `*.successfactors.com`
- `*.successfactors.eu`
- `*.sfsf.com`
- `*.sap.com`

## Security & Privacy
- Only captures click events, no sensitive data
- Data stays between your browser and local application
- No external servers or third-party services
- Full control over what gets captured

## Troubleshooting

### "Connection Failed" Error
- Make sure your web application is running on `http://localhost:5000`
- Check if the server URL in extension settings is correct
- Verify CORS is enabled in your application

### No Tasks Being Generated
- Ensure capture is turned ON in the extension popup
- Check that you're on a supported SAP SuccessFactors domain
- Verify "Auto Task Generation" is enabled
- Look for the blue capture indicator on the page

### Extension Not Working
- Refresh the SAP SuccessFactors page after installing
- Check browser console for any error messages
- Try disabling and re-enabling the extension
- Make sure you're clicking interactive elements (buttons, links)

Start capturing your SAP SuccessFactors interactions and watch as tasks are automatically generated from your real clicks!