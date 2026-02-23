/**
 * AI逻辑模块 - 诈尸杀小学生版
 * 包含AI决策、出牌策略、目标选择等核心逻辑
 */

// AI玩家类
class AIPlayer {
    constructor(id, name, character) {
        this.id = id;
        this.name = name || `AI-${id}`;
        this.character = character;
        this.level = 'normal'; // AI难度：easy/normal/hard
    }

    /**
     * AI回合决策
     * @param {Object} gameState 游戏状态
     * @returns {Object} 决策结果
     */
    makeDecision(gameState) {
        const self = gameState.players.find(p => p.id === this.id);
        if (!self || self.health <= 0) return null;

        addGameLog(`🤖 ${this.name} 的回合开始`);

        // 模拟思考时间
        setTimeout(() => {
            this.executeTurn(gameState);
        }, 1000 + Math.random() * 2000);
    }

    /**
     * 执行AI回合
     * @param {Object} gameState 游戏状态
     */
    executeTurn(gameState) {
        const self = gameState.players.find(p => p.id === this.id);
        if (!self) return;

        // 1. 摸牌阶段
        addGameLog(`🤖 ${this.name} 摸牌`);
        gameInstance.drawCard(this.id, 2);
        
        // 触发武将技能（摸牌阶段）
        this.triggerDrawPhaseSkills(gameState);

        // 2. 出牌阶段
        this.playCardsPhase(gameState);

        // 3. 结束回合
        setTimeout(() => {
            addGameLog(`🤖 ${this.name} 结束回合`);
            gameInstance.endTurn();
        }, 1500);
    }

    /**
     * 触发摸牌阶段武将技能
     * @param {Object} gameState 游戏状态
     */
    triggerDrawPhaseSkills(gameState) {
        const self = gameState.players.find(p => p.id === this.id);
        if (!self) return;

        // 金子博 - 买通
        if (self.character?.name === '金子博' && !self.usedMaitong) {
            gameInstance.drawCard(this.id, 1);
            self.cannotUseSha = true;
            self.usedMaitong = true;
            addGameLog(`🤖 ${self.name} 发动【买通】，多摸1张牌`);
        }

        // 李若曦 - 晨曦
        if (self.character?.name === '李若曦' && self.health < (self.character.health || 3)) {
            gameInstance.drawCard(this.id, 1);
            addGameLog(`🤖 ${self.name} 发动【晨曦】，体力不满多摸1张牌`);
        }

        // 董轶鑫 - 聚金（少摸1张牌）
        if (self.character?.name === '董轶鑫') {
            if (self.handCards.length > 0) {
                self.handCards.pop();
                addGameLog(`🤖 ${self.name} 发动【聚金】，摸牌阶段少摸1张牌`);
            }
        }
    }

    /**
     * 出牌阶段AI决策
     * @param {Object} gameState 游戏状态
     */
    playCardsPhase(gameState) {
        const self = gameState.players.find(p => p.id === this.id);
        if (!self || self.handCards.length === 0) return;

        // 过滤可出的牌
        const playableCards = this.getPlayableCards(gameState);
        if (playableCards.length === 0) return;

        // AI策略优先级：
        // 1. 保命（濒死时用小红花/满分试卷）
        if (self.health <= 2) {
            this.playSurvivalCards(gameState, playableCards);
            return;
        }

        // 2. 攻击敌方
        this.playAttackCards(gameState, playableCards);

        // 3. 使用锦囊牌
        this.playJinangCards(gameState, playableCards);

        // 4. 装备牌
        this.playEquipmentCards(gameState, playableCards);
    }

    /**
     * 获取可出的牌
     * @param {Object} gameState 游戏状态
     * @returns {Array} 可出牌列表
     */
    getPlayableCards(gameState) {
        const self = gameState.players.find(p => p.id === this.id);
        if (!self) return [];

        return self.handCards.filter(card => {
            // 基础牌都可以出（除了被技能限制）
            if (card.type === 'basic') {
                if (card.name.includes('记名') && self.cannotUseSha) {
                    return false;
                }
                return true;
            }
            
            // 锦囊牌都可以出
            if (card.type === 'jinang') {
                return true;
            }
            
            // 装备牌都可以出
            if (card.type === 'equipment') {
                return true;
            }
            
            return false;
        });
    }

    /**
     * 保命出牌策略（濒死时）
     * @param {Object} gameState 游戏状态
     * @param {Array} playableCards 可出牌列表
     */
    playSurvivalCards(gameState, playableCards) {
        const self = gameState.players.find(p => p.id === this.id);
        if (!self) return;

        // 找小红花
        const taoCards = playableCards.filter(c => c.name === '小红花');
        if (taoCards.length > 0 && self.health < (self.character.health || 4)) {
            const card = taoCards[0];
            // 使用小红花自救
            gameInstance.useSelectedCardManual(self.id, card, self.id);
            addGameLog(`🤖 ${self.name} 使用小红花恢复体力`);
            return;
        }

        // 找满分试卷（濒死时）
        const jiuCards = playableCards.filter(c => c.name === '满分试卷');
        if (jiuCards.length > 0 && self.health === 1) {
            const card = jiuCards[0];
            gameInstance.useSelectedCardManual(self.id, card, self.id);
            addGameLog(`🤖 ${self.name} 使用满分试卷自救`);
            return;
        }
    }

    /**
     * 攻击出牌策略
     * @param {Object} gameState 游戏状态
     * @param {Array} playableCards 可出牌列表
     */
    playAttackCards(gameState, playableCards) {
        const self = gameState.players.find(p => p.id === this.id);
        if (!self) return;

        // 找记名类牌
        const shaCards = playableCards.filter(c => 
            c.name.includes('记名') && !self.cannotUseSha
        );

        if (shaCards.length === 0) return;

        // 选择攻击目标（优先血量少的）
        const targets = gameState.players.filter(p => 
            p.id !== this.id && 
            p.health > 0 && 
            gameInstance.calculateDistance(self, p) <= 1
        );

        if (targets.length === 0) return;

        // 排序：血量少的优先
        targets.sort((a, b) => a.health - b.health);
        const target = targets[0];

        // 使用记名
        const card = shaCards[0];
        gameInstance.useSelectedCardManual(self.id, card, target.id);
        addGameLog(`🤖 ${self.name} 对${target.name}使用${card.name}`);
    }

    /**
     * 锦囊牌出牌策略
     * @param {Object} gameState 游戏状态
     * @param {Array} playableCards 可出牌列表
     */
    playJinangCards(gameState, playableCards) {
        const self = gameState.players.find(p => p.id === this.id);
        if (!self) return;

        // 找锦囊牌
        const jinangCards = playableCards.filter(c => c.type === 'jinang');
        if (jinangCards.length === 0) return;

        const card = jinangCards[0];
        let targetId = null;

        // 根据锦囊类型选择目标
        switch (card.name) {
            case '班主任回班':
            case '反抗占课':
            case '全班分享小红花':
            case '意外奖励':
                // 无目标或全体目标的锦囊
                gameInstance.useSelectedCardManual(self.id, card, null);
                addGameLog(`🤖 ${self.name} 使用${card.name}`);
                break;
                
            case '没收小玩具':
            case '点燃小纸条':
            case '班干部指令':
            case '请老师发话':
                // 选择敌方目标
                const enemies = gameState.players.filter(p => 
                    p.id !== this.id && p.health > 0
                );
                if (enemies.length > 0) {
                    targetId = enemies[0].id;
                    gameInstance.useSelectedCardManual(self.id, card, targetId);
                    addGameLog(`🤖 ${self.name} 对${enemies[0].name}使用${card.name}`);
                }
                break;
                
            default:
                // 其他锦囊牌随机使用
                const allTargets = gameState.players.filter(p => p.health > 0);
                if (allTargets.length > 0) {
                    targetId = allTargets[Math.floor(Math.random() * allTargets.length)].id;
                    gameInstance.useSelectedCardManual(self.id, card, targetId);
                    addGameLog(`🤖 ${self.name} 对${gameState.players.find(p => p.id === targetId)?.name}使用${card.name}`);
                }
                break;
        }
    }

    /**
     * 装备牌出牌策略
     * @param {Object} gameState 游戏状态
     * @param {Array} playableCards 可出牌列表
     */
    playEquipmentCards(gameState, playableCards) {
        const self = gameState.players.find(p => p.id === this.id);
        if (!self) return;

        // 找装备牌
        const equipCards = playableCards.filter(c => c.type === 'equipment');
        if (equipCards.length === 0) return;

        // 优先装备没有的装备类型
        const card = equipCards[0];
        gameInstance.useSelectedCardManual(self.id, card, self.id);
        addGameLog(`🤖 ${self.name} 装备了${card.name}`);
    }

    /**
     * AI响应（被攻击时）
     * @param {Object} gameState 游戏状态
     * @param {Object} attackInfo 攻击信息
     * @returns {Boolean} 是否响应成功
     */
    respondToAttack(gameState, attackInfo) {
        const self = gameState.players.find(p => p.id === this.id);
        if (!self) return false;

        addGameLog(`🤖 ${self.name} 正在响应攻击`);

        // 检查是否有广播
        const shanCards = self.handCards.filter(c => c.name === '广播做好事记录');
        
        // 郝端端 - 美颜（任意牌当广播）
        if (self.character?.name === '郝端端' && shanCards.length === 0 && self.handCards.length > 0) {
            const randomCard = self.handCards[0];
            self.handCards = self.handCards.filter(c => c.uniqueId !== randomCard.uniqueId);
            addGameLog(`🤖 ${self.name} 发动【美颜】，将${randomCard.name}当广播使用`);
            return true;
        }

        // 有广播则出广播
        if (shanCards.length > 0) {
            // 50%概率出广播（增加随机性）
            if (Math.random() > 0.5) {
                const card = shanCards[0];
                self.handCards = self.handCards.filter(c => c.uniqueId !== card.uniqueId);
                gameInstance.gameState.playArea.push({
                    card: card,
                    from: self.id,
                    to: attackInfo.attackerId
                });
                addGameLog(`🤖 ${self.name} 打出广播做好事记录`);
                return true;
            }
        }

        // 不出牌，承受伤害
        return false;
    }
}

// 初始化AI玩家
function createAIPlayers(count, startId = 2) {
    const aiPlayers = [];
    
    for (let i = 0; i < count; i++) {
        // 随机选择武将
        const randomCharId = Math.floor(Math.random() * charactersList.length);
        const character = getCharacterById(randomCharId);
        
        const ai = new AIPlayer(
            startId + i,
            `AI-${character.name}`,
            character
        );
        
        aiPlayers.push(ai);
    }
    
    return aiPlayers;
}

// 导出到全局
window.AIPlayer = AIPlayer;
window.createAIPlayers = createAIPlayers;
