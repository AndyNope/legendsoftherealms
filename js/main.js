// Main entry point
document.addEventListener('DOMContentLoaded', () => {
    console.log('Legends of the Realm - Starting...');
    
    // Initialize game
    game = new Game();
    
    // Initialize audio
    initAudio();
    
    // Show main menu
    showMainMenu();
});

// Audio Manager
const AudioManager = {
    music: null,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    musicEnabled: true,
    
    init() {
        this.music = document.getElementById('background-music');
        if (this.music) {
            this.music.volume = this.musicVolume;
            this.music.load(); // Force load the audio
        }
    },
    
    createBackgroundMusic() {
        // Create a simple audio context for background music
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            
            // We'll play it when user starts the game (autoplay policies)
            this.audioContext = audioContext;
            this.musicPlaying = false;
        } catch(e) {
            console.log('Web Audio API not supported');
        }
    },
    
    playMusic() {
        if (!this.musicEnabled || this.musicPlaying) return;
        
        // Try to play the audio file first
        if (this.music && this.music.src) {
            this.music.play().then(() => {
                console.log('Background music started');
                this.musicPlaying = true;
            }).catch(e => {
                console.log('Music play failed, trying synthesized:', e);
                // Fallback to synthesized music
                this.playSynthesizedMusic();
            });
        } else {
            // No audio file, use synthesized
            this.playSynthesizedMusic();
        }
    },
    
    playSynthesizedMusic() {
        if (!this.audioContext) {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
            } catch(e) {
                console.log('Web Audio API not supported');
                return;
            }
        }
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Create a simple background music loop
        this.createMusicLoop();
        
        this.musicPlaying = true;
    },
    
    createMusicLoop() {
        if (!this.audioContext || this.musicLoopPlaying) return;
        
        const ctx = this.audioContext;
        const notes = [
            { freq: 440, start: 0, duration: 0.5 },      // A4
            { freq: 523, start: 0.5, duration: 0.5 },    // C5
            { freq: 659, start: 1, duration: 0.5 },      // E5
            { freq: 523, start: 1.5, duration: 0.5 },    // C5
            { freq: 440, start: 2, duration: 0.5 },      // A4
            { freq: 392, start: 2.5, duration: 0.5 },    // G4
            { freq: 440, start: 3, duration: 1 }         // A4
        ];
        
        const playLoop = () => {
            if (!this.musicPlaying) return;
            
            const startTime = ctx.currentTime;
            
            notes.forEach(note => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.frequency.value = note.freq;
                osc.type = 'sine';
                
                gain.gain.setValueAtTime(0, startTime + note.start);
                gain.gain.linearRampToValueAtTime(this.musicVolume * 0.1, startTime + note.start + 0.05);
                gain.gain.linearRampToValueAtTime(0, startTime + note.start + note.duration);
                
                osc.start(startTime + note.start);
                osc.stop(startTime + note.start + note.duration);
            });
            
            // Loop after 4 seconds
            setTimeout(playLoop, 4000);
        };
        
        this.musicLoopPlaying = true;
        playLoop();
    },
    
    stopMusic() {
        this.musicPlaying = false;
        this.musicLoopPlaying = false;
        if (this.music) {
            this.music.pause();
        }
    },
    
    setMusicVolume(volume) {
        this.musicVolume = volume / 100;
        if (this.music) {
            this.music.volume = this.musicVolume;
        }
    },
    
    setSfxVolume(volume) {
        this.sfxVolume = volume / 100;
    },
    
    playSound(type) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Different sounds for different actions
        switch(type) {
            case 'click':
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;
            case 'attack':
                oscillator.frequency.value = 200;
                gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.2);
                break;
            case 'build':
                oscillator.frequency.value = 600;
                gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);
                break;
        }
    }
};

function initAudio() {
    AudioManager.init();
}

// Settings Functions
function updateMusicVolume(value) {
    document.getElementById('music-volume-label').textContent = value + '%';
    AudioManager.setMusicVolume(value);
}

function updateSfxVolume(value) {
    document.getElementById('sfx-volume-label').textContent = value + '%';
    AudioManager.setSfxVolume(value);
}

function updateScrollSpeed(value) {
    document.getElementById('scroll-speed-label').textContent = value;
    CONFIG.SCROLL_SPEED = parseInt(value);
}

function toggleGrid(checked) {
    if (game && game.renderer) {
        game.renderer.showGrid = checked;
    }
}

function toggleEdgeScroll(checked) {
    if (game) {
        game.edgeScrollEnabled = checked;
    }
}

// Menu Functions
function showMainMenu() {
    hideAllScreens();
    document.getElementById('main-menu').classList.remove('hidden');
}

function startStoryMode() {
    hideAllScreens();
    document.getElementById('story-select').classList.remove('hidden');
    
    // Load available missions
    const missions = game.missionManager.getAvailableMissions('story');
    const missionList = document.getElementById('mission-list');
    missionList.innerHTML = '';
    
    missions.forEach(mission => {
        const missionItem = document.createElement('div');
        missionItem.className = 'mission-item';
        if (!mission.unlocked) {
            missionItem.classList.add('locked');
        }
        
        missionItem.innerHTML = `
            <h3>${mission.title}</h3>
            <p>${mission.description}</p>
            <p><strong>Ziel:</strong> ${mission.objective}</p>
        `;
        
        if (mission.unlocked) {
            missionItem.onclick = () => loadMission(mission.id, 'story');
        }
        
        missionList.appendChild(missionItem);
    });
}

function startBattleMode() {
    hideAllScreens();
    document.getElementById('story-select').classList.remove('hidden');
    
    // Load battle missions
    const missions = game.missionManager.getAvailableMissions('battle');
    const missionList = document.getElementById('mission-list');
    missionList.innerHTML = '';
    
    missions.forEach(mission => {
        const missionItem = document.createElement('div');
        missionItem.className = 'mission-item';
        
        missionItem.innerHTML = `
            <h3>${mission.title}</h3>
            <p>${mission.description}</p>
            <p><strong>Schwierigkeit:</strong> ${getDifficultyText(mission.difficulty)}</p>
        `;
        
        missionItem.onclick = () => loadMission(mission.id, 'battle');
        
        missionList.appendChild(missionItem);
    });
}

function loadMission(missionId, type) {
    console.log('Loading mission:', missionId, type);
    
    if (game.missionManager.loadMission(missionId, type)) {
        game.missionManager.setupMission();
        startGame();
    } else {
        alert('Mission konnte nicht geladen werden!');
    }
}

function startGame() {
    hideAllScreens();
    document.getElementById('game-container').classList.remove('hidden');
    
    // Update mission info
    const mission = game.missionManager.currentMission;
    document.getElementById('mission-title').textContent = mission.title;
    document.getElementById('mission-objective').textContent = mission.objective;
    
    // Update resources
    game.updateResourceUI();
    
    // Start background music
    AudioManager.playMusic();
    
    // Start game loop (resize happens in start())
    game.start();
}

function showSettings() {
    hideAllScreens();
    document.getElementById('settings-screen').classList.remove('hidden');
    
    // Load current settings
    document.getElementById('music-volume').value = AudioManager.musicVolume * 100;
    document.getElementById('music-volume-label').textContent = Math.round(AudioManager.musicVolume * 100) + '%';
    document.getElementById('sfx-volume').value = AudioManager.sfxVolume * 100;
    document.getElementById('sfx-volume-label').textContent = Math.round(AudioManager.sfxVolume * 100) + '%';
    document.getElementById('scroll-speed').value = CONFIG.SCROLL_SPEED;
    document.getElementById('scroll-speed-label').textContent = CONFIG.SCROLL_SPEED;
}

function closeSettings() {
    showMainMenu();
}

function backToMenu() {
    showMainMenu();
}

function pauseGame() {
    game.paused = !game.paused;
    if (game.paused) {
        document.getElementById('pause-menu').classList.remove('hidden');
    } else {
        document.getElementById('pause-menu').classList.add('hidden');
    }
}

function resumeGame() {
    game.paused = false;
    document.getElementById('pause-menu').classList.add('hidden');
}

function restartMission() {
    const missionId = game.missionManager.currentMission.id;
    const type = game.missionManager.missionType;
    
    // Reset game
    game.stop();
    game = new Game();
    
    // Reload mission
    loadMission(missionId, type);
    
    // Hide overlays
    document.getElementById('pause-menu').classList.add('hidden');
    document.getElementById('defeat-screen').classList.add('hidden');
}

function showGameMenu() {
    pauseGame();
}

function quitToMenu() {
    game.stop();
    game = new Game();
    
    hideAllScreens();
    showMainMenu();
}

function toggleMusic() {
    const btn = document.getElementById('music-toggle');
    const icon = btn.querySelector('i');
    
    if (AudioManager.musicEnabled) {
        AudioManager.musicEnabled = false;
        AudioManager.stopMusic();
        icon.className = 'fa-solid fa-volume-xmark';
    } else {
        AudioManager.musicEnabled = true;
        AudioManager.playMusic();
        icon.className = 'fa-solid fa-volume-high';
    }
}

function nextMission() {
    const currentId = game.missionManager.currentMission.id;
    const nextId = currentId + 1;
    
    // Check if next mission exists
    const nextMission = MISSIONS.story.find(m => m.id === nextId);
    
    if (nextMission && nextMission.unlocked) {
        game.stop();
        game = new Game();
        loadMission(nextId, 'story');
        document.getElementById('victory-screen').classList.add('hidden');
    } else {
        quitToMenu();
    }
}

function hideAllScreens() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('story-select').classList.add('hidden');
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('pause-menu').classList.add('hidden');
    document.getElementById('victory-screen').classList.add('hidden');
    document.getElementById('defeat-screen').classList.add('hidden');
    document.getElementById('settings-screen').classList.add('hidden');
}

function getDifficultyText(difficulty) {
    const texts = {
        easy: 'Einfach ⭐',
        medium: 'Mittel ⭐⭐',
        hard: 'Schwer ⭐⭐⭐'
    };
    return texts[difficulty] || difficulty;
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.getElementById('game-container').classList.contains('hidden')) {
            backToMenu();
        } else {
            pauseGame();
        }
    }
});

// Prevent context menu on canvas
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
});

console.log('Game initialized successfully!');
