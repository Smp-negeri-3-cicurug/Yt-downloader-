// =============================
// DEVICE DETECTION & OPTIMIZATION
// =============================
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isLowEnd = isMobile || navigator.hardwareConcurrency <= 4;

// =============================
// CONSTELLATION BACKGROUND (OPTIMIZED)
// =============================
const canvas = document.getElementById('constellation');
const ctx = canvas.getContext('2d');

// Reduced settings for mobile
const config = {
  connectionDistance: isLowEnd ? 140 : 200,
  particleDensity: isLowEnd ? 10000 : 5000, // More particles!
  maxParticles: isLowEnd ? 50 : 80
};

let particles = [];
let animationFrameId;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2.2 + 1;
    this.vx = (Math.random() - 0.5) * 0.5; // Faster movement
    this.vy = (Math.random() - 0.5) * 0.5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }

  draw() {
    ctx.fillStyle = '#60a5fa';
    if (!isLowEnd) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#60a5fa';
    } else {
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#60a5fa';
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function connectParticles() {
  // Optimized connection check
  if (isLowEnd && particles.length > 60) {
    // Only connect close particles on low-end
    for (let a = 0; a < particles.length; a++) {
      let connections = 0;
      for (let b = a + 1; b < particles.length; b++) {
        if (connections > 4) break; // More connections per particle
        
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.connectionDistance) {
          const opacity = (1 - dist / config.connectionDistance);
          
          // BRIGHT BLUE GRADIENT LINE
          const gradient = ctx.createLinearGradient(
            particles[a].x, particles[a].y,
            particles[b].x, particles[b].y
          );
          gradient.addColorStop(0, `rgba(96, 165, 250, ${opacity * 0.9})`);
          gradient.addColorStop(0.5, `rgba(59, 130, 246, ${opacity})`);
          gradient.addColorStop(1, `rgba(96, 165, 250, ${opacity * 0.9})`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(59, 130, 246, 0.8)';
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
          ctx.shadowBlur = 0;
          connections++;
        }
      }
    }
  } else {
    // Full connections on desktop
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.connectionDistance) {
          const opacity = (1 - dist / config.connectionDistance);
          
          // BRIGHT BLUE GRADIENT LINE
          const gradient = ctx.createLinearGradient(
            particles[a].x, particles[a].y,
            particles[b].x, particles[b].y
          );
          gradient.addColorStop(0, `rgba(96, 165, 250, ${opacity * 0.95})`);
          gradient.addColorStop(0.5, `rgba(59, 130, 246, ${opacity})`);
          gradient.addColorStop(1, `rgba(96, 165, 250, ${opacity * 0.95})`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(59, 130, 246, 1)';
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }
    }
  }
}

function initParticles() {
  particles = [];
  const count = Math.min(
    Math.floor((canvas.width * canvas.height) / config.particleDensity),
    config.maxParticles
  );
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

let lastTime = 0;
const targetFPS = isLowEnd ? 45 : 60; // Higher FPS on mobile
const frameInterval = 1000 / targetFPS;

function animate(currentTime) {
  animationFrameId = requestAnimationFrame(animate);
  
  const deltaTime = currentTime - lastTime;
  
  if (deltaTime < frameInterval) return;
  
  lastTime = currentTime - (deltaTime % frameInterval);
  
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach(p => { 
    p.update(); 
    p.draw(); 
  });
  
  if (!isLowEnd || particles.length <= 30) {
    connectParticles();
  }
}

function resizeCanvas() {
  // Get viewport dimensions without keyboard
  const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  
  canvas.width = vw;
  canvas.height = vh;
  initParticles();
}

// Debounce resize for better performance
let resizeTimeout;
let isKeyboardOpen = false;

// Handle visual viewport changes (keyboard open/close)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    // Detect if keyboard is opening
    const newHeight = window.visualViewport.height;
    const screenHeight = window.screen.height;
    
    // If height reduced significantly, keyboard is open
    if (newHeight < screenHeight * 0.7) {
      isKeyboardOpen = true;
      // Don't resize canvas when keyboard opens
      return;
    } else {
      isKeyboardOpen = false;
    }
    
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 250);
  });
}

// Regular window resize (orientation change, etc)
window.addEventListener('resize', () => {
  if (isKeyboardOpen) return; // Don't resize if keyboard is open
  
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(resizeCanvas, 250);
});

resizeCanvas();
animate(0);

// Pause animation when tab is not visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrameId);
  } else {
    animate(0);
  }
});

// =============================
// MUSIC DOWNLOADER LOGIC
// =============================

const API_URL = '/api';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const thumbnail = document.getElementById('thumbnail');
const title = document.getElementById('title');
const duration = document.getElementById('duration');
const audioPlayer = document.getElementById('audioPlayer');
const downloadMP3Btn = document.getElementById('downloadMP3Btn');
const downloadVideoBtn = document.getElementById('downloadVideoBtn');
const restartBtn = document.getElementById('restartBtn');

let currentSong = null;

// Helper to detect if input is URL
function isYouTubeURL(text) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(text);
}

// Debounce function for better performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add focus/blur handlers to prevent resize on keyboard
searchInput.addEventListener('focus', () => {
  isKeyboardOpen = true;
});

searchInput.addEventListener('blur', () => {
  setTimeout(() => {
    isKeyboardOpen = false;
  }, 300);
});

searchBtn.addEventListener('click', searchSong);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchSong();
    }
});

const thumbnailWrapper = document.querySelector('.thumbnail-wrapper');
if (thumbnailWrapper) {
    thumbnailWrapper.addEventListener('click', () => {
        if (audioPlayer.src) {
            if (audioPlayer.paused) {
                audioPlayer.play().catch(err => console.log('Play error:', err));
            } else {
                audioPlayer.pause();
            }
        }
    });
}

downloadMP3Btn.addEventListener('click', () => handleDownload('mp3'));
downloadVideoBtn.addEventListener('click', () => handleDownload('mp4'));
restartBtn.addEventListener('click', restartSearch);

function restartSearch() {
    hideAll();
    searchInput.value = '';
    searchInput.focus();
    currentSong = null;
}

async function searchSong() {
    const query = searchInput.value.trim();
    
    if (!query) {
        showError('Masukkan judul lagu atau URL YouTube!');
        return;
    }

    // Disable button to prevent double clicks
    searchBtn.disabled = true;
    
    hideAll();
    loading.classList.remove('hidden');

    try {
        let searchResults;
        
        // Check if input is URL
        if (isYouTubeURL(query)) {
            // Direct URL download
            searchResults = await searchYouTubeByURL(query);
        } else {
            // Search by query
            searchResults = await searchYouTube(query);
        }
        
        if (searchResults) {
            displayResult(searchResults);
        } else {
            showError('Video tidak ditemukan. Coba kata kunci lain.');
        }
    } catch (err) {
        console.error(err);
        showError('Terjadi kesalahan saat mencari video.');
    } finally {
        searchBtn.disabled = false;
    }
}

async function searchYouTubeByURL(url) {
    try {
        const response = await fetch(`${API_URL}/search-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Search failed');
        }

        return {
            title: result.data.title,
            thumbnail: result.data.thumbnail,
            duration: result.data.duration,
            videoUrl: result.data.url,
            videoId: result.data.videoId
        };
    } catch (error) {
        console.error('Search URL error:', error);
        throw error;
    }
}

async function searchYouTube(query) {
    try {
        const response = await fetch(`${API_URL}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Search failed');
        }

        return {
            title: result.data.title,
            thumbnail: result.data.thumbnail,
            duration: result.data.duration,
            videoUrl: result.data.url,
            videoId: result.data.videoId
        };
    } catch (error) {
        console.error('Search error:', error);
        throw error;
    }
}

async function displayResult(data) {
    currentSong = data;
    
    loading.classList.add('hidden');
    result.classList.remove('hidden');
    
    // Lazy load thumbnail
    const img = new Image();
    img.onload = () => {
        thumbnail.src = data.thumbnail;
        thumbnail.alt = data.title;
    };
    img.src = data.thumbnail;
    
    title.textContent = data.title;
    duration.textContent = `Durasi: ${data.duration}`;
    
    // Load audio in background
    try {
        const audioData = await downloadAudio(data.videoUrl);
        if (audioData.success) {
            audioPlayer.src = audioData.data.audioUrl;
            currentSong.audioUrl = audioData.data.audioUrl;
        }
    } catch (error) {
        console.error('Audio preview error:', error);
    }
}

async function downloadAudio(videoUrl) {
    try {
        const response = await fetch(`${API_URL}/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: videoUrl, format: 'mp3' })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
}

async function handleDownload(format) {
    if (!currentSong) return;

    const isMP3 = format === 'mp3';
    const btn = isMP3 ? downloadMP3Btn : downloadVideoBtn;
    const formatName = isMP3 ? 'MP3' : 'Video';

    try {
        btn.disabled = true;
        btn.innerHTML = `<div class="loader" style="width: 20px; height: 20px; margin: 0; border-width: 3px;"></div> <span>Downloading...</span>`;

        if (currentSong.downloadUrls && currentSong.downloadUrls[format]) {
            downloadFile(currentSong.downloadUrls[format], currentSong.title, format);
        } else {
            const downloadData = await downloadMedia(currentSong.videoUrl, format);
            if (downloadData.success) {
                downloadFile(downloadData.data.downloadUrl, downloadData.data.title, format);
                
                // Cache download URL
                if (!currentSong.downloadUrls) currentSong.downloadUrls = {};
                currentSong.downloadUrls[format] = downloadData.data.downloadUrl;
            } else {
                throw new Error('Download failed');
            }
        }

        showNotification(`Download ${formatName} dimulai! 🎉`);
    } catch (error) {
        console.error('Download error:', error);
        showNotification(`Download ${formatName} gagal, coba lagi! ❌`);
    } finally {
        btn.disabled = false;
        const icon = isMP3 ? 
            `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
            </svg>` :
            `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>`;
        btn.innerHTML = `${icon}<span>Download ${formatName}</span>`;
    }
}

function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.mp3`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showError(message) {
    hideAll();
    error.classList.remove('hidden');
    errorMessage.textContent = message;
    
    setTimeout(() => {
        error.classList.add('hidden');
    }, 5000);
}

function hideAll() {
    loading.classList.add('hidden');
    result.classList.add('hidden');
    error.classList.add('hidden');
}

let notificationTimeout;
function showNotification(message) {
    // Clear existing notification
    const existingNotif = document.querySelector('.custom-notification');
    if (existingNotif) {
        existingNotif.remove();
        clearTimeout(notificationTimeout);
    }
    
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(14, 165, 233, 0.95));
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #fff;
        padding: 16px 24px;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.2);
        z-index: 10000;
        font-weight: 600;
        font-family: 'Poppins', sans-serif;
        max-width: 300px;
        font-size: 0.9em;
        transform: translateX(400px);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    notificationTimeout = setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationFrameId);
});