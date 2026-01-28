/**
 * 共享音效管理器
 * 為所有遊戲提供統一的音效系統
 */
class SharedAudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.masterVolume = 0.4;
        this.enabled = true;
        this.sounds = new Map();
        this.backgroundMusicEnabled = true;
        
        this.init();
    }
    
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.connect(this.audioContext.destination);
            this.masterGainNode.gain.value = this.masterVolume;
        } catch (error) {
            console.warn('共享音效系統初始化失敗:', error);
            this.enabled = false;
        }
    }
    
    playSound(frequency, duration, options = {}) {
        const {
            type = 'sine',
            volume = 0.5,
            modulation = null,
            attack = 0.01,
            decay = 0.1,
            sustain = 0.3,
            release = 0.1
        } = options;
        
        if (!this.enabled || !this.initialized) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGainNode);
            
            oscillator.type = type;
            oscillator.frequency.value = frequency;
            
            // 添加音頻調製（如果提供）
            if (modulation) {
                const lfo = this.audioContext.createOscillator();
                const lfoGain = this.audioContext.createGain();
                lfo.frequency.value = modulation.frequency;
                lfoGain.gain.value = modulation.amount;
                lfo.connect(lfoGain);
                lfoGain.connect(oscillator.frequency);
                lfo.start();
            }
            
            // ADSR包絡
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + attack);
            gainNode.gain.exponentialRampToValueAtTime(volume * sustain, now + attack + decay);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
            
        } catch (error) {
            console.warn('播放音效失敗:', error);
        }
    }
    
    playChord(frequencies, duration, options = {}) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playSound(freq, duration, options);
            }, index * (options.stagger || 50));
        });
    }
    
    playSequence(notes, options = {}) {
        notes.forEach((note, index) => {
            setTimeout(() => {
                this.playSound(note.frequency, note.duration, note.options || options);
            }, index * (options.interval || 100));
        });
    }
    
    createNoise(duration, type = 'white') {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            if (type === 'white') {
                output[i] = Math.random() * 2 - 1;
            } else if (type === 'pink') {
                // 簡化的粉色噪聲
                output[i] = (Math.random() * 2 - 1) * Math.pow(0.5, Math.random());
            }
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        return noise;
    }
    
    playNoise(duration, options = {}) {
        const {
            type = 'white',
            volume = 0.3,
            filter = { frequency: 1000, type: 'lowpass' }
        } = options;
        
        if (!this.enabled || !this.initialized) return;
        
        try {
            const noise = this.createNoise(duration, type);
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            
            noise.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.masterGainNode);
            
            // 應用濾波器設置
            if (filter) {
                filterNode.type = filter.type || 'lowpass';
                filterNode.frequency.value = filter.frequency || 1000;
                if (filter.Q) filterNode.Q.value = filter.Q;
            }
            
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            noise.start();
            noise.stop(this.audioContext.currentTime + duration);
            
        } catch (error) {
            console.warn('播放噪聲失敗:', error);
        }
    }
    
    // 觸覺反饋
    vibrate(pattern) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }
    
    // 音量控制
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = this.masterVolume;
        }
    }
    
    getVolume() {
        return this.masterVolume;
    }
    
    toggle(enabled) {
        this.enabled = enabled;
    }
    
    isEnabled() {
        return this.enabled;
    }
    
    isInitialized() {
        return this.initialized;
    }
    
    // 清理資源
    dispose() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.initialized = false;
    }
}

// 導出單例實例
const sharedAudio = new SharedAudioManager();