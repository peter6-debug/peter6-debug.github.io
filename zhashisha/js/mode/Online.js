/**
 * 联机模式核心逻辑 - 彻底修复创建房间失败和加载状态问题
 */
const OnlineMode = {
    config: {
        roomId: '',
        isCreator: false,
        isJoined: false,
        isGameStarted: false,
        isInitializing: false
    },

    // 初始化联机模式
    init(roomId, isCreator = false) {
        // 立即隐藏所有加载状态
        this.hideAllLoading();
        
        // 防止重复初始化
        if (this.config.isInitializing) return;
        this.config.isInitializing = true;
        
        console.log(`初始化联机模式：房间ID=${roomId}，是否创建者=${isCreator}`);
        
        // 重置配置
        this.config = {
            roomId: roomId,
            isCreator: isCreator,
            isJoined: false,
            isGameStarted: false,
            isInitializing: true
        };
        
        // 隐藏所有页面
        const allPages = document.querySelectorAll('.page');
        allPages.forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
        });
        
        // 创建玩家ID
        const playerId = `online_player_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const playerName = isCreator ? '房主' : `玩家${Math.floor(Math.random() * 1000)}`;
        
        // 核心修复：创建房间逻辑
        let joinSuccess = false;
        
        try {
            if (isCreator) {
                // 创建者：先创建房间（确保房间存在）
                if (typeof Room !== 'undefined' && Room.createRoom) {
                    Room.createRoom(roomId);
                    console.log(`房间${roomId}创建成功`);
                }
                
                // 加入自己创建的房间
                const playerData = {
                    id: playerId,
                    name: playerName,
                    heroId: null,
                    isReady: false
                };
                
                joinSuccess = Room.joinRoom(roomId, playerData);
                console.log(`创建者加入房间结果：${joinSuccess}`);
            } else {
                // 加入者：直接加入
                joinSuccess = Room.joinRoom(roomId, {
                    id: playerId,
                    name: playerName,
                    heroId: null,
                    isReady: false
                });
                console.log(`加入者加入房间结果：${joinSuccess}`);
            }
        } catch (e) {
            console.error('加入房间出错：', e);
            joinSuccess = false;
        }
        
        // 处理加入结果
        if (!joinSuccess) {
            alert(`加入房间${roomId}失败！`);
            this.config.isInitializing = false;
            this.reset();
            return;
        }
        
        // 加入成功
        this.config.isJoined = true;
        this.config.isInitializing = false;
        
        Game.addLog(`成功${isCreator ? '创建并加入' : '加入'}房间：${roomId}`);
        Game.addLog(`你的玩家ID：${playerId}，昵称：${playerName}`);
        
        // 显示房间等待界面
        this.showRoomWaitingUI(playerId, playerName);
        
        // 轮询检查房间状态
        this.pollRoomStatus(playerId);
    },

    // 隐藏所有加载状态（修复左侧一直显示创建中的问题）
    hideAllLoading() {
        // 隐藏DOM加载层
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        // 清除所有加载提示
        if (typeof DOM !== 'undefined' && DOM.hideLoading) {
            DOM.hideLoading();
        }
        
        // 移除所有加载相关的文本
        const loadingElements = document.querySelectorAll('.loading, .creating-room');
        loadingElements.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        
        console.log('所有加载状态已隐藏');
    },

    // 显示房间等待界面
    showRoomWaitingUI(playerId, playerName) {
        // 移除旧的房间页面
        const oldRoomPage = document.getElementById('roomWaitingPage');
        if (oldRoomPage) oldRoomPage.remove();
        
        // 创建新的房间等待页面
        const roomWaitingPage = document.createElement('div');
        roomWaitingPage.id = 'roomWaitingPage';
        roomWaitingPage.className = 'page';
        roomWaitingPage.style.display = 'block';
        roomWaitingPage.style.width = '100%';
        
        roomWaitingPage.innerHTML = `
            <h2>房间 ${this.config.roomId}</h2>
            <div class="room-info">
                <p>房间状态：<span id="roomStatus">等待玩家加入</span></p>
                <p>你的昵称：<span id="currentPlayerName">${playerName}</span></p>
                <p>你的ID：<span id="currentPlayerId">${playerId}</span></p>
            </div>
            
            <div class="room-players">
                <h3>房间玩家列表：</h3>
                <div id="roomPlayersList" class="hero-grid"></div>
            </div>
            
            <div class="room-actions">
                <button id="selectHeroBtn" disabled>选择武将</button>
                <button id="startGameBtn" ${!this.config.isCreator ? 'disabled' : ''}>开始游戏</button>
                <button id="leaveRoomBtn">离开房间</button>
                <button id="onlineBackBtn" class="btn btn-secondary">返回</button>
            </div>
            
            <div class="room-log">
                <h3>房间日志：</h3>
                <div id="roomLog" class="log-content"></div>
            </div>
        `;
        
        // 添加到容器
        const container = document.querySelector('.container') || document.body;
        container.appendChild(roomWaitingPage);
        
        // 绑定事件
        document.getElementById('leaveRoomBtn').addEventListener('click', () => {
            this.leaveRoom(playerId);
        });
        
        document.getElementById('selectHeroBtn').addEventListener('click', () => {
            this.showHeroSelectUI(playerId);
        });
        
        document.getElementById('onlineBackBtn').addEventListener('click', () => {
            this.leaveRoom(playerId);
        });
        
        if (this.config.isCreator) {
            document.getElementById('startGameBtn').addEventListener('click', () => {
                this.startOnlineGame();
            });
        }
        
        // 添加初始日志
        this.addRoomLog(`进入房间成功，当前玩家：${playerName}`);
    },

    // 轮询检查房间状态
    pollRoomStatus(playerId) {
        if (!this.config.isJoined || this.config.isGameStarted) return;
        
        let pollCount = 0;
        const pollInterval = setInterval(() => {
            // 最多轮询60秒
            if (pollCount > 60) {
                clearInterval(pollInterval);
                return;
            }
            pollCount++;
            
            const roomInfo = Room.getRoomInfo(this.config.roomId);
            if (!roomInfo) {
                Game.addLog('房间已不存在！');
                clearInterval(pollInterval);
                this.reset();
                return;
            }
            
            // 更新状态
            document.getElementById('roomStatus').textContent = roomInfo.isStarted ? '游戏已开始' : '等待玩家加入';
            this.updateRoomPlayersUI(roomInfo.players, playerId);
            
            // 更新按钮状态
            const selectHeroBtn = document.getElementById('selectHeroBtn');
            const currentPlayer = roomInfo.players.find(p => p.id === playerId);
            
            if (roomInfo.players.length >= 1 && !currentPlayer.heroId) {
                selectHeroBtn.disabled = false;
            }
            
            const startGameBtn = document.getElementById('startGameBtn');
            const allReady = roomInfo.players.every(p => p.isReady && p.heroId);
            
            if (this.config.isCreator && allReady && roomInfo.players.length >= 1) {
                startGameBtn.disabled = false;
            } else if (this.config.isCreator) {
                startGameBtn.disabled = true;
            }
            
        }, 1000);
    },

    // 更新玩家列表
    updateRoomPlayersUI(players, currentPlayerId) {
        const playersList = document.getElementById('roomPlayersList');
        if (!playersList) return;
        
        playersList.innerHTML = '';
        
        players.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'hero-item';
            playerItem.dataset.playerId = player.id;
            
            const hero = player.heroId ? getHeroById(player.heroId) : null;
            
            playerItem.innerHTML = `
                <h3>${player.name}${player.id === currentPlayerId ? '（你）' : ''}</h3>
                <p>状态：${player.isReady ? '已选武将' : '未选武将'}</p>
                ${hero ? `<p>所选武将：${hero.name}（${hero.title}）</p>` : '<p>所选武将：未选择</p>'}
            `;
            
            playersList.appendChild(playerItem);
        });
        
        this.addRoomLog(`当前房间人数：${players.length}/4`);
    },

    // 显示武将选择
    showHeroSelectUI(playerId) {
        let heroSelectPage = document.getElementById('heroSelectPage');
        if (!heroSelectPage) {
            heroSelectPage = document.createElement('div');
            heroSelectPage.id = 'heroSelectPage';
            heroSelectPage.className = 'page';
            heroSelectPage.innerHTML = `
                <div class="hero-select-header">
                    <h1>选择你的武将</h1>
                    <button id="onlineHeroBackBtn" class="btn btn-secondary">返回</button>
                </div>
                <div id="heroList" class="hero-grid"></div>
            `;
            document.querySelector('.container').appendChild(heroSelectPage);
        }
        
        // 切换页面
        const allPages = document.querySelectorAll('.page');
        allPages.forEach(page => {
            page.style.display = 'none';
        });
        heroSelectPage.style.display = 'block';
        
        // 加载武将列表
        const heroList = document.getElementById('heroList');
        heroList.innerHTML = '';
        
        const roomInfo = Room.getRoomInfo(this.config.roomId);
        const selectedHeroIds = roomInfo.players.map(p => p.heroId).filter(id => id);
        const randomHeroes = randomUtil.getRandomHeroes(5, selectedHeroIds);
        
        randomHeroes.forEach(hero => {
            const heroItem = document.createElement('div');
            heroItem.className = 'hero-item';
            heroItem.dataset.heroId = hero.id;
            heroItem.style.cursor = 'pointer';
            
            heroItem.innerHTML = `
                <h3>${hero.name}</h3>
                <p class="title">${hero.title}</p>
                <p class="hp">体力：${hero.hp}</p>
                ${hero.skills.map(skill => `<p class="skill">【${skill.name}】${skill.desc}</p>`).join('')}
            `;
            
            heroItem.addEventListener('click', () => {
                const success = Room.selectHero(this.config.roomId, playerId, hero.id);
                
                if (success) {
                    Game.addLog(`你选择了武将：${hero.name}（${hero.title}）`);
                    this.addRoomLog(`玩家${playerId}选择了武将：${hero.name}`);
                    
                    // 返回房间等待页
                    allPages.forEach(page => {
                        page.style.display = 'none';
                    });
                    document.getElementById('roomWaitingPage').style.display = 'block';
                } else {
                    alert('选择武将失败！该武将已被选择');
                }
            });
            
            heroList.appendChild(heroItem);
        });
        
        // 绑定返回按钮
        document.getElementById('onlineHeroBackBtn').addEventListener('click', () => {
            allPages.forEach(page => {
                page.style.display = 'none';
            });
            document.getElementById('roomWaitingPage').style.display = 'block';
        });
    },

    // 开始联机游戏
    startOnlineGame() {
        const roomInfo = Room.getRoomInfo(this.config.roomId);
        if (!roomInfo || !this.config.isCreator) {
            alert('无法开始游戏：你不是房主或房间不存在');
            return;
        }
        
        const startSuccess = Room.startGame(this.config.roomId);
        if (!startSuccess) {
            alert('无法开始游戏：还有玩家未选择武将');
            return;
        }
        
        this.config.isGameStarted = true;
        
        // 构建玩家配置
        const playerConfigs = roomInfo.players.map(player => {
            const hero = getHeroById(player.heroId);
            return {
                id: player.id,
                name: player.name,
                heroId: player.heroId,
                isSelf: player.id.includes('online_player')
            };
        });
        
        // 切换到游戏页面
        const allPages = document.querySelectorAll('.page');
        allPages.forEach(page => {
            page.style.display = 'none';
        });
        
        // 确保游戏页面存在
        PracticeMode.ensureGamePageExists();
        const gamePage = document.getElementById('gamePage');
        gamePage.style.display = 'block';
        
        // 初始化游戏
        Game.init('online', playerConfigs);
        PracticeMode.bindGameEvents();
        Game.start();
        
        Game.addLog('联机游戏开始！');
        this.addRoomLog('房主已开始游戏');
    },

    // 绑定游戏事件
    bindGameEvents: PracticeMode.bindGameEvents,

    // 离开房间
    leaveRoom(playerId) {
        try {
            Room.leaveRoom(this.config.roomId, playerId);
        } catch (e) {
            console.error('离开房间出错：', e);
        }
        
        Game.addLog(`你已离开房间：${this.config.roomId}`);
        this.reset();
    },

    // 添加房间日志
    addRoomLog(content) {
        const roomLog = document.getElementById('roomLog');
        if (roomLog) {
            const time = new Date().toLocaleTimeString();
            const logItem = document.createElement('p');
            logItem.textContent = `[${time}] ${content}`;
            roomLog.appendChild(logItem);
            roomLog.scrollTop = roomLog.scrollHeight;
        }
    },

    // 重置联机模式
    reset() {
        // 隐藏加载状态
        this.hideAllLoading();
        
        // 移除房间页面
        const roomWaitingPage = document.getElementById('roomWaitingPage');
        if (roomWaitingPage) roomWaitingPage.remove();
        
        // 重置配置
        this.config = {
            roomId: '',
            isCreator: false,
            isJoined: false,
            isGameStarted: false,
            isInitializing: false
        };
        
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
        
        Game.addLog('联机模式已重置，请重新选择模式开始游戏');
    },

    getStatus() {
        return {
            roomId: this.config.roomId,
            isCreator: this.config.isCreator,
            isJoined: this.config.isJoined,
            isGameStarted: this.config.isGameStarted,
            roomInfo: Room.getRoomInfo(this.config.roomId) || null,
            gameState: Game.state
        };
    }
};

window.OnlineMode = OnlineMode;
