/**
 * 游戏核心类 - 修复无游戏过程问题
 */
class Game {
    constructor() {
        this.state = {
            isStarted: false,
            isOver: false,
            currentTurnIndex: 0,
            winner: null,
            mode: 'practice'
        };
        
        this.players = [];
        this.logs = [];
    }

    static init(mode = 'practice', playerConfigs = []) {
        Game.state = {
            isStarted: false,
            isOver: false,
            currentTurnIndex: 0,
            winner: null,
            mode: mode
        };
        
        Game.players = [];
        Game.logs = [];
        
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
        
        DOM.updatePlayerList();
        DOM.updateGameLog();
        
        console.log(`游戏初始化完成，模式：${mode}，玩家数：${Game.players.length}`);
    }

    static start() {
        if (Game.state.isStarted) return;
        
        Game.state.isStarted = true;
        
        randomUtil.shuffleCardPool();
        
        // 发初始手牌
        Game.players.forEach(player => {
            if (player.isAlive) {
                player.drawCards(4);
            }
        });
        
        // 设置第一个玩家回合
        Game.players[0].resetTurnStatus();
        Game.state.currentTurnIndex = 0;
        
        Game.addLog('游戏开始！');
        Game.addLog(`当前回合：${Game.players[0].name}`);
        
        DOM.updatePlayerTurn(Game.players[0]);
        DOM.updateHandCards(Game.getSelfPlayer());
        
        console.log('游戏开始');
    }

    static nextTurn() {
        if (!Game.state.isStarted || Game.state.isOver) return;
        
        // 找到下一个存活玩家
        let nextIndex = (Game.state.currentTurnIndex + 1) % Game.players.length;
        while (!Game.players[nextIndex].isAlive) {
            nextIndex = (nextIndex + 1) % Game.players.length;
            if (nextIndex === Game.state.currentTurnIndex) break;
        }
        
        // 更新回合状态
        Game.players[Game.state.currentTurnIndex].isTurn = false;
        Game.state.currentTurnIndex = nextIndex;
        const nextPlayer = Game.players[nextIndex];
        
        nextPlayer.resetTurnStatus();
        
        Game.addLog(`当前回合：${nextPlayer.name}`);
        
        DOM.updatePlayerTurn(nextPlayer);
        
        // 修复：AI玩家自动操作
        if (!nextPlayer.isSelf) {
            setTimeout(() => {
                Game.aiPlayTurn(nextPlayer);
            }, 1000);
        }
    }

    // 修复：完善AI游戏逻辑
    static aiPlayTurn(aiPlayer) {
        if (!aiPlayer.isAlive || !aiPlayer.isTurn) return;
        
        Game.addLog(`${aiPlayer.name}（AI）开始行动`);
        
        // AI自动摸牌
        aiPlayer.drawCards(2);
        Game.addLog(`${aiPlayer.name}（AI）摸了2张牌`);
        
        // 查找攻击牌
        const attackCards = aiPlayer.handCards.filter(c => c.id.includes('ji-ming'));
        const targetPlayers = Game.players.filter(p => p.isAlive && p.id !== aiPlayer.id);
        
        // AI优先攻击
        if (attackCards.length > 0 && targetPlayers.length > 0) {
            const target = targetPlayers.sort((a, b) => a.currentHp - b.currentHp)[0];
            aiPlayer.playCard(attackCards[0], target);
            Game.addLog(`${aiPlayer.name}（AI）对${target.name}使用了【${attackCards[0].name}】`);
        }
        
        // AI随机出牌
        setTimeout(() => {
            if (aiPlayer.handCards.length > 3) {
                const randomCard = aiPlayer.handCards[0];
                const randomTarget = targetPlayers.length > 0 ? targetPlayers[0] : null;
                aiPlayer.playCard(randomCard, randomTarget);
                Game.addLog(`${aiPlayer.name}（AI）打出了【${randomCard.name}】`);
            }
            
            // AI结束回合
            setTimeout(() => {
                aiPlayer.endTurn();
                Game.addLog(`${aiPlayer.name}（AI）结束了回合`);
            }, 1000);
        }, 1500);
    }

    static checkGameOver() {
        const alivePlayers = Game.players.filter(p => p.isAlive);
        
        if (alivePlayers.length <= 1) {
            Game.state.isOver = true;
            Game.state.winner = alivePlayers[0] || null;
            
            if (Game.state.winner) {
                Game.addLog(`游戏结束！胜利者：${Game.state.winner.name}`);
            } else {
                Game.addLog('游戏结束！无存活玩家');
            }
            
            DOM.showGameResult(Game.state.winner);
        }
    }

    static addLog(content) {
        const time = new Date().toLocaleTimeString();
        const log = `[${time}] ${content}`;
        Game.logs.push(log);
        
        DOM.addGameLog(log);
        console.log(log);
    }

    static getCurrentPlayer() {
        return Game.players[Game.state.currentTurnIndex] || null;
    }

    static getSelfPlayer() {
        return Game.players.find(p => p.isSelf) || null;
    }

    static restart() {
        Game.init(Game.state.mode, Game.players.map(p => ({
            id: p.id,
            name: p.name,
            heroId: p.hero.id,
            isSelf: p.isSelf
        })));
        Game.start();
    }

    static end() {
        Game.state.isOver = true;
        Game.addLog('游戏已手动结束');
    }
}

window.Game = Game;
