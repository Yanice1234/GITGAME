/**
 * 共享存儲管理器
 * 為所有遊戲提供統一的本地存儲功能
 */
class SharedStorageManager {
    constructor() {
        this.prefix = 'gamehub_';
        this.defaultSettings = {
            masterVolume: 0.4,
            soundEnabled: true,
            vibrationEnabled: true,
            qualityLevel: 'auto',
            language: 'zh-Hant'
        };
    }
    
    // 保存數據
    save(key, value, gamePrefix = '') {
        try {
            const fullKey = this.prefix + (gamePrefix || 'common') + '_' + key;
            const data = {
                value: value,
                timestamp: Date.now(),
                version: '1.0'
            };
            localStorage.setItem(fullKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('保存數據失敗:', error);
            return false;
        }
    }
    
    // 讀取數據
    load(key, defaultValue = null, gamePrefix = '') {
        try {
            const fullKey = this.prefix + (gamePrefix || 'common') + '_' + key;
            const data = localStorage.getItem(fullKey);
            
            if (!data) return defaultValue;
            
            const parsed = JSON.parse(data);
            return parsed.value !== undefined ? parsed.value : defaultValue;
        } catch (error) {
            console.warn('讀取數據失敗:', error);
            return defaultValue;
        }
    }
    
    // 刪除數據
    remove(key, gamePrefix = '') {
        try {
            const fullKey = this.prefix + (gamePrefix || 'common') + '_' + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.warn('刪除數據失敗:', error);
            return false;
        }
    }
    
    // 清理特定遊戲的所有數據
    clearGameData(gamePrefix) {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix + gamePrefix + '_')) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.warn('清理遊戲數據失敗:', error);
            return false;
        }
    }
    
    // 獲取所有遊戲的存儲信息
    getStorageInfo() {
        const info = {
            totalSize: 0,
            games: {}
        };
        
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    const size = localStorage[key].length;
                    info.totalSize += size;
                    
                    // 解析遊戲名稱
                    const parts = key.split('_');
                    if (parts.length >= 3) {
                        const gameName = parts[1];
                        if (!info.games[gameName]) {
                            info.games[gameName] = { count: 0, size: 0 };
                        }
                        info.games[gameName].count++;
                        info.games[gameName].size += size;
                    }
                }
            });
        } catch (error) {
            console.warn('獲取存儲信息失敗:', error);
        }
        
        return info;
    }
    
    // 遊戲分數管理
    saveHighScore(gameName, score, additionalData = {}) {
        const currentHighScore = this.getHighScore(gameName);
        if (score > currentHighScore) {
            this.save('highScore', score, gameName);
            this.save('highScoreData', {
                score: score,
                date: new Date().toISOString(),
                ...additionalData
            }, gameName);
            return true;
        }
        return false;
    }
    
    getHighScore(gameName) {
        return this.load('highScore', 0, gameName);
    }
    
    getHighScoreData(gameName) {
        return this.load('highScoreData', null, gameName);
    }
    
    // 遊戲進度管理
    saveGameState(gameName, state) {
        return this.save('gameState', state, gameName);
    }
    
    getGameState(gameName) {
        return this.load('gameState', null, gameName);
    }
    
    hasGameState(gameName) {
        return this.getGameState(gameName) !== null;
    }
    
    // 全局設置管理
    saveSetting(key, value) {
        this.save(key, value);
    }
    
    getSetting(key, defaultValue = null) {
        return this.load(key, defaultValue !== undefined ? defaultValue : this.defaultSettings[key]);
    }
    
    getAllSettings() {
        const settings = { ...this.defaultSettings };
        Object.keys(settings).forEach(key => {
            const value = this.getSetting(key);
            if (value !== null) {
                settings[key] = value;
            }
        });
        return settings;
    }
    
    resetSettings() {
        Object.keys(this.defaultSettings).forEach(key => {
            this.remove(key);
        });
    }
    
    // 統計管理
    incrementStat(gameName, statName, increment = 1) {
        const current = this.load('stat_' + statName, 0, gameName);
        return this.save('stat_' + statName, current + increment, gameName);
    }
    
    getStat(gameName, statName) {
        return this.load('stat_' + statName, 0, gameName);
    }
    
    getAllStats(gameName) {
        const stats = {};
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix + gameName + '_stat_')) {
                    const statName = key.replace(this.prefix + gameName + '_stat_', '');
                    stats[statName] = this.load('stat_' + statName, 0, gameName);
                }
            });
        } catch (error) {
            console.warn('獲取統計數據失敗:', error);
        }
        return stats;
    }
    
    // 數據導出/導入
    exportData() {
        const data = {};
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    data[key] = localStorage.getItem(key);
                }
            });
        } catch (error) {
            console.warn('導出數據失敗:', error);
        }
        return data;
    }
    
    importData(data, overwrite = false) {
        let success = true;
        try {
            Object.keys(data).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    if (overwrite || !localStorage.getItem(key)) {
                        localStorage.setItem(key, data[key]);
                    }
                }
            });
        } catch (error) {
            console.warn('導入數據失敗:', error);
            success = false;
        }
        return success;
    }
    
    // 清理所有數據
    clearAll() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.warn('清理所有數據失敗:', error);
            return false;
        }
    }
}

// 導出單例實例
const sharedStorage = new SharedStorageManager();