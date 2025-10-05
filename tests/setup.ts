import * as fs from 'fs';
import * as path from 'path';

// Load the app's HTML structure
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
document.body.innerHTML = html;

// Import the app's entry point
import '../src/main';

// The app initializes on DOMContentLoaded, so we need to dispatch that event
document.dispatchEvent(new Event('DOMContentLoaded', {
  bubbles: true,
  cancelable: true,
}));