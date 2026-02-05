const fs = require('fs');
const path = require('path');

// Resolve API key from environment or .env file (for local dev)
const envPath = path.join(__dirname, '.env');
let apiKey = process.env.GIPHY_API_KEY || 'YOUR_GIPHY_API_KEY';

if (!process.env.GIPHY_API_KEY && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GIPHY_API_KEY=(.+)/);
    if (match && match[1] && match[1].trim() !== 'YOUR_GIPHY_API_KEY') {
        apiKey = match[1].trim();
    }
}

if (!apiKey || apiKey === 'YOUR_GIPHY_API_KEY') {
    console.warn('⚠️  GIPHY_API_KEY is not set. The placeholder will remain in script.js.');
}

// Read script.js
const scriptPath = path.join(__dirname, 'script.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Replace the API key placeholder
scriptContent = scriptContent.replace(
    /const GIPHY_API_KEY = 'YOUR_GIPHY_API_KEY';/,
    `const GIPHY_API_KEY = '${apiKey}';`
);

// Write back to script.js
fs.writeFileSync(scriptPath, scriptContent, 'utf8');

console.log('✅ Build complete! API key has been injected into script.js');

