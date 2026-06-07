// Canvas & Image Sequence Setup
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

// --- IMPORTANT: REPLACE WITH YOUR OWN SEQUENCE ---
// The prompt asked for 243 local frames (frame-001.jpg). 
// Since we don't have local files yet, I'm using a stunning public sequence 
// (Apple AirPods) of 147 frames to demonstrate the cinematic effect perfectly.
// To use your own: change FRAME_COUNT to 243, and update the URL string in getFrameUrl.
const FRAME_COUNT = 243;
const ZOOM_FACTOR = 1.35; // slightly zoom into frames to hide any letterboxing

function getFrameUrl(index) {
    const padIndex = (index + 1).toString().padStart(3, '0');
    return `./frames/ezgif-frame-${padIndex}.jpg`;
}

// Preloading Logic
const images = [];
let loadedCount = 0;

const loadingScreen = document.getElementById('loading-screen');
const loadingPercent = document.getElementById('loading-percent');
const loadingBar = document.getElementById('loading-bar');
const heroContent = document.getElementById('hero-content');

// Load all images
for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image();
    img.src = getFrameUrl(i);
    img.onload = () => {
        loadedCount++;
        const percent = Math.floor((loadedCount / FRAME_COUNT) * 100);
        loadingPercent.textContent = percent;
        loadingBar.style.width = percent + '%';
        
        if (loadedCount === FRAME_COUNT) {
            initApp();
        }
    };
    img.onerror = () => {
        // Fallback gracefully if an image fails to load
        loadedCount++;
        if (loadedCount === FRAME_COUNT) initApp();
    };
    images.push(img);
}

// Initialization after loading
function initApp() {
    // Hide Loading Screen
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        // Show Hero Content
        heroContent.style.opacity = '1';
    }, 1000);

    // Initial Resize and Draw
    resizeCanvas();
    drawFrame(0);

    // Listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseParallax);
}

// Canvas Resize Logic
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Redraw the current frame at the new size
    const scrollFraction = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(scrollFraction * FRAME_COUNT)) || 0;
    drawFrame(frameIndex);
}

// Canvas Rendering: Manual object-fit cover
function drawFrame(index) {
    if (!images[index]) return;
    const img = images[index];
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Math for manual object-fit: cover with ZOOM_FACTOR
    const imgAspect = img.width / img.height;
    const canvasAspect = canvas.width / canvas.height;
    
    let drawWidth, drawHeight;
    
    if (canvasAspect > imgAspect) {
        // Canvas is wider than image aspect
        drawWidth = canvas.width * ZOOM_FACTOR;
        drawHeight = (canvas.width / imgAspect) * ZOOM_FACTOR;
    } else {
        // Canvas is taller than image aspect
        drawWidth = canvas.height * imgAspect * ZOOM_FACTOR;
        drawHeight = canvas.height * ZOOM_FACTOR;
    }
    
    // Center the drawing area
    const drawX = (canvas.width - drawWidth) / 2;
    const drawY = (canvas.height - drawHeight) / 2;
    
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

// Scroll-to-Frame Mapping
let currentFrameIndex = 0;

function handleScroll() {
    // Calculate 0 to 1 fraction based on scroll position
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    
    // Map fraction to frame index
    const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(scrollFraction * FRAME_COUNT));
    
    if (frameIndex !== currentFrameIndex) {
        currentFrameIndex = frameIndex;
        // Use requestAnimationFrame for buttery-smooth performance
        requestAnimationFrame(() => drawFrame(currentFrameIndex));
    }
}

// Interactive Mouse Parallax (GSAP)
function handleMouseParallax(e) {
    // Normalize mouse coordinates (-1 to 1)
    const rx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ry = (e.clientY / window.innerHeight - 0.5) * 2;
    
    // Shift canvas position in opposite direction to create 3D depth
    gsap.to(canvas, {
        x: -rx * 40,
        y: -ry * 40,
        duration: 1,
        ease: 'power2.out'
    });
}

// GSAP Programmatic Scroll to Top
function scrollToTop(e) {
    if (e) e.preventDefault();
    gsap.to(window, {
        scrollTo: 0,
        duration: 1.5,
        ease: 'power3.inOut'
    });
}
