/**
 * 练习模式核心逻辑 - 彻底修复页面跳转和返回按钮问题
 */
const PracticeMode = {
    config: {
        aiCount: 2,
        heroSelectCount: 5,
        isStarted: false
    },

    // 初始化练习模式
    init() {
        this.config.isStarted = false;
        
        // 强制重置所有页面状态
        const allPages = document.querySelectorAll('.page');
        allPages.forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
        });
        
        // 确保基础DOM结构存在
        this.ensureBaseDomExists();
        
        // 显示武将选择页
        const heroSelectPage = document.getElementById('heroSelectPage');
        heroSelectPage.style.display = 'block';
        heroSelectPage.classList.add('active');
        
        // 清空并重新渲染武将列表
        const heroList = document.getElementById('heroList');
        heroList.innerHTML = '';
        
        // 获取随机武将
        const randomHeroes = typeof randomUtil !== 'undefined' ? 
            randomUtil.getRandomHeroes(this.config.heroSelectCount) : 
            HEROES.slice(0, 5);
        
        // 渲染武将
        randomHeroes.forEach(hero => {
            const heroItem = document.createElement('div');
            heroItem.className = 'hero-item';
            heroItem.dataset.heroId = hero.id;
            heroItem.style.cursor = 'pointer';
            heroItem.style.padding = '10px';
            heroItem.style.border = '1px solid #ccc';
            heroItem.style.margin = '10px';
            
            heroItem.innerHTML = `
                <h3>${hero.name}</h3>
                <p class="title">${hero.title}</p>
                <p class="hp">体力：${hero.hp}</p>
                ${hero.skills.map(skill => `<p class="skill">【${skill.name}】${skill.desc}</p>`).join('')}
            `;
            
            // 绑定点击事件（使用addEventListener确保生效）
            heroItem.addEventListener('click', () => {
                console.log('选择武将：', hero.id);
                this.selectHero(hero.id);
            });
            
            heroList.appendChild(heroItem);
        });
        
        // 重新绑定返回按钮事件
        this.bindBackButton();
        
        Game.addLog('练习模式 - 请选择你的武将开始游戏');
    },

    // 选择武将并跳转游戏页面
    selectHero(heroId) {
        if (this.config.isStarted) return;
        
        const selectedHero = getHeroById(heroId);
        if (!selectedHero) {
            alert('选择的武将不存在！');
            return;
        }
        
        console.log('选中武将，开始跳转游戏页面');
        
        // 1. 隐藏所有页面
        const allPages = document.querySelectorAll('.page');
        allPages.forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
        });
        
        // 2. 确保游戏页面存在
        this.ensureGamePageExists();
        
        // 3. 显示游戏页面
        const gamePage = document.getElementById('gamePage');
        gamePage.style.display = 'block';
        gamePage.classList.add('active');
        
        // 4. 构建玩家配置
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
            const aiHeroes = typeof randomUtil !== 'undefined' ? 
                randomUtil.getRandomHeroes(1, [heroId]) : 
                HEROES.filter(h => h.id !== heroId).slice(0, 1);
            const aiHero = aiHeroes[0] || HEROES[0];
            
            playerConfigs.push({
                id: `ai_player_${i + 1}`,
                name: `AI-${aiHero.name}`,
                heroId: aiHero.id,
                isSelf: false
            });
        }
        
        // 5. 初始化游戏
        if (typeof Game !== 'undefined') {
            Game.init('practice', playerConfigs);
            
            // 确保事件只绑定一次
            if (!document.querySelector('#drawCardBtn').dataset.bound) {
                this.bindGameEvents();
                document.querySelector('#drawCardBtn').dataset.bound = 'true';
            }
            
            // 6. 开始游戏
            Game.start();
            this.config.isStarted = true;
            
            // 7. 强制刷新UI
            setTimeout(() => {
                if (typeof DOM !== 'undefined') {
                    DOM.updatePlayerList();
                    DOM.updateHandCards(Game.getSelfPlayer());
                }
            }, 100);
        }
        
        Game.addLog(`你选择了武将：${selectedHero.name}（${selectedHero.title}）`);
    },

    // 确保基础DOM结构存在
    ensureBaseDomExists() {
        // 检查容器
        let container = document.querySelector('.container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'container';
            document.body.appendChild(container);
        }
        
        // 检查武将选择页
        let heroSelectPage = document.getElementById('heroSelectPage');
        if (!heroSelectPage) {
            heroSelectPage = document.createElement('div');
            heroSelectPage.id = 'heroSelectPage';
            heroSelectPage.className = 'page';
            heroSelectPage.innerHTML = `
                <div class="hero-select-header">
                    <h1>选择你的武将</h1>
                    <button id="practiceBackBtn" class="btn btn-secondary">返回</button>
                </div>
                <div id="heroList" class="hero-grid"></div>
            `;
            container.appendChild(heroSelectPage);
        }
        
        // 绑定返回按钮
        this.bindBackButton();
    },

    // 确保游戏页面存在
    ensureGamePageExists() {
        let gamePage = document.getElementById('gamePage');
        if (!gamePage) {
            gamePage = document.createElement('div');
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
                            <button id="gameBackBtn" class="btn btn-secondary">返回</button>
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
        
        // 绑定游戏页面返回按钮
        document.getElementById('gameBackBtn').addEventListener('click', () => {
            this.reset();
        });
    },

    // 绑定返回按钮事件（修复返回键不好使问题）
    bindBackButton() {
        // 移除旧的事件监听
        const oldBackBtn = document.getElementById('practiceBackBtn');
        if (oldBackBtn) {
            oldBackBtn.removeEventListener('click', this.reset.bind(this));
            oldBackBtn.addEventListener('click', () => {
                console.log('返回按钮点击');
                this.reset();
            });
        }
    },

    // 绑定游戏操作事件
    bindGameEvents() {
        // 摸牌按钮
        document.getElementById('drawCardBtn').addEventListener('click', () => {
            const selfPlayer = Game.getSelfPlayer();
            
            if (!selfPlayer || !selfPlayer.isTurn || selfPlayer.hasDrawn) {
                Game.addLog('无法摸牌：不是你的回合或本回合已摸牌');
                return;
            }
            
            const drawnCards = selfPlayer.drawCards(2);
            if (typeof DOM !== 'undefined') {
                DOM.updateHandCards(selfPlayer);
            }
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
            if (typeof DOM !== 'undefined') {
                DOM.updateHandCards(selfPlayer);
                DOM.updatePlayerList();
            }
        });
        
        // 手牌点击事件
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
            
            if (playSuccess && typeof DOM !== 'undefined') {
                DOM.updateHandCards(selfPlayer);
                DOM.updatePlayerList();
                targetSelect.value = '';
            }
        });
        
        // 目标选择事件
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

    // 重置练习模式（修复返回功能）
    reset() {
        console.log('执行重置操作');
        this.config.isStarted = false;
        
        // 清空游戏数据
        const gameLog = document.getElementById('gameLog');
        const handCardsList = document.getElementById('handCardsList');
        const targetPlayerSelect = document.getElementById('targetPlayerSelect');
        
        if (gameLog) gameLog.innerHTML = '';
        if (handCardsList) handCardsList.innerHTML = '';
        if (targetPlayerSelect) targetPlayerSelect.innerHTML = '<option value="">选择目标玩家</option>';
        
        // 显示模式选择页
        const allPages = document.querySelectorAll('.page');
        allPages.forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
        });
        
        const modePage = document.getElementById('modePage');
        if (modePage) {
            modePage.style.display = 'block';
            modePage.classList.add('active');
        }
        
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

// 全局暴露
window.PracticeMode = PracticeMode;
