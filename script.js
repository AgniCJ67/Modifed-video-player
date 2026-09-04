// Video Elements
const video = document.getElementById('video');
const videoContainer = document.getElementById('videoContainer');
const playPauseBtn = document.getElementById('playPauseBtn');
const centerPlayBtn = document.getElementById('centerPlayBtn');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');

// Progress & Time
const progressSlider = document.getElementById('progressSlider');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

// Volume & Settings
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeIcon = document.querySelector('.volume-icon');
const muteIcon = document.querySelector('.mute-icon');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// UI and Panels
const emptyState = document.getElementById('emptyState');
const videoTitleDisplay = document.getElementById('videoTitleDisplay');
const videoInfoPanel = document.getElementById('videoInfoPanel');
const playlistTitle = document.getElementById('playlistTitle');
const currentPlaylistItem = document.getElementById('currentPlaylistItem');
const speedBtn = document.getElementById('speedBtn');
const speedOptions = document.getElementById('speedOptions');

// App Shell Elements
const appImportBtn = document.getElementById('appImportBtn');
const appVideoUpload = document.getElementById('appVideoUpload');
const appSettingsBtn = document.getElementById('appSettingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const themeSelect = document.getElementById('themeSelect');

// Filters
const brightSlider = document.getElementById('brightSlider');
const contrastSlider = document.getElementById('contrastSlider');
const satSlider = document.getElementById('satSlider');
const brightVal = document.getElementById('brightVal');
const contrastVal = document.getElementById('contrastVal');
const satVal = document.getElementById('satVal');
const resetSettingsBtn = document.getElementById('resetSettingsBtn');

let isScrubbing = false;
let idleTimer;

// --- Bulletproof Idle / Hide Controls Logic ---
function resetIdleTimer() {
    videoContainer.classList.remove('idle');
    clearTimeout(idleTimer);
    
    // Only fade out if a video is loaded AND actively playing
    if (!video.paused && !videoContainer.classList.contains('no-media')) {
        idleTimer = setTimeout(() => {
            videoContainer.classList.add('idle');
        }, 3000); // 3 seconds until controls fade
    }
}

// Reset idle timer on ANY interaction over the video area
['mousemove', 'mousedown', 'touchstart', 'click', 'keydown'].forEach(evt => {
    videoContainer.addEventListener(evt, resetIdleTimer);
});

// --- Video State Sync ---
video.addEventListener('play', () => {
    videoContainer.classList.remove('paused');
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    resetIdleTimer();
});

video.addEventListener('pause', () => {
    videoContainer.classList.add('paused');
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    
    // Clear timer so controls STAY visible when paused
    clearTimeout(idleTimer);
    videoContainer.classList.remove('idle'); 
});

function togglePlay(e) {
    if (!video.src || videoContainer.classList.contains('no-media')) return;
    
    if (video.paused) {
        video.play().catch(e => console.error(e));
    } else {
        video.pause();
    }
}
playPauseBtn.addEventListener('click', togglePlay);
centerPlayBtn.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);

// --- Rewind & Fast Forward ---
rewindBtn.addEventListener('click', () => {
    video.currentTime = Math.max(0, video.currentTime - 10);
});
forwardBtn.addEventListener('click', () => {
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
});

// --- Time and Smooth Progress ---
function formatTime(time) {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

video.addEventListener('loadedmetadata', () => { 
    durationEl.textContent = formatTime(video.duration); 
});

video.addEventListener('timeupdate', () => {
    if (!isScrubbing) {
        const percent = (video.currentTime / video.duration) * 100;
        progressFill.style.width = `${percent}%`;
        progressSlider.value = percent;
        currentTimeEl.textContent = formatTime(video.currentTime);
    }
});

progressSlider.addEventListener('input', (e) => {
    if (videoContainer.classList.contains('no-media')) return;
    isScrubbing = true;
    const percent = e.target.value;
    progressFill.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime((percent / 100) * video.duration);
});

progressSlider.addEventListener('change', (e) => {
    if (videoContainer.classList.contains('no-media')) return;
    video.currentTime = (e.target.value / 100) * video.duration;
    isScrubbing = false;
});

// --- Audio Controls ---
volumeSlider.addEventListener('input', (e) => {
    video.volume = e.target.value;
    video.muted = e.target.value === "0";
    volumeIcon.style.display = video.muted ? 'none' : 'block';
    muteIcon.style.display = video.muted ? 'block' : 'none';
});
muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    volumeSlider.value = video.muted ? 0 : video.volume;
    volumeIcon.style.display = video.muted ? 'none' : 'block';
    muteIcon.style.display = video.muted ? 'block' : 'none';
});

// --- Popups (Speed Menu) ---
function closePopups() { speedOptions.classList.remove('active'); }
speedBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = speedOptions.classList.contains('active');
    closePopups();
    if (!isActive) speedOptions.classList.add('active');
});

document.querySelectorAll('#speedOptions .popup-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
        e.stopPropagation();
        video.playbackRate = opt.dataset.speed;
        speedBtn.textContent = `${opt.dataset.speed}x`;
        document.querySelector('#speedOptions .active').classList.remove('active');
        opt.classList.add('active');
        closePopups();
    });
});
document.addEventListener('click', closePopups);

fullscreenBtn.addEventListener('click', () => {
    if (videoContainer.classList.contains('no-media')) return;
    if (!document.fullscreenElement) {
        if (videoContainer.requestFullscreen) videoContainer.requestFullscreen();
        else if (videoContainer.webkitRequestFullscreen) videoContainer.webkitRequestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
});

// --- App File Import (100% Bulletproof deletion of empty state) ---
appImportBtn.addEventListener('click', (e) => {
    e.preventDefault();
    appVideoUpload.click();
});

appVideoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // Prevent native controls from randomly showing up on mobile
        video.controls = false; 
        
        const fileURL = URL.createObjectURL(file);
        video.src = fileURL;
        video.load(); 
        
        // Strictly remove empty state
        videoContainer.classList.remove('no-media');
        if (emptyState) {
            emptyState.style.display = 'none'; // DOM deletion
        }
        
        // Show info panel below
        videoInfoPanel.style.opacity = '1';
        videoInfoPanel.style.pointerEvents = 'auto';
        
        // Name updates
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        videoTitleDisplay.textContent = fileName;
        playlistTitle.textContent = fileName;
        
        // Reset states
        progressFill.style.width = `0%`;
        progressSlider.value = 0;
        
        // Start playback
        video.play().catch(err => console.error("Playback Error:", err));
        
        // Reset input to allow re-upload
        e.target.value = ''; 
    }
});

// --- Settings & Visual Filters ---
appSettingsBtn.addEventListener('click', () => settingsModal.classList.add('active'));
closeSettings.addEventListener('click', () => settingsModal.classList.remove('active'));
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.classList.remove('active');
});

themeSelect.addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.value);
});

function applyFilters() {
    brightVal.textContent = brightSlider.value;
    contrastVal.textContent = contrastSlider.value;
    satVal.textContent = satSlider.value;
    video.style.filter = `brightness(${brightSlider.value}%) contrast(${contrastSlider.value}%) saturate(${satSlider.value}%)`;
}
brightSlider.addEventListener('input', applyFilters);
contrastSlider.addEventListener('input', applyFilters);
satSlider.addEventListener('input', applyFilters);

resetSettingsBtn.addEventListener('click', () => {
    brightSlider.value = 100;
    contrastSlider.value = 100;
    satSlider.value = 100;
    themeSelect.value = "dark";
    document.documentElement.setAttribute('data-theme', 'dark');
    applyFilters();
});
