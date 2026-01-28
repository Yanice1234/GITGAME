/**
 * 共享輸入管理器
 * 為所有遊戲提供統一的輸入處理（鍵盤、觸摸、手勢）
 */
class SharedInputManager {
    constructor() {
        this.keys = new Map();
        this.touches = new Map();
        this.gestures = new Map();
        this.callbacks = new Map();
        this.enabled = true;
        
        this.init();
    }
    
    init() {
        this.setupKeyboardEvents();
        this.setupTouchEvents();
        this.setupGestureEvents();
    }
    
    // 鍵盤事件處理
    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;
            
            const key = e.key.toLowerCase();
            this.keys.set(key, true);
            
            // 觸發回調
            this.triggerCallback('keydown', {
                key: key,
                originalEvent: e,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                altKey: e.altKey
            });
            
            // 防止默認行為（如果設置了）
            if (this.shouldPreventDefault('keydown', key)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (!this.enabled) return;
            
            const key = e.key.toLowerCase();
            this.keys.set(key, false);
            
            // 觸發回調
            this.triggerCallback('keyup', {
                key: key,
                originalEvent: e
            });
        });
        
        // 失去焦點時重置所有按鍵
        window.addEventListener('blur', () => {
            this.keys.clear();
        });
    }
    
    // 觸摸事件處理
    setupTouchEvents() {
        const touchTargets = new Set();
        
        const addTouchTarget = (element) => {
            if (touchTargets.has(element)) return;
            touchTargets.add(element);
            
            element.addEventListener('touchstart', (e) => {
                if (!this.enabled) return;
                
                const touches = Array.from(e.changedTouches);
                touches.forEach(touch => {
                    this.touches.set(touch.identifier, {
                        id: touch.identifier,
                        startX: touch.clientX,
                        startY: touch.clientY,
                        currentX: touch.clientX,
                        currentY: touch.clientY,
                        startTime: Date.now()
                    });
                });
                
                this.triggerCallback('touchstart', {
                    touches: touches,
                    originalEvent: e
                });
                
                e.preventDefault();
            }, { passive: false });
            
            element.addEventListener('touchmove', (e) => {
                if (!this.enabled) return;
                
                const touches = Array.from(e.changedTouches);
                touches.forEach(touch => {
                    const touchData = this.touches.get(touch.identifier);
                    if (touchData) {
                        touchData.currentX = touch.clientX;
                        touchData.currentY = touch.clientY;
                    }
                });
                
                this.triggerCallback('touchmove', {
                    touches: touches,
                    originalEvent: e
                });
                
                e.preventDefault();
            }, { passive: false });
            
            element.addEventListener('touchend', (e) => {
                if (!this.enabled) return;
                
                const touches = Array.from(e.changedTouches);
                touches.forEach(touch => {
                    const touchData = this.touches.get(touch.identifier);
                    if (touchData) {
                        // 計算滑動信息
                        const deltaX = touchData.currentX - touchData.startX;
                        const deltaY = touchData.currentY - touchData.startY;
                        const duration = Date.now() - touchData.startTime;
                        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                        
                        this.triggerCallback('touchend', {
                            touches: touches,
                            originalEvent: e,
                            swipe: {
                                deltaX: deltaX,
                                deltaY: deltaY,
                                distance: distance,
                                duration: duration,
                                direction: this.getSwipeDirection(deltaX, deltaY)
                            }
                        });
                        
                        this.touches.delete(touch.identifier);
                    }
                });
                
                e.preventDefault();
            }, { passive: false });
        };
        
        // 自動為遊戲畫布添加觸摸支持
        const addTouchSupportToCanvas = () => {
            const canvases = document.querySelectorAll('canvas');
            canvases.forEach(canvas => {
                addTouchTarget(canvas);
            });
        };
        
        // 初始添加
        addTouchSupportToCanvas();
        
        // 監聽DOM變化
        const observer = new MutationObserver(() => {
            addTouchSupportToCanvas();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    // 手勢事件處理
    setupGestureEvents() {
        // 滑動手勢檢測
        this.gestureThresholds = {
            minSwipeDistance: 30,
            maxSwipeTime: 500,
            minSwipeVelocity: 0.1
        };
    }
    
    // 公共API方法
    isKeyPressed(key) {
        return this.keys.get(key.toLowerCase()) || false;
    }
    
    getPressedKeys() {
        return Array.from(this.keys.entries())
            .filter(([key, pressed]) => pressed)
            .map(([key]) => key);
    }
    
    getActiveTouches() {
        return Array.from(this.touches.values());
    }
    
    getTouchCount() {
        return this.touches.size;
    }
    
    // 回調系統
    on(event, callback) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, new Set());
        }
        this.callbacks.get(event).add(callback);
        
        // 返回取消註冊函數
        return () => {
            const callbacks = this.callbacks.get(event);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }
    
    off(event, callback) {
        const callbacks = this.callbacks.get(event);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }
    
    triggerCallback(event, data) {
        const callbacks = this.callbacks.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.warn(`輸入回調執行失敗 (${event}):`, error);
                }
            });
        }
    }
    
    // 方向鍵和WASD的便捷方法
    getDirection() {
        const directions = {
            up: this.isKeyPressed('arrowup') || this.isKeyPressed('w'),
            down: this.isKeyPressed('arrowdown') || this.isKeyPressed('s'),
            left: this.isKeyPressed('arrowleft') || this.isKeyPressed('a'),
            right: this.isKeyPressed('arrowright') || this.isKeyPressed('d')
        };
        
        // 返回主要方向
        for (const [dir, active] of Object.entries(directions)) {
            if (active) return dir;
        }
        
        return null;
    }
    
    getMovementVector() {
        return {
            x: (this.isKeyPressed('arrowright') || this.isKeyPressed('d') ? 1 : 0) -
               (this.isKeyPressed('arrowleft') || this.isKeyPressed('a') ? 1 : 0),
            y: (this.isKeyPressed('arrowdown') || this.isKeyPressed('s') ? 1 : 0) -
               (this.isKeyPressed('arrowup') || this.isKeyPressed('w') ? 1 : 0)
        };
    }
    
    // 手勢檢測
    getSwipeDirection(deltaX, deltaY) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (absX < this.gestureThresholds.minSwipeDistance && 
            absY < this.gestureThresholds.minSwipeDistance) {
            return null;
        }
        
        if (absX > absY) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }
    
    isValidSwipe(swipeData) {
        const { distance, duration, deltaX, deltaY } = swipeData;
        
        // 檢查最小距離
        if (distance < this.gestureThresholds.minSwipeDistance) {
            return false;
        }
        
        // 檢查最大時間
        if (duration > this.gestureThresholds.maxSwipeTime) {
            return false;
        }
        
        // 檢查最小速度
        const velocity = distance / duration;
        if (velocity < this.gestureThresholds.minSwipeVelocity) {
            return false;
        }
        
        return true;
    }
    
    // 設置管理
    setGestureThresholds(thresholds) {
        this.gestureThresholds = { ...this.gestureThresholds, ...thresholds };
    }
    
    setPreventDefault(event, key, prevent = true) {
        if (!this.preventDefaultConfig) {
            this.preventDefaultConfig = new Map();
        }
        
        if (!this.preventDefaultConfig.has(event)) {
            this.preventDefaultConfig.set(event, new Set());
        }
        
        const eventKeys = this.preventDefaultConfig.get(event);
        if (prevent) {
            eventKeys.add(key);
        } else {
            eventKeys.delete(key);
        }
    }
    
    shouldPreventDefault(event, key) {
        const eventKeys = this.preventDefaultConfig?.get(event);
        return eventKeys?.has(key) || false;
    }
    
    // 啟用/禁用
    enable() {
        this.enabled = true;
    }
    
    disable() {
        this.enabled = false;
        this.keys.clear();
        this.touches.clear();
    }
    
    // 狀態查詢
    getState() {
        return {
            enabled: this.enabled,
            pressedKeys: this.getPressedKeys(),
            activeTouches: this.getActiveTouches(),
            touchCount: this.getTouchCount(),
            direction: this.getDirection(),
            movementVector: this.getMovementVector()
        };
    }
    
    // 重置狀態
    reset() {
        this.keys.clear();
        this.touches.clear();
    }
    
    // 清理資源
    dispose() {
        this.reset();
        this.callbacks.clear();
    }
}

// 導出單例實例
const sharedInput = new SharedInputManager();