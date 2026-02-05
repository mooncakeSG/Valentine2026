// GIPHY API Configuration
// This placeholder will be replaced by build.js from environment/.env at build time
const GIPHY_API_KEY = 'YOUR_GIPHY_API_KEY';
const GIPHY_BASE_URL = 'https://api.giphy.com/v1/gifs/search';

// State management
const state = {
    noClickCount: 0,
    accepted: false
};

// Track active image load timeout & requests (for rapid taps / slow mobile)
let currentImageTimeout = null;
let currentGifRequestId = 0;
const MAX_GIF_RETRY_ATTEMPTS = 2;

// No button sequence configuration
const noButtonSequence = [
    {
        label: "Are you sure? 🥺",
        gifQuery: "sad cute cartoon",
        hint: "Think about it…"
    },
    {
        label: "Positive?? 😭",
        gifQuery: "crying cute animation",
        hint: "We'd be cute though."
    },
    {
        label: "Last chance 😤💘",
        gifQuery: "dramatic cartoon heartbreak",
        hint: "Final final answer?"
    },
    {
        label: "Okay fine… 😔",
        gifQuery: "sad puppy cartoon",
        hint: "You can still press YES 👀"
    }
];

// DOM elements
const elements = {
    title: document.getElementById('title'),
    subtitle: document.getElementById('subtitle'),
    gif: document.getElementById('gif'),
    gifLoading: document.getElementById('gifLoading'),
    hintText: document.getElementById('hintText'),
    yesBtn: document.getElementById('yesBtn'),
    noBtn: document.getElementById('noBtn'),
    confettiContainer: document.getElementById('confetti-container')
};

// Fetch GIF from GIPHY API
async function fetchGif(query, attempt = 1) {
    // Mobile-friendly: handle offline state first
    if (!navigator.onLine) {
        elements.gif.style.display = 'none';
        elements.gif.classList.remove('show');
        elements.gifLoading.style.display = 'block';
        elements.gifLoading.textContent = 'Looks like you\'re offline 💔 Try again when you\'re back online.';
        return;
    }

    const requestId = ++currentGifRequestId;

    // Clear any existing timeout
    if (currentImageTimeout) {
        clearTimeout(currentImageTimeout);
        currentImageTimeout = null;
    }

    elements.gifLoading.style.display = 'block';
    elements.gif.style.display = 'none';
    elements.gif.classList.remove('show');
    elements.gifLoading.textContent = 'Loading a cute GIF for you... 💖';

    try {
        const url = `${GIPHY_BASE_URL}?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=10&rating=g`;
        console.log('Fetching GIF from:', url.replace(GIPHY_API_KEY, 'API_KEY_HIDDEN'));

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Response Error:', response.status, response.statusText, errorText);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.meta && data.meta.status !== 200) {
            throw new Error(`GIPHY API Error: ${data.meta.msg || 'Unknown error'}`);
        }

        if (!data.data || data.data.length === 0) {
            throw new Error('No GIFs found in API response');
        }

        // Randomly select a GIF from the results
        const randomIndex = Math.floor(Math.random() * data.data.length);
        const gifData = data.data[randomIndex];

        // Use a smaller size first for faster loading on mobile, fallback to original
        const gifUrl =
            (gifData.images.fixed_height_small && gifData.images.fixed_height_small.url) ||
            (gifData.images.fixed_height && gifData.images.fixed_height.url) ||
            (gifData.images.downsized && gifData.images.downsized.url) ||
            gifData.images.original.url;

        const altText = gifData.title || 'Cute romantic GIF';

        console.log('Selected GIF URL:', gifUrl);

        // Use a separate Image object to load, then swap into the DOM image.
        const loaderImage = new Image();
        let imageHandled = false;

        const cleanupAndIgnoreIfStale = () => {
            if (currentImageTimeout) {
                clearTimeout(currentImageTimeout);
                currentImageTimeout = null;
            }
            // Ignore if a newer request has started (user tapped quickly)
            return requestId !== currentGifRequestId;
        };

        loaderImage.onload = () => {
            if (imageHandled) return;
            imageHandled = true;
            if (cleanupAndIgnoreIfStale()) return;

            elements.gif.src = loaderImage.src;
            elements.gif.alt = altText;
            elements.gifLoading.style.display = 'none';
            elements.gif.style.display = 'block';
            elements.gif.classList.add('show');
            console.log('GIF loaded successfully!');
        };

        loaderImage.onerror = () => {
            if (imageHandled) return;
            imageHandled = true;
            if (cleanupAndIgnoreIfStale()) return;

            console.error('Failed to load GIF image');

            if (attempt < MAX_GIF_RETRY_ATTEMPTS) {
                console.log(`Retrying GIF load (attempt ${attempt + 1})...`);
                fetchGif(query, attempt + 1);
                return;
            }

            elements.gif.style.display = 'none';
            elements.gif.classList.remove('show');
            elements.gifLoading.style.display = 'block';
            elements.gifLoading.textContent = 'Could not load GIF image, but the love is still real! 💖';
        };

        // Mobile: shorter timeout but with one retry
        currentImageTimeout = setTimeout(() => {
            if (imageHandled || requestId !== currentGifRequestId) {
                return;
            }

            console.warn('GIF image load timeout');
            if (attempt < MAX_GIF_RETRY_ATTEMPTS) {
                imageHandled = true;
                fetchGif(query, attempt + 1);
            } else {
                elements.gif.style.display = 'none';
                elements.gif.classList.remove('show');
                elements.gifLoading.style.display = 'block';
                elements.gifLoading.textContent = 'GIF is taking too long to load on your connection 💞 You can still answer below.';
            }
        }, 7000); // 7 second timeout

        loaderImage.src = gifUrl;
    } catch (error) {
        if (currentImageTimeout) {
            clearTimeout(currentImageTimeout);
            currentImageTimeout = null;
        }

        console.error('Error fetching GIF:', error);

        let friendlyMessage = 'Something went wrong loading the GIF, but the love is still real! 💖';
        if (error.message && error.message.includes('API Error')) {
            friendlyMessage = 'The GIF service is a bit overwhelmed right now 💔 Please try again in a moment.';
        } else if (error.message && error.message.includes('No GIFs')) {
            friendlyMessage = 'Could not find a GIF for that, but I\'m still thinking of you 💕';
        }

        elements.gif.style.display = 'none';
        elements.gif.classList.remove('show');
        elements.gifLoading.style.display = 'block';
        elements.gifLoading.textContent = friendlyMessage;
    }
}

// Handle Yes button click
function handleYesClick() {
    if (state.accepted) return;
    
    state.accepted = true;
    
    // Update title and subtitle
    elements.title.textContent = 'YAYYY!! 💞 Best decision ever.';
    elements.subtitle.textContent = 'I\'m so happy! This is going to be amazing! 🎉💕';
    
    // Load new GIF
    fetchGif('happy couple cartoon love');
    
    // Hide No button
    elements.noBtn.classList.add('hidden');
    
    // Animate Yes button
    elements.yesBtn.classList.add('celebrate');
    
    // Clear hint text
    elements.hintText.textContent = '';
    
    // Create confetti animation
    createConfetti();
    
    // Announce to screen readers
    announceToScreenReader('Yes! They accepted! This is amazing!');
}

// Handle No button click
function handleNoClick() {
    if (state.accepted) return;
    
    state.noClickCount++;
    
    // Scale up Yes button
    const scale = 1 + (state.noClickCount * 0.1);
    elements.yesBtn.style.transform = `scale(${scale})`;
    
    // Handle sequence
    if (state.noClickCount <= noButtonSequence.length) {
        const current = noButtonSequence[state.noClickCount - 1];
        
        elements.noBtn.textContent = current.label;
        elements.hintText.textContent = current.hint;
        fetchGif(current.gifQuery);
        
        // Announce to screen readers
        announceToScreenReader(current.label + '. ' + current.hint);
    } else {
        // After all sequences, keep the last state
        const last = noButtonSequence[noButtonSequence.length - 1];
        elements.hintText.textContent = last.hint;
    }
}

// Create confetti animation
function createConfetti() {
    const colors = ['#ff69b4', '#ff1493', '#ffc0cb', '#ffb6c1', '#ff69b4'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            
            elements.confettiContainer.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }, i * 10);
    }
}

// Announce to screen readers
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        announcement.remove();
    }, 1000);
}

// Keyboard navigation
function handleKeyPress(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        if (document.activeElement === elements.yesBtn) {
            event.preventDefault();
            handleYesClick();
        } else if (document.activeElement === elements.noBtn) {
            event.preventDefault();
            handleNoClick();
        }
    }
}

// Initialize
function init() {
    // Load initial GIF
    fetchGif('cute love cartoon');
    
    // Add event listeners
    elements.yesBtn.addEventListener('click', handleYesClick);
    elements.noBtn.addEventListener('click', handleNoClick);
    document.addEventListener('keydown', handleKeyPress);
    
    // Announce initial state to screen readers
    announceToScreenReader('Will you be my Valentine? Use the Yes or No buttons to respond.');
}

// Start the app
init();

