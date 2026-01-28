/**
 * 共享性能管理器
 * 為所有遊戲提供統一的性能監控和優化
 */
class SharedPerformanceManager {
    constructor() {
        this.targetFPS = 60;
        this.currentFPS = 60;
        this.fpsHistory = [];
        this.maxHistoryLength = 60;
        this.qualityLevel = 'auto';
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.adaptiveQuality = true;
        this.monitoringEnabled = false;
        this.callbacks = new Set();
        
        this.init();
    }
    
    init() {
        this.detectDevicePerformance();
        this.loadSettings();
    }
    
    detectDevicePerformance() {
        const hardwareConcurrency = navigator.hardwareConcurrency || 2;
        const deviceMemory = navigator.deviceMemory || 4;
        const connection = navigator.connection ? navigator.connection.effectiveType : '4g';
        
        // 設置基準性能等級
        let deviceScore = 0;
        
        // CPU評分
        if (hardwareConcurrency >= 8) deviceScore += 4;
        else if (hardwareConcurrency >= 4) deviceScore += 3;
        else if (hardwareConcurrency >= 2) deviceScore += 2;
        else deviceScore += 1;
        
        // 內存評分
        if (deviceMemory >= 8) deviceScore += 3;
        else if (deviceMemory >= 4) deviceScore += 2;
        else if (deviceMemory >= 2) deviceScore += 1;
        
        // 網絡評分
        if (connection === '4g') deviceScore += 2;
        else if (connection === '3g') deviceScore += 1;
        
        // 根據設備評分確定初始質量級別
        if (deviceScore >= 7) {
            this.qualityLevel = 'high';
        } else if (deviceScore >= 4) {
            this.qualityLevel = 'medium';
        } else {
            this.qualityLevel = 'low';
        }
        
        this.deviceInfo = {
            hardwareConcurrency,
            deviceMemory,
            connection,
            score: deviceScore
        };
        
        console.log(`設備性能檢測完成:`, this.deviceInfo);
        console.log(`初始質量級別: ${this.qualityLevel}`);
    }
    
    loadSettings() {
        // 從共享存儲加載用戶設置
        if (typeof sharedStorage !== 'undefined') {
            const userQuality = sharedStorage.getSetting('qualityLevel', 'auto');
            if (userQuality !== 'auto') {
                this.qualityLevel = userQuality;
                this.adaptiveQuality = false;
            }
        }
    }
    
    startMonitoring() {
        if (this.monitoringEnabled) return;
        
        this.monitoringEnabled = true;
        this.monitor();
    }
    
    stopMonitoring() {
        this.monitoringEnabled = false;
    }
    
    monitor() {
        if (!this.monitoringEnabled) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        const currentFPS = 1000 / deltaTime;
        
        this.fpsHistory.push(currentFPS);
        if (this.fpsHistory.length > this.maxHistoryLength) {
            this.fpsHistory.shift();
        }
        
        // 計算平均FPS
        this.currentFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
        this.lastFrameTime = currentTime;
        this.frameCount++;
        
        // 定期檢查並調整性能
        if (this.frameCount % 60 === 0 && this.adaptiveQuality) {
            this.adjustQuality();
            this.notifyCallbacks();
        }
        
        requestAnimationFrame(() => this.monitor());
    }
    
    adjustQuality() {
        const avgFPS = this.currentFPS;
        const oldQuality = this.qualityLevel;
        
        if (avgFPS < 45 && this.qualityLevel !== 'low') {
            // 性能不足，降低質量
            this.qualityLevel = this.qualityLevel === 'high' ? 'medium' : 'low';
        } else if (avgFPS > 55 && this.qualityLevel !== 'high') {
            // 性能有餘，提升質量
            this.qualityLevel = this.qualityLevel === 'low' ? 'medium' : 'high';
        }
        
        if (oldQuality !== this.qualityLevel) {
            console.log(`性能自動調整: ${oldQuality} -> ${this.qualityLevel} (FPS: ${Math.round(avgFPS)})`);
            this.applyQualitySettings();
            this.saveSettings();
        }
    }
    
    applyQualitySettings() {
        const root = document.documentElement;
        
        const settings = this.getQualitySettings();
        
        // 應用CSS變量
        Object.keys(settings.css).forEach(key => {
            root.style.setProperty(key, settings.css[key]);
        });
        
        // 通知所有註冊的回調
        this.notifyCallbacks();
    }
    
    getQualitySettings() {
        const baseSettings = {
            high: {
                css: {
                    '--animation-duration': '0.15s',
                    '--particle-count': '100',
                    '--shadow-blur': '15px',
                    '--transition-duration': '0.3s'
                },
                maxParticles: 100,
                particleCount: 20,
                shouldSkipFrames: false,
                renderQuality: 1.0
            },
            medium: {
                css: {
                    '--animation-duration': '0.1s',
                    '--particle-count': '50',
                    '--shadow-blur': '10px',
                    '--transition-duration': '0.2s'
                },
                maxParticles: 50,
                particleCount: 10,
                shouldSkipFrames: false,
                renderQuality: 0.8
            },
            low: {
                css: {
                    '--animation-duration': '0.05s',
                    '--particle-count': '25',
                    '--shadow-blur': '5px',
                    '--transition-duration': '0.1s'
                },
                maxParticles: 25,
                particleCount: 5,
                shouldSkipFrames: true,
                renderQuality: 0.6
            }
        };
        
        return baseSettings[this.qualityLevel] || baseSettings.medium;
    }
    
    saveSettings() {
        if (typeof sharedStorage !== 'undefined') {
            sharedStorage.saveSetting('qualityLevel', this.qualityLevel);
        }
    }
    
    // 公共API方法
    getCurrentFPS() {
        return Math.round(this.currentFPS);
    }
    
    getQualityLevel() {
        return this.qualityLevel;
    }
    
    setQualityLevel(level) {
        if (['high', 'medium', 'low', 'auto'].includes(level)) {
            if (level === 'auto') {
                this.detectDevicePerformance();
                this.adaptiveQuality = true;
            } else {
                this.qualityLevel = level;
                this.adaptiveQuality = false;
            }
            this.applyQualitySettings();
            this.saveSettings();
        }
    }
    
    getMaxParticles() {
        const settings = this.getQualitySettings();
        return settings.maxParticles;
    }
    
    getParticleCount() {
        const settings = this.getQualitySettings();
        return settings.particleCount;
    }
    
    shouldSkipFrame() {
        const settings = this.getQualitySettings();
        return settings.shouldSkipFrames && this.currentFPS < 30;
    }
    
    getRenderQuality() {
        const settings = this.getQualitySettings();
        return settings.renderQuality;
    }
    
    getAnimationDuration() {
        const settings = this.getQualitySettings();
        return parseFloat(settings.css['--animation-duration']) * 1000; // 轉換為毫秒
    }
    
    // 回調系統
    onPerformanceChange(callback) {
        this.callbacks.add(callback);
        return () => this.callbacks.delete(callback); // 返回取消註冊函數
    }
    
    notifyCallbacks() {
        const data = {
            fps: this.currentFPS,
            quality: this.qualityLevel,
            settings: this.getQualitySettings()
        };
        
        this.callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.warn('性能回調執行失敗:', error);
            }
        });
    }
    
    // 性能統計
    getPerformanceStats() {
        return {
            currentFPS: Math.round(this.currentFPS),
            targetFPS: this.targetFPS,
            qualityLevel: this.qualityLevel,
            frameCount: this.frameCount,
            deviceInfo: this.deviceInfo,
            adaptiveQuality: this.adaptiveQuality,
            averageFPS: Math.round(
                this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
            )
        };
    }
    
    // 重置監控數據
    resetStats() {
        this.fpsHistory = [];
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
    }
    
    // 壓力測試
    runStressTest(duration = 5000) {
        console.log(`開始性能壓力測試 (${duration}ms)`);
        const startTime = performance.now();
        let frames = 0;
        
        const test = () => {
            const currentTime = performance.now();
            frames++;
            
            if (currentTime - startTime < duration) {
                requestAnimationFrame(test);
            } else {
                const testDuration = currentTime - startTime;
                const testFPS = Math.round((frames / testDuration) * 1000);
                console.log(`壓力測試完成: ${testFPS} FPS (${frames} frames in ${testDuration}ms)`);
                
                // 根據測試結果調整質量
                if (testFPS < 45) {
                    this.setQualityLevel('low');
                } else if (testFPS < 55) {
                    this.setQualityLevel('medium');
                } else {
                    this.setQualityLevel('high');
                }
            }
        };
        
        requestAnimationFrame(test);
    }
}

// 導出單例實例
const sharedPerformance = new SharedPerformanceManager();