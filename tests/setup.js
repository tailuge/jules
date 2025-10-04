const fs = require('fs');
const path = require('path');

// Load the app's HTML structure
const html = fs.readFileSync(path.resolve(__dirname, '../docs/index.html'), 'utf8');
document.body.innerHTML = html;

// Load the app's JavaScript
const appScriptPath = path.resolve(__dirname, '../docs/assets/js/app.js');
const appScript = fs.readFileSync(appScriptPath, 'utf8');

// The script is expect to be in a browser, so we need to
// create a script tag and append it to the document body.
// This ensures that the script is executed in the JSDOM environment.
const script = document.createElement('script');
script.textContent = appScript;
document.body.appendChild(script);

// The app initializes on DOMContentLoaded, so we need to dispatch that event
document.dispatchEvent(new Event('DOMContentLoaded', {
  bubbles: true,
  cancelable: true,
}));