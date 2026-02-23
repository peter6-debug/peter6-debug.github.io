/**
 * 练习模式核心逻辑
 * 单人对战AI，包含武将选择、游戏初始化、回合流程、AI对战等完整功能
 * 无动画/音效，纯逻辑实现
 */
const PracticeMode = {
    // 模式配置
    config: {
        aiCount: 2, // 默认AI数量
        heroSelectCount: 5, // 可选武将数量
        isStarted: false // 模式是否已启动
    },

    /**
     * 初始化练习模式
     * 进入武将选择界面，生成随机武将列表
     */
    init() {
        // 重置模式状态
        this.config.isStarted = false;
        
        // 隐藏其他页面，显示武将选择页
        document.getElementById('modePage').classList.remove('active');
        document.getElementById('heroSelectPage').classList.add('active');
        document.getElementById('gamePage').classList.remove('active');
        
        // 清空之前的武将列表
        const heroList = document.getElementById('heroList');
        heroList.innerHTML = '';
        
        // 随机抽取5个武将供选择（排除已选）
        const randomHeroes = randomUtil.getRandomHeroes(this.config.heroSelectCount);
        
        // 渲染武将选择列表
        randomHeroes.forEach(hero => {
            const heroItem = document.createElement('div');
            heroItem.className = 'hero-item';
            heroItem.dataset.heroId = hero.id;
            
            heroItem.innerHTML = `
                <h3>${hero.name}</h3>
                <p class="title">${hero.title}</p>
                <p class="hp">体力：${hero.hp}</p>
                ${hero.skills.map(skill => `<p class="skill">【${skill.name}】${skill.desc}</p>`).join('')}
            `;
            
            // 绑定选择武将事件
            heroItem.addEventListener('click', () => {
                this.selectHero(hero.id);
            });
            
            heroList.appendChild(heroItem);
        });
        
        Game.addLog('练习模式 - 请选择你的武将开始游戏');
    },

    /**
     * 选择武将并开始游戏
     * @param {string} heroId - 选中的武将ID
     */
    selectHero(heroId) {
        if (this.config.isStarted) return;
        
        // 获取选中的武将
        const selectedHero = getHeroById(heroId);
        if (!selectedHero) {
            alert('选择的武将不存在！');
            return;
        }
        
        Game.addLog(`你选择了武将：${selectedHero.name}（${selectedHero.title}）`);
        
        // 隐藏武将选择页，显示游戏页面
        document.getElementById('heroSelectPage').classList.remove('active');
        document.getElementById('gamePage').classList.add('active');
        
        // 构建玩家配置
        const playerConfigs = [
            // 本地玩家（自己）
            {
                id: 'self_player',
                name: '我',
                heroId: heroId,
                isSelf: true
            }
        ];
        
        // 添加AI玩家
        for (let i = 0; i < this.config.aiCount; i++) {
            // 随机选择AI武将（排除本地玩家已选）
            const aiHeroes = randomUtil.getRandomHeroes(1, [heroId]);
            const aiHero = aiHeroes[0] || HEROES[0];
            
            playerConfigs.push({
                id: `ai_player_${i + 1}`,
                name: `AI-${aiHero.name}`,
                heroId: aiHero.id,
                isSelf: false
            });
        }
        
        // 初始化游戏
        Game.init('practice', playerConfigs);
        
        // 绑定游戏操作事件
        this.bindGameEvents();
        
        // 开始游戏
        Game.start();
        
        this.config.isStarted = true;
    },

    /**
     * 绑定游戏操作事件（摸牌、结束回合、出牌等）
     */
    bindGameEvents() {
        // 摸牌按钮
        document.getElementById('drawCardBtn').addEventListener('click', () => {
            const selfPlayer = Game.getSelfPlayer();
            
            if (!selfPlayer || !selfPlayer.isTurn || selfPlayer.hasDrawn) {
                Game.addLog('无法摸牌：不是你的回合或本回合已摸牌');
                return;
            }
            
            // 摸2张牌（标准摸牌阶段）
            const drawnCards = selfPlayer.drawCards(2);
            
            // 更新手牌UI
            DOM.updateHandCards(selfPlayer);
            
            // 记录摸牌日志
            Game.addLog(`你摸了${drawnCards.length}张牌：${drawnCards.map(c => c.name).join('、')}`);
        });
        
        // 结束回合按钮
        document.getElementById('endTurnBtn').addEventListener('click', () => {
            const selfPlayer = Game.getSelfPlayer();
            
            if (!selfPlayer || !selfPlayer.isTurn) {
                Game.addLog('无法结束回合：不是你的回合');
                return;
            }
            
            selfPlayer.endTurn();
            
            // 更新UI
            DOM.updateHandCards(selfPlayer);
            DOM.updatePlayerList();
        });
        
        // 手牌点击事件（出牌）
        document.getElementById('handCardsList').addEventListener('click', (e) => {
            const cardItem = e.target.closest('.card-item');
            if (!cardItem) return;
            
            const selfPlayer = Game.getSelfPlayer();
            if (!selfPlayer || !selfPlayer.isTurn) {
                Game.addLog('无法出牌：不是你的回合');
                return;
            }
            
            const cardId = cardItem.dataset.cardId;
            const card = getCardById(cardId);
            if (!card) return;
            
            // 获取选中的目标玩家
            const targetSelect = document.getElementById('targetPlayerSelect');
            const targetPlayerId = targetSelect.value;
            let targetPlayer = null;
            
            if (targetPlayerId) {
                targetPlayer = Game.players.find(p => p.id === targetPlayerId);
            }
            
            // 出牌逻辑
            const playSuccess = selfPlayer.playCard(card, targetPlayer);
            
            if (playSuccess) {
                // 更新UI
                DOM.updateHandCards(selfPlayer);
                DOM.updatePlayerList();
                
                // 清空目标选择
                targetSelect.value = '';
            }
        });
        
        // 目标玩家选择框变化事件
        document.getElementById('targetPlayerSelect').addEventListener('change', (e) => {
            const targetId = e.target.value;
            const target = Game.players.find(p => p.id === targetId);
            
            if (target) {
                Game.addLog(`已选择目标：${target.name}（${target.hero.name}）`);
            } else {
                Game.addLog('已取消目标选择');
            }
        });
    },

    /**
     * 重置练习模式
     */
    reset() {
        this.config.isStarted = false;
        
        // 重置UI
        document.getElementById('gameLog').innerHTML = '';
        document.getElementById('handCardsList').innerHTML = '';
        document.getElementById('targetPlayerSelect').innerHTML = '<option value="">选择目标玩家</option>';
        
        // 返回模式选择页
        document.getElementById('gamePage').classList.remove('active');
        document.getElementById('modePage').classList.add('active');
        
        Game.addLog('练习模式已重置，请重新选择模式开始游戏');
    },

    /**
     * 获取模式状态
     * @returns {Object} 模式状态
     */
    getStatus() {
        return {
            isStarted: this.config.isStarted,
            aiCount: this.config.aiCount,
            currentPlayer: Game.getCurrentPlayer()?.getSummary() || null,
            selfPlayer: Game.getSelfPlayer()?.getSummary() || null,
            gameState: Game.state
        };
    }
};

// 全局暴露练习模式
window.PracticeMode = PracticeMode;
