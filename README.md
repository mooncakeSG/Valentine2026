# Valentine Proposal Website 💖

A cute, interactive Valentine's Day proposal website with animated GIFs and playful Yes/No buttons.

## Features

- 🎨 Beautiful romantic design with pink gradient background
- 🎬 Dynamic GIF loading from GIPHY API
- 💕 Interactive Yes/No buttons with fun animations
- 🎉 Confetti celebration when "Yes" is clicked
- 😊 Playful 4-stage sequence when "No" is clicked
- ♿ Full accessibility support (ARIA, keyboard navigation)
- 📱 Fully responsive design

## Setup

1. **Get a GIPHY API Key**
   - Go to [GIPHY Developers](https://developers.giphy.com/)
   - Sign up for a free account
   - Create an app to get your API key

2. **Add Your API Key to .env**
   - Copy `.env.example` to `.env`: `cp .env.example .env` (or create it manually)
   - Open `.env` and replace `your_giphy_api_key_here` with your actual GIPHY API key
   - The `.env` file is already in `.gitignore` so it won't be committed to GitHub

3. **Build the Project**
   - Run `node build.js` (or `npm run build` if you have npm)
   - This will inject your API key from `.env` into `script.js`

4. **Run Locally (Recommended)**
   - For best results, use a local server instead of opening the HTML file directly
   - Run `npm start` (builds and serves the site)
   - Or just `npm run serve` to start a local server on port 8080
   - This avoids CORS issues that can occur with `file://` protocol

5. **Deploy to GitHub Pages**
   - Push this repository to GitHub
   - Go to Settings → Pages
   - Select your branch and save
   - Your site will be live at `https://yourusername.github.io/Valentines/`
   - **Note**: Make sure to run `node build.js` before deploying so your API key is included

## Troubleshooting

**GIF not loading?**
- Check the browser console (F12) for detailed error messages
- Make sure your GIPHY API key is valid and active
- Try running `npm start` to use a local server instead of opening the file directly
- Verify your internet connection
- Check that the API key has been injected: run `node build.js` if you haven't already

## How It Works

- **On Load**: Fetches a cute love cartoon GIF
- **Yes Button**: 
  - Changes title to celebration message
  - Loads a happy couple GIF
  - Hides the No button
  - Triggers confetti animation
- **No Button**: 
  - Has 4 stages with different messages and GIFs
  - Yes button scales up with each No click
  - Gets progressively more dramatic 😄

## Customization

You can easily customize:
- Title and subtitle text in `index.html`
- Colors and styling in `styles.css`
- GIF queries and messages in `script.js`
- No button sequence messages in the `noButtonSequence` array

## Browser Support

Works on all modern browsers (Chrome, Firefox, Safari, Edge).

## License

Free to use and modify for your special someone! 💕

