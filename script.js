// GIPHY API Configuration
// This will be replaced by build.js from .env file
const GIPHY_API_KEY = 'Z4bth111x8cdiFPQRr2QyVPUZsQCh1XK';
const GIPHY_BASE_URL = 'https://api.giphy.com/v1/gifs/search';

// State management
const state = {
    noClickCount: 0,
    accepted: false
};

// Track active image load timeout
let currentImageTimeout = null;

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
async function fetchGif(query) {
    try {
        // Clear any existing timeout
        if (currentImageTimeout) {
            clearTimeout(currentImageTimeout);
            currentImageTimeout = null;
        }
        
        // Reset image handlers to prevent conflicts
        elements.gif.onload = null;
        elements.gif.onerror = null;
        
        elements.gifLoading.style.display = 'block';
        elements.gif.style.display = 'none';
        elements.gif.classList.remove('show');
        elements.gifLoading.textContent = 'Loading a cute GIF for you... 💖';
        
        const url = `${GIPHY_BASE_URL}?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=10&rating=g`;
        console.log('Fetching GIF from:', url.replace(GIPHY_API_KEY, 'API_KEY_HIDDEN'));
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Response Error:', response.status, response.statusText, errorText);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('GIPHY API Response:', data);
        
        if (data.meta && data.meta.status !== 200) {
            throw new Error(`GIPHY API Error: ${data.meta.msg || 'Unknown error'}`);
        }
        
        if (data.data && data.data.length > 0) {
            // Randomly select a GIF from the results
            const randomIndex = Math.floor(Math.random() * data.data.length);
            const gifData = data.data[randomIndex];
            
            // Try to use a smaller size first for faster loading, fallback to original
            const gifUrl = gifData.images.fixed_height?.url || 
                          gifData.images.downsized?.url || 
                          gifData.images.original.url;
            const altText = gifData.title || 'Cute romantic GIF';
            
            console.log('Selected GIF URL:', gifUrl);
            console.log('GIF dimensions:', {
                original: gifData.images.original?.width + 'x' + gifData.images.original?.height,
                fixed_height: gifData.images.fixed_height?.width + 'x' + gifData.images.fixed_height?.height
            });
            
            // Set up image load handlers BEFORE setting src (in case image is cached)
            let imageLoaded = false;
            
            const showGif = () => {
                if (imageLoaded) return; // Prevent double execution
                imageLoaded = true;
                
                if (currentImageTimeout) {
                    clearTimeout(currentImageTimeout);
                    currentImageTimeout = null;
                }
                
                elements.gifLoading.style.display = 'none';
                elements.gif.style.display = 'block'; // Explicitly set to block to override inline style
                elements.gif.classList.add('show');
                console.log('GIF loaded successfully!');
            };
            
            const handleError = () => {
                if (imageLoaded) return; // Prevent double execution
                imageLoaded = true;
                
                if (currentImageTimeout) {
                    clearTimeout(currentImageTimeout);
                    currentImageTimeout = null;
                }
                
                console.error('Failed to load GIF image');
                elements.gifLoading.textContent = 'Could not load GIF image, but the love is still real! 💖';
            };
            
            // Set timeout (reduced to 5 seconds)
            currentImageTimeout = setTimeout(() => {
                if (!imageLoaded) {
                    console.error('Image load timeout after 5 seconds');
                    imageLoaded = true;
                    elements.gifLoading.textContent = 'GIF is taking too long to load. Try again! 💖';
                    // Try to load anyway if it's still loading
                    setTimeout(() => {
                        if (elements.gif.complete && elements.gif.naturalHeight !== 0) {
                            showGif();
                        }
                    }, 500);
                }
            }, 5000); // 5 second timeout
            
            // Set handlers first (before setting src)
            elements.gif.onload = showGif;
            elements.gif.onerror = (e) => {
                console.error('Image error event:', e);
                console.error('Failed URL:', gifUrl);
                console.error('Image src:', elements.gif.src);
                console.error('Image complete:', elements.gif.complete);
                console.error('Image naturalWidth:', elements.gif.naturalWidth);
                console.error('Image naturalHeight:', elements.gif.naturalHeight);
                handleError();
            };
            
            // Set the image source (this triggers loading)
            elements.gif.alt = altText;
            
            // Remove crossOrigin - GIPHY images don't need it and it might cause issues
            elements.gif.removeAttribute('crossOrigin');
            
            // Simple approach: just set the src directly
            // If it's the same URL, we need to clear it first
            if (elements.gif.src === gifUrl) {
                // Force reload by clearing and resetting
                const tempSrc = gifUrl;
                elements.gif.src = '';
                elements.gif.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 1x1 transparent gif
                setTimeout(() => {
                    elements.gif.src = tempSrc;
                }, 50);
            } else {
                elements.gif.src = gifUrl;
            }
            
            // Check if image is already loaded (cached) after a brief moment
            setTimeout(() => {
                if (elements.gif.complete && elements.gif.naturalHeight !== 0 && !imageLoaded) {
                    console.log('GIF already loaded from cache');
                    showGif();
                }
            }, 200);
        } else {
            throw new Error('No GIFs found in API response');
        }
    } catch (error) {
        // Clear timeout on error
        if (currentImageTimeout) {
            clearTimeout(currentImageTimeout);
            currentImageTimeout = null;
        }
        
        console.error('Error fetching GIF:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        elements.gifLoading.textContent = `Could not load GIF: ${error.message}. But the love is still real! 💖`;
        // You could set a fallback image here
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

