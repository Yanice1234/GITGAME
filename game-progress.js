/**
 * 遊戲進度保存系統
 * 統一的遊戲進度管理，支持所有三個遊戲
 */

class GameProgressSystem {
    constructor() {
        this.version = '1.0.0';
        this.storageKey = 'gamePortalProgress';
        this.progress = this.loadProgress();
    }

    /**
     * 加載所有遊戲進度
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('加載遊戲進度失敗:', error);
        }

        // 默認進度結構
        return {
            version: this.version,
            lastUpdated: new Date().toISOString(),
            games: {
                tetris: {
                    highScore: 0,
                    totalScore: 0,
                    totalLines: 0,
                    totalFullClears: 0,
                    gamesPlayed: 0,
                    gamesWon: 0,
                    bestLevel: 1,
                    settings: {
                        soundEnabled: true,
                        effectsEnabled: true,
                        difficulty: 'normal'
                    },
                    lastPlayed: null,
                    achievements: []
                },
                game2048: {
                    highScore: 0,
                    totalScore: 0,
                    gamesPlayed: 0,
                    gamesWon: 0,
                    bestTile: 0,
                    totalMoves: 0,
                    settings: {
                        theme: 'default',
                        soundEnabled: true,
                        undoEnabled: true
                    },
                    lastPlayed: null,
                    achievements: []
                },
                handGame: {
                    highScore: 0,
                    totalScore: 0,
                    gamesPlayed: 0,
                    survivalTime: 0,
                    starsCollected: 0,
                    obstaclesDodged: 0,
                    settings: {
                        controlMode: 'hand',
                        soundEnabled: true,
                        backgroundMusic: true,
                        performanceMode: 'auto'
                    },
                    lastPlayed: null,
                    achievements: []
                }
            },
            overall: {
                totalGamesPlayed: 0,
                totalPlayTime: 0,
                firstPlayDate: new Date().toISOString(),
                lastPlayDate: new Date().toISOString()
            }
        };
    }

    /**
     * 保存所有遊戲進度
     */
    saveProgress() {
        try {
            this.progress.lastUpdated = new Date().toISOString();
            this.progress.overall.lastPlayDate = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
            return true;
        } catch (error) {
            console.error('保存遊戲進度失敗:', error);
            return false;
        }
    }

    /**
     * 更新俄羅斯方塊遊戲進度
     */
    updateTetrisProgress(score, lines, fullClears, level, gameWon = false) {
        const game = this.progress.games.tetris;
        
        // 更新最高分
        if (score > game.highScore) {
            game.highScore = score;
        }
        
        // 更新統計數據
        game.totalScore += score;
        game.totalLines += lines;
        game.totalFullClears += fullClears;
        game.gamesPlayed++;
        
        if (gameWon) {
            game.gamesWon++;
        }
        
        if (level > game.bestLevel) {
            game.bestLevel = level;
        }
        
        game.lastPlayed = new Date().toISOString();
        this.progress.overall.totalGamesPlayed++;
        
        this.saveProgress();
        return game;
    }

    /**
     * 更新2048遊戲進度
     */
    update2048Progress(score, moves, bestTile, gameWon = false) {
        const game = this.progress.games.game2048;
        
        // 更新最高分
        if (score > game.highScore) {
            game.highScore = score;
        }
        
        // 更新最佳方塊
        if (bestTile > game.bestTile) {
            game.bestTile = bestTile;
        }
        
        // 更新統計數據
        game.totalScore += score;
        game.totalMoves += moves;
        game.gamesPlayed++;
        
        if (gameWon) {
            game.gamesWon++;
        }
        
        game.lastPlayed = new Date().toISOString();
        this.progress.overall.totalGamesPlayed++;
        
        this.saveProgress();
        return game;
    }

    /**
     * 更新手勢遊戲進度
     */
    updateHandGameProgress(score, survivalTime, starsCollected, obstaclesDodged) {
        const game = this.progress.games.handGame;
        
        // 更新最高分
        if (score > game.highScore) {
            game.highScore = score;
        }
        
        // 更新統計數據
        game.totalScore += score;
        game.survivalTime += survivalTime;
        game.starsCollected += starsCollected;
        game.obstaclesDodged += obstaclesDodged;
        game.gamesPlayed++;
        
        game.lastPlayed = new Date().toISOString();
        this.progress.overall.totalGamesPlayed++;
        
        this.saveProgress();
        return game;
    }

    /**
     * 更新手勢遊戲進度（兼容別名）
     */
    updateGestureGameProgress(score) {
        return this.updateHandGameProgress(score, 0, 0, 0);
    }

    /**
     * 更新手勢遊戲成就
     */
    updateGestureGameAchievements(achievements) {
        const game = this.progress.games.handGame;
        game.achievements = achievements;
        this.saveProgress();
        return true;
    }

    /**
     * 獲取遊戲設置
     */
    getGameSettings(gameName) {
        const game = this.progress.games[gameName];
        return game ? game.settings : null;
    }

    /**
     * 更新遊戲設置
     */
    updateGameSettings(gameName, settings) {
        const game = this.progress.games[gameName];
        if (game) {
            game.settings = { ...game.settings, ...settings };
            this.saveProgress();
            return true;
        }
        return false;
    }

    /**
     * 添加遊戲成就
     */
    addAchievement(gameName, achievement) {
        const game = this.progress.games[gameName];
        if (game) {
            // 檢查是否已存在相同成就
            const exists = game.achievements.some(a => a.id === achievement.id);
            if (!exists) {
                achievement.unlockedAt = new Date().toISOString();
                game.achievements.push(achievement);
                this.saveProgress();
                return true;
            }
        }
        return false;
    }

    /**
     * 獲取遊戲統計摘要
     */
    getGameSummary(gameName) {
        const game = this.progress.games[gameName];
        if (!game) return null;
        
        return {
            highScore: game.highScore,
            gamesPlayed: game.gamesPlayed,
            winRate: game.gamesPlayed > 0 ? (game.gamesWon / game.gamesPlayed * 100).toFixed(1) : 0,
            lastPlayed: game.lastPlayed,
            achievementsCount: game.achievements.length
        };
    }

    /**
     * 獲取所有遊戲摘要
     */
    getAllGameSummaries() {
        return {
            tetris: this.getGameSummary('tetris'),
            game2048: this.getGameSummary('game2048'),
            handGame: this.getGameSummary('handGame'),
            overall: this.progress.overall
        };
    }

    /**
     * 重置遊戲進度
     */
    resetGameProgress(gameName) {
        if (gameName === 'all') {
            // 重置所有遊戲
            this.progress = this.loadProgress();
            this.progress.version = this.version;
            this.saveProgress();
            return true;
        } else if (this.progress.games[gameName]) {
            // 重置單個遊戲
            const defaultProgress = this.loadProgress();
            this.progress.games[gameName] = defaultProgress.games[gameName];
            this.saveProgress();
            return true;
        }
        return false;
    }

    /**
     * 導出遊戲進度
     */
    exportProgress() {
        return JSON.stringify(this.progress, null, 2);
    }

    /**
     * 導入遊戲進度
     */
    importProgress(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            
            // 驗證基本結構
            if (imported.games && imported.overall) {
                this.progress = imported;
                this.progress.version = this.version;
                this.progress.lastUpdated = new Date().toISOString();
                this.saveProgress();
                return true;
            }
        } catch (error) {
            console.error('導入遊戲進度失敗:', error);
        }
        return false;
    }

    /**
     * 獲取遊戲進度統計
     */
    getProgressStats() {
        const games = Object.values(this.progress.games);
        const totalAchievements = games.reduce((sum, game) => sum + game.achievements.length, 0);
        const totalScore = games.reduce((sum, game) => sum + game.totalScore, 0);
        
        return {
            totalGames: this.progress.overall.totalGamesPlayed,
            totalAchievements,
            totalScore,
            completionPercentage: Math.min(100, (totalAchievements / 30 * 100)).toFixed(1) // 假設最多30個成就
        };
    }
}

// 創建全局實例
window.GameProgress = new GameProgressSystem();

// 兼容舊版遊戲的輔助函數
window.GameProgress.legacySupport = {
    /**
     * 遷移舊版俄羅斯方塊分數
     */
    migrateTetrisScore() {
        try {
            const oldScore = localStorage.getItem('tetrisHighScore');
            if (oldScore) {
                const score = parseInt(oldScore, 10);
                if (score > 0) {
                    const game = GameProgress.progress.games.tetris;
                    if (score > game.highScore) {
                        game.highScore = score;
                        GameProgress.saveProgress();
                        console.log('遷移俄羅斯方塊最高分:', score);
                    }
                }
            }
        } catch (error) {
            console.error('遷移俄羅斯方塊分數失敗:', error);
        }
    },

    /**
     * 遷移舊版2048分數
     */
    migrate2048Score() {
        try {
            const oldScore = localStorage.getItem('bestScore2048');
            if (oldScore) {
                const score = parseInt(oldScore, 10);
                if (score > 0) {
                    const game = GameProgress.progress.games.game2048;
                    if (score > game.highScore) {
                        game.highScore = score;
                        GameProgress.saveProgress();
                        console.log('遷移2048最高分:', score);
                    }
                }
            }
        } catch (error) {
            console.error('遷移2048分數失敗:', error);
        }
    },

    /**
     * 遷移舊版手勢遊戲分數
     */
    migrateHandGameScore() {
        try {
            const oldScore = localStorage.getItem('handGameHighScore');
            if (oldScore) {
                const score = parseInt(oldScore, 10);
                if (score > 0) {
                    const game = GameProgress.progress.games.handGame;
                    if (score > game.highScore) {
                        game.highScore = score;
                        GameProgress.saveProgress();
                        console.log('遷移手勢遊戲最高分:', score);
                    }
                }
            }
        } catch (error) {
            console.error('遷移手勢遊戲分數失敗:', error);
        }
    },

    /**
     * 遷移所有舊版分數
     */
    migrateAllLegacyScores() {
        this.migrateTetrisScore();
        this.migrate2048Score();
        this.migrateHandGameScore();
    }
};

// 自動遷移舊版分數
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.GameProgress.legacySupport.migrateAllLegacyScores();
    }, 1000);
});

console.log('遊戲進度系統已加載');