/**
 * 統一的移動設備檢測和適配系統
 * 為所有遊戲提供一致的移動設備優化
 */

class MobileOptimizer {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        this.isTouchDevice = this.detectTouch();
        this.isLowEndDevice = this.detectLowEnd();
        this.screenSize = this.getScreenSize();
        this.orientation = this.getOrientation();
        this.browserInfo = this.getBrowserInfo();
        
        this.init();
    }
    
    init() {
        console.log('移動設備優化系統初始化');
        console.log(`設備類型: ${this.getDeviceType()}`);
        console.log(`屏幕尺寸: ${this.screenSize.width}x${this.screenSize.height}`);
        console.log(`方向: ${this.orientation}`);
        
        this.applyGlobalOptimizations();
        this.setupEventListeners();
        this.saveDeviceInfo();
    }
    
    // 檢測移動設備
    detectMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    }
    
    // 檢測平板設備
    detectTablet() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /iPad|Android(?!.*Mobile)|Tablet|Silk/i.test(userAgent);
    }
    
    // 檢測觸摸設備
    detectTouch() {
        return 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 || 
               navigator.msMaxTouchPoints > 0;
    }
    
    // 檢測低端設備
    detectLowEnd() {
        const hardwareConcurrency = navigator.hardwareConcurrency || 2;
        const deviceMemory = navigator.deviceMemory || 4;
        const connection = navigator.connection ? navigator.connection.effectiveType : '4g';
        
        // 低端設備標準
        const isLowCPU = hardwareConcurrency < 4;
        const isLowMemory = deviceMemory < 4;
        const isSlowNetwork = connection === 'slow-2g' || connection === '2g' || connection === '3g';
        
        return isLowCPU || isLowMemory || isSlowNetwork;
    }
    
    // 獲取屏幕尺寸
    getScreenSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1
        };
    }
    
    // 獲取設備方向
    getOrientation() {
        if (window.screen && window.screen.orientation) {
            return window.screen.orientation.type;
        } else if (window.orientation !== undefined) {
            return Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';
        }
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }
    
    // 獲取瀏覽器信息
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'unknown';
        let version = 'unknown';
        
        if (ua.indexOf('Chrome') > -1) {
            browser = 'Chrome';
            const match = ua.match(/Chrome\/(\d+)/);
            version = match ? match[1] : 'unknown';
        } else if (ua.indexOf('Safari') > -1) {
            browser = 'Safari';
            const match = ua.match(/Version\/(\d+)/);
            version = match ? match[1] : 'unknown';
        } else if (ua.indexOf('Firefox') > -1) {
            browser = 'Firefox';
            const match = ua.match(/Firefox\/(\d+)/);
            version = match ? match[1] : 'unknown';
        }
        
        return { browser, version };
    }
    
    // 獲取設備類型
    getDeviceType() {
        if (this.isTablet) return 'tablet';
        if (this.isMobile) return 'mobile';
        return 'desktop';
    }
    
    // 應用全局優化
    applyGlobalOptimizations() {
        if (this.isMobile || this.isTouchDevice) {
            this.applyMobileOptimizations();
        }
        
        if (this.isLowEndDevice) {
            this.applyLowEndOptimizations();
        }
        
        // 防止移動設備上的縮放
        this.preventZoom();
        
        // 改善觸摸體驗
        this.improveTouchExperience();
    }
    
    // 應用移動設備優化
    applyMobileOptimizations() {
        console.log('應用移動設備優化');
        
        // 添加移動設備CSS類
        document.documentElement.classList.add('is-mobile');
        if (this.isTouchDevice) {
            document.documentElement.classList.add('is-touch');
        }
        
        // 設置視口meta標籤
        this.setViewportMeta();
        
        // 調整字體大小
        this.adjustFontSizes();
        
        // 優化動畫性能
        this.optimizeAnimations();
    }
    
    // 應用低端設備優化
    applyLowEndOptimizations() {
        console.log('應用低端設備優化');
        
        document.documentElement.classList.add('is-low-end');
        
        // 減少動畫和特效
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
        document.documentElement.style.setProperty('--particle-count', '10');
        
        // 降低圖形質量提示
        this.showLowEndWarning();
    }
    
    // 設置視口meta標籤
    setViewportMeta() {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        
        // 優化的視口設置
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    }
    
    // 調整字體大小
    adjustFontSizes() {
        const baseSize = this.screenSize.width < 768 ? 14 : 16;
        document.documentElement.style.fontSize = `${baseSize}px`;
    }
    
    // 優化動畫性能
    optimizeAnimations() {
        // 使用will-change優化性能
        const style = document.createElement('style');
        style.textContent = `
            .optimize-performance {
                will-change: transform, opacity;
                transform: translateZ(0);
                backface-visibility: hidden;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 防止縮放
    preventZoom() {
        if (!this.isTouchDevice) return;
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
        
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });
    }
    
    // 改善觸摸體驗
    improveTouchExperience() {
        if (!this.isTouchDevice) return;
        
        // 添加觸摸反饋樣式
        const style = document.createElement('style');
        style.textContent = `
            .touch-feedback:active {
                transform: scale(0.95);
                transition: transform 0.1s ease;
            }
            
            .touch-target {
                min-height: 44px;
                min-width: 44px;
            }
            
            * {
                -webkit-tap-highlight-color: transparent;
            }
        `;
        document.head.appendChild(style);
        
        // 為按鈕添加觸摸目標類
        setTimeout(() => {
            const buttons = document.querySelectorAll('button, .btn, [role="button"]');
            buttons.forEach(button => {
                button.classList.add('touch-target');
            });
        }, 100);
    }
    
    // 顯示低端設備警告
    showLowEndWarning() {
        // 只在第一次訪問時顯示
        if (localStorage.getItem('lowEndWarningShown')) return;
        
        setTimeout(() => {
            const warning = document.createElement('div');
            warning.className = 'low-end-warning';
            warning.innerHTML = `
                <div style="
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(255, 100, 0, 0.9);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 10px;
                    z-index: 10000;
                    max-width: 300px;
                    text-align: center;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                ">
                    <strong>性能優化模式</strong><br>
                    已自動調整設置以確保流暢體驗
                    <button style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        padding: 4px 12px;
                        border-radius: 4px;
                        margin-top: 8px;
                        cursor: pointer;
                    " onclick="this.parentElement.parentElement.remove(); localStorage.setItem('lowEndWarningShown', 'true');">
                        知道了
                    </button>
                </div>
            `;
            document.body.appendChild(warning);
            
            // 5秒後自動隱藏
            setTimeout(() => {
                if (warning.parentNode) {
                    warning.parentNode.removeChild(warning);
                    localStorage.setItem('lowEndWarningShown', 'true');
                }
            }, 5000);
        }, 2000);
    }
    
    // 設置事件監聽器
    setupEventListeners() {
        // 方向變化監聽
        window.addEventListener('orientationchange', () => {
            this.orientation = this.getOrientation();
            this.onOrientationChange();
        });
        
        // 窗口大小變化監聽
        window.addEventListener('resize', () => {
            this.screenSize = this.getScreenSize();
            this.onResize();
        });
        
        // 頁面可見性監聽（節省資源）
        document.addEventListener('visibilitychange', () => {
            this.onVisibilityChange();
        });
    }
    
    // 方向變化處理
    onOrientationChange() {
        console.log(`方向變化: ${this.orientation}`);
        
        // 添加方向CSS類
        document.documentElement.classList.remove('portrait', 'landscape');
        document.documentElement.classList.add(this.orientation);
        
        // 通知其他組件
        this.dispatchEvent('orientationchange', { orientation: this.orientation });
    }
    
    // 窗口大小變化處理
    onResize() {
        console.log(`窗口大小變化: ${this.screenSize.width}x${this.screenSize.height}`);
        
        // 更新CSS變量
        document.documentElement.style.setProperty('--window-width', `${this.screenSize.width}px`);
        document.documentElement.style.setProperty('--window-height', `${this.screenSize.height}px`);
        
        // 通知其他組件
        this.dispatchEvent('resize', { size: this.screenSize });
    }
    
    // 頁面可見性變化處理
    onVisibilityChange() {
        const isHidden = document.hidden;
        console.log(`頁面可見性: ${isHidden ? '隱藏' : '可見'}`);
        
        if (isHidden) {
            // 頁面隱藏時節省資源
            this.dispatchEvent('pagehide');
        } else {
            // 頁面顯示時恢復
            this.dispatchEvent('pageshow');
        }
    }
    
    // 保存設備信息
    saveDeviceInfo() {
        const deviceInfo = {
            type: this.getDeviceType(),
            screen: this.screenSize,
            orientation: this.orientation,
            browser: this.browserInfo,
            timestamp: new Date().toISOString()
        };
        
        // 保存到localStorage供其他頁面使用
        try {
            localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
        } catch (e) {
            console.warn('無法保存設備信息到localStorage:', e);
        }
    }
    
    // 分發自定義事件
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`mobileoptimizer:${eventName}`, {
            detail: {
                ...detail,
                optimizer: this
            }
        });
        document.dispatchEvent(event);
    }
    
    // 公共方法：檢查是否為移動設備
    isMobileDevice() {
        return this.isMobile;
    }
    
    // 公共方法：檢查是否為觸摸設備
    isTouchDevice() {
        return this.isTouchDevice;
    }
    
    // 公共方法：檢查是否為低端設備
    isLowEndDevice() {
        return this.isLowEndDevice;
    }
    
    // 公共方法：獲取設備信息
    getDeviceInfo() {
        return {
            type: this.getDeviceType(),
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            isTouch: this.isTouchDevice,
            isLowEnd: this.isLowEndDevice,
            screen: this.screenSize,
            orientation: this.orientation,
            browser: this.browserInfo
        };
    }
    
    // 公共方法：應用遊戲特定優化
    optimizeForGame(gameType) {
        const optimizations = {
            'tetris': this.optimizeTetris.bind(this),
            '2048': this.optimize2048.bind(this),
            'handgame': this.optimizeHandGame.bind(this)
        };
        
        if (optimizations[gameType]) {
            optimizations[gameType]();
        }
    }
    
    // 俄羅斯方塊優化
    optimizeTetris() {
        if (this.isMobile) {
            // 顯示虛擬控制
            const mobileControls = document.getElementById('mobile-controls');
            if (mobileControls) {
                mobileControls.style.display = 'block';
            }
            
            // 調整遊戲區域大小
            const canvas = document.getElementById('tetris');
            if (canvas && this.screenSize.width < 768) {
                canvas.style.width = '100%';
                canvas.style.maxWidth = '300px';
            }
        }
    }
    
    // 2048遊戲優化
    optimize2048() {
        if (this.isTouchDevice) {
            // 顯示虛擬控制
            const virtualControls = document.getElementById('virtual-controls');
            if (virtualControls) {
                virtualControls.style.display = 'block';
            }
            
            // 調整網格大小
            const grid = document.querySelector('.grid');
            if (grid && this.screenSize.width < 768) {
                grid.style.width = '280px';
                grid.style.height = '280px';
            }
        }
    }
    
    // 手勢遊戲優化
    optimizeHandGame() {
        if (this.isMobile) {
            // 默認選擇觸摸模式
            const touchRadio = document.querySelector('input[value="touch"]');
            if (touchRadio) {
                touchRadio.checked = true;
            }
            
            // 降低攝影機質量以節省資源
            const cameraView = document.querySelector('.camera-view');
            if (cameraView) {
                cameraView.style.opacity = '0.2';
            }
        }
    }
}

// 創建全局實例
window.MobileOptimizer = new MobileOptimizer();

// 導出供其他模塊使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileOptimizer;
}