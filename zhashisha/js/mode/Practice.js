/**
 * 练习模式核心逻辑 - 修复选择武将后页面跳转问题
 */
const PracticeMode = {
    config: {
        aiCount: 2,
        heroSelectCount: 5,
        isStarted: false
    },

    init() {
        this.config.isStarted = false;
        
        // 修复：确保所有页面初始状态正确
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // 显示武将选择页
        const heroSelectPage = document.getElementById('heroSelectPage');
        if (heroSelectPage) {
            heroSelectPage.classList.add('active');
        } else {
            // 修复：页面不存在时创建基础结构
            this.createMissingPages();
            document.getElementById('heroSelectPage').classList.add('active');
        }
        
        const heroList = document.getElementById('heroList');
        heroList.innerHTML = '';
        
        const randomHeroes = randomUtil.getRandomHeroes(this.config.heroSelectCount);
        
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
            
            heroItem.addEventListener('click', () => {
                this.selectHero(hero.id);
            });
            
            heroList.appendChild(heroItem);
        });
        
        Game.addLog('练习模式 - 请选择你的武将开始游戏');
    },

    selectHero(heroId) {
        if (this.config.isStarted) return;
        
        const selectedHero = getHeroById(heroId);
        if (!selectedHero) {
            alert('选择的武将不存在！');
            return;
        }
        
        Game.addLog(`你选择了武将：${selectedHero.name}（${selectedHero.title}）`);
        
        // 修复核心：强制切换页面并确保DOM元素存在
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const gamePage = document.getElementById('gamePage');
        if (gamePage) {
            gamePage.classList.add('active');
        } else {
            this.createMissingPages();
            document.getElementById('gamePage').classList.add('active');
        }
        
        // 构建玩家配置
        const playerConfigs = [
            {
                id: 'self_player',
                name: '我',
                heroId: heroId,
                isSelf: true
            }
        ];
        
        // 添加AI玩家
        for (let i = 0; i < this.config.aiCount; i++) {
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
        
        // 修复：确保事件绑定只执行一次
        if (!document.querySelector('#drawCardBtn').dataset.bound) {
            this.bindGameEvents();
            document.querySelector('#drawCardBtn').dataset.bound = 'true';
        }
        
        // 开始游戏
        Game.start();
        
        this.config.isStarted = true;
        
        // 强制刷新UI
        setTimeout(() => {
            DOM.updatePlayerList();
            DOM.updateHandCards(Game.getSelfPlayer());
        }, 100);
    },

    // 新增：创建缺失的页面结构（修复页面跳转空白问题）
    createMissingPages() {
        // 检查并创建游戏页面
        if (!document.getElementById('gamePage')) {
            const gamePage = document.createElement('div');
            gamePage.id = 'gamePage';
            gamePage.className = 'page';
            gamePage.innerHTML = `
                <div class="game-header">
                    <h1>诈尸杀 - 游戏中</h1>
                    <div id="turnIndicator" class="turn-indicator">等待游戏开始...</div>
                </div>
                
                <div class="game-container">
                    <div class="player-panel">
                        <h2>玩家列表</h2>
                        <div id="playerList" class="player-list"></div>
                    </div>
                    
                    <div class="game-panel">
                        <div class="hand-cards">
                            <h3 id="handCardCount">手牌数量：0</h3>
                            <div id="handCardsList" class="cards-grid"></div>
                        </div>
                        
                        <div class="game-controls">
                            <select id="targetPlayerSelect" class="form-control">
                                <option value="">选择目标玩家</option>
                            </select>
                            <button id="drawCardBtn" class="btn">摸牌</button>
                            <button id="endTurnBtn" class="btn">结束回合</button>
                            <button id="backBtn" class="btn btn-secondary">返回</button>
                        </div>
                    </div>
                    
                    <div class="log-panel">
                        <h3>游戏日志</h3>
                        <div id="gameLog" class="log-content"></div>
                    </div>
                </div>
            `;
            document.querySelector('.container').appendChild(gamePage);
        }
        
        // 检查并创建武将选择页面
        if (!document.getElementById('heroSelectPage')) {
            const heroSelectPage = document.createElement('div');
            heroSelectPage.id = 'heroSelectPage';
            heroSelectPage.className = 'page';
            heroSelectPage.innerHTML = `
                <div class="hero-select-header">
                    <h1>选择你的武将</h1>
                    <button id="backBtn" class="btn btn-secondary">返回</button>
                </div>
                <div id="heroList" class="hero-grid"></div>
            `;
            document.querySelector('.container').appendChild(heroSelectPage);
        }
    },

    bindGameEvents() {
        // 摸牌按钮
        document.getElementById('drawCardBtn').addEventListener('click', () => {
            const selfPlayer = Game.getSelfPlayer();
            
            if (!selfPlayer || !selfPlayer.isTurn || selfPlayer.hasDrawn) {
                Game.addLog('无法摸牌：不是你的回合或本回合已摸牌');
                return;
            }
            
            const drawnCards = selfPlayer.drawCards(2);
            DOM.updateHandCards(selfPlayer);
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
            
            const targetSelect = document.getElementById('targetPlayerSelect');
            const targetPlayerId = targetSelect.value;
            let targetPlayer = null;
            
            if (targetPlayerId) {
                targetPlayer = Game.players.find(p => p.id === targetPlayerId);
            }
            
            const playSuccess = selfPlayer.playCard(card, targetPlayer);
            
            if (playSuccess) {
                DOM.updateHandCards(selfPlayer);
                DOM.updatePlayerList();
                targetSelect.value = '';
            }
        });
        
        // 目标玩家选择框事件
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

    reset() {
        this.config.isStarted = false;
        
        document.getElementById('gameLog').innerHTML = '';
        document.getElementById('handCardsList').innerHTML = '';
        document.getElementById('targetPlayerSelect').innerHTML = '<option value="">选择目标玩家</option>';
        
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('modePage').classList.add('active');
        
        Game.addLog('练习模式已重置，请重新选择模式开始游戏');
    },

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

window.PracticeMode = PracticeMode;
