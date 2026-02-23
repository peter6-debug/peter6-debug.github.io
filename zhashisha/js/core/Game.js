/**
 * 游戏核心类：管理全局游戏状态、玩家列表、回合流程、胜负判定
 * 所有核心逻辑的入口，无动画/音效
 */
class Game {
    constructor() {
        // 游戏全局状态
        this.state = {
            isStarted: false, // 游戏是否开始
            isOver: false, // 游戏是否结束
            currentTurnIndex: 0, // 当前回合玩家索引
            winner: null, // 胜利者
            mode: 'practice' // 游戏模式：practice(练习) / online(联机)
        };
        
        // 玩家列表
        this.players = [];
        // 游戏日志
        this.logs = [];
    }

    /**
     * 初始化游戏
     * @param {string} mode - 游戏模式：practice/online
     * @param {Array} playerConfigs - 玩家配置数组
     */
    static init(mode = 'practice', playerConfigs = []) {
        // 重置游戏状态
        Game.state = {
            isStarted: false,
            isOver: false,
            currentTurnIndex: 0,
            winner: null,
            mode: mode
        };
        
        // 清空玩家列表和日志
        Game.players = [];
        Game.logs = [];
        
        // 创建玩家
        playerConfigs.forEach((config, index) => {
            const hero = getHeroById(config.heroId) || HEROES[0];
            const player = new Player(
                config.id || `player_${index}`,
                config.name || `玩家${index + 1}`,
                hero,
                config.isSelf || false
            );
            Game.players.push(player);
        });
        
        // 更新UI
        DOM.updatePlayerList();
        DOM.updateGameLog();
        
        console.log(`游戏初始化完成，模式：${mode}，玩家数：${Game.players.length}`);
    }

    /**
     * 开始游戏
     */
    static start() {
        if (Game.state.isStarted) return;
        
        Game.state.isStarted = true;
        
        // 初始化牌堆
        randomUtil.shuffleCardPool();
        
        // 给每个玩家发初始手牌（4张）
        Game.players.forEach(player => {
            if (player.isAlive) {
                player.drawCards(4);
            }
        });
        
        // 设置第一个玩家的回合
        Game.players[0].resetTurnStatus();
        Game.state.currentTurnIndex = 0;
        
        Game.addLog('游戏开始！');
        Game.addLog(`当前回合：${Game.players[0].name}`);
        
        // 更新UI
        DOM.updatePlayerTurn(Game.players[0]);
        DOM.updateHandCards(Game.players.find(p => p.isSelf));
        
        console.log('游戏开始');
    }

    /**
     * 切换到下一玩家回合
     */
    static nextTurn() {
        if (!Game.state.isStarted || Game.state.isOver) return;
        
        // 找到下一个存活的玩家
        let nextIndex = (Game.state.currentTurnIndex + 1) % Game.players.length;
        while (!Game.players[nextIndex].isAlive) {
            nextIndex = (nextIndex + 1) % Game.players.length;
            // 防止无限循环（只剩一个玩家）
            if (nextIndex === Game.state.currentTurnIndex) break;
        }
        
        // 更新回合状态
        Game.players[Game.state.currentTurnIndex].isTurn = false;
        Game.state.currentTurnIndex = nextIndex;
        const nextPlayer = Game.players[nextIndex];
        
        // 重置下一玩家回合状态
        nextPlayer.resetTurnStatus();
        
        Game.addLog(`当前回合：${nextPlayer.name}`);
        
        // 更新UI
        DOM.updatePlayerTurn(nextPlayer);
        
        // 自动摸牌（回合开始）
        if (nextPlayer.isSelf) {
            // 本地玩家手动摸牌
            Game.addLog('请点击"摸牌"按钮开始你的回合');
        } else {
            // AI玩家自动摸牌
            setTimeout(() => {
                nextPlayer.drawCards(2);
                Game.aiPlayTurn(nextPlayer);
            }, 1000);
        }
    }

    /**
     * AI玩家回合自动操作
     * @param {Player} aiPlayer - AI玩家
     */
    static aiPlayTurn(aiPlayer) {
        if (!aiPlayer.isAlive || !aiPlayer.isTurn) return;
        
        // 简单AI逻辑：优先攻击血量最低的玩家
        const targetPlayers = Game.players.filter(p => p.isAlive && p.id !== aiPlayer.id);
        if (targetPlayers.length === 0) {
            aiPlayer.endTurn();
            return;
        }
        
        // 找到血量最低的目标
        const target = targetPlayers.sort((a, b) => a.currentHp - b.currentHp)[0];
        
        // 查找手牌中的攻击牌
        const attackCards = aiPlayer.handCards.filter(c => c.id.includes('ji-ming'));
        if (attackCards.length > 0) {
            // 使用第一张攻击牌
            aiPlayer.playCard(attackCards[0], target);
        }
        
        // 随机出牌（简单AI）
        setTimeout(() => {
            if (aiPlayer.handCards.length > 0 && Math.random() > 0.5) {
                const randomCard = aiPlayer.handCards[0];
                aiPlayer.playCard(randomCard, target);
            }
            
            // 结束回合
            setTimeout(() => {
                aiPlayer.endTurn();
            }, 1000);
        }, 1000);
    }

    /**
     * 检查游戏是否结束
     */
    static checkGameOver() {
        // 统计存活玩家
        const alivePlayers = Game.players.filter(p => p.isAlive);
        
        // 只剩一个玩家则游戏结束
        if (alivePlayers.length <= 1) {
            Game.state.isOver = true;
            Game.state.winner = alivePlayers[0] || null;
            
            if (Game.state.winner) {
                Game.addLog(`游戏结束！胜利者：${Game.state.winner.name}`);
            } else {
                Game.addLog('游戏结束！无存活玩家');
            }
            
            // 更新UI
            DOM.showGameResult(Game.state.winner);
        }
    }

    /**
     * 添加游戏日志
     * @param {string} content - 日志内容
     */
    static addLog(content) {
        const time = new Date().toLocaleTimeString();
        const log = `[${time}] ${content}`;
        Game.logs.push(log);
        
        // 更新UI
        DOM.addGameLog(log);
        
        console.log(log);
    }

    /**
     * 获取当前回合玩家
     * @returns {Player|null} 当前回合玩家
     */
    static getCurrentPlayer() {
        return Game.players[Game.state.currentTurnIndex] || null;
    }

    /**
     * 获取本地玩家
     * @returns {Player|null} 本地玩家
     */
    static getSelfPlayer() {
        return Game.players.find(p => p.isSelf) || null;
    }

    /**
     * 重新开始游戏
     */
    static restart() {
        Game.init(Game.state.mode, Game.players.map(p => ({
            id: p.id,
            name: p.name,
            heroId: p.hero.id,
            isSelf: p.isSelf
        })));
        Game.start();
    }

    /**
     * 结束游戏
     */
    static end() {
        Game.state.isOver = true;
        Game.addLog('游戏已手动结束');
    }
}

// 全局初始化游戏类
window.Game = Game;
