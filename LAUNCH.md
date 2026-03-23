# How to Launch the Typing Speed Test

## Quick Start

Simply open `index.html` in your web browser:

### Option 1: Double-click
- Navigate to the project folder
- Double-click on `index.html`
- Your default browser will open the app

### Option 2: Drag and Drop
- Drag `index.html` into your browser window

### Option 3: File Menu
- Open your browser
- Go to File → Open File
- Select `index.html`

### Option 4: Local Server (Optional)
If you want to run it on a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## What to Expect

1. The page loads with a 60-second timer and empty stats
2. You'll see a sequence of random words
3. Click in the input field (or it auto-focuses)
4. Start typing - the timer begins automatically
5. Press space after each word
6. Watch your stats update in real-time
7. After 60 seconds, see your results and skill level
8. Click "Try Again" to restart

## Troubleshooting

**Nothing happens when I type:**
- Make sure the input field is focused (click on it)
- Check that JavaScript is enabled in your browser

**Words don't change color:**
- This is normal - individual characters change color as you type
- The current word has a yellow highlight

**Timer doesn't start:**
- The timer starts when you type the first alphanumeric character
- Make sure you're typing letters or numbers, not just spaces

**Modal doesn't appear:**
- Wait for the full 60 seconds to complete
- Check browser console for any errors (F12)

## Browser Requirements

- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- No internet connection required (runs completely offline)

Enjoy testing your typing speed!
