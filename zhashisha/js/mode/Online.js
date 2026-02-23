/**
 * 联机模式核心逻辑 - 修复重复提示和空白页面问题
 */
const OnlineMode = {
    config: {
        roomId: '',
        isCreator: false,
        isJoined: false,
        isGameStarted: false,
        isInitializing: false // 新增：防止重复初始化
    },

    init(roomId, isCreator = false) {
        // 修复：防止重复初始化
        if (this.config.isInitializing) return;
        this.config.isInitializing = true;
        
        // 重置配置
        this.config = {
            roomId: roomId,
            isCreator: isCreator,
            isJoined: false,
            isGameStarted: false,
            isInitializing: true
        };
        
        // 确保所有页面初始状态正确
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // 创建玩家ID
        const playerId = `online_player_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const playerName = isCreator ? '房主' : `玩家${Math.floor(Math.random() * 1000)}`;
        
        // 修复：先检查房间是否存在，创建者模式先创建房间
        let joinSuccess = false;
        if (isCreator) {
            // 创建者模式：先创建房间
            Room.createRoom(roomId);
            joinSuccess = Room.joinRoom(roomId, {
                id: playerId,
                name: playerName,
                heroId: null,
                isReady: false
            });
        } else {
            // 加入者模式：直接加入
            joinSuccess = Room.joinRoom(roomId, {
                id: playerId,
                name: playerName,
                heroId: null,
                isReady: false
            });
        }
        
        if (!joinSuccess) {
            alert(`加入房间${roomId}失败！`);
            this.config.isInitializing = false;
            this.reset();
            return;
        }
        
        this.config.isJoined = true;
        this.config.isInitializing = false; // 重置初始化状态
        
        Game.addLog(`成功${isCreator ? '创建并加入' : '加入'}房间：${roomId}`);
        Game.addLog(`你的玩家ID：${playerId}，昵称：${playerName}`);
        
        // 修复：确保房间等待页面正确创建
        this.showRoomWaitingUI(playerId, playerName);
        
        // 轮询检查房间状态
        this.pollRoomStatus(playerId);
    },

    showRoomWaitingUI(playerId, playerName) {
        // 先移除旧的房间等待页
        const oldRoomPage = document.getElementById('roomWaitingPage');
        if (oldRoomPage) oldRoomPage.remove();
        
        // 创建新的房间等待页面
        const roomWaitingPage = document.createElement('div');
        roomWaitingPage.id = 'roomWaitingPage';
        roomWaitingPage.className = 'page active';
        
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
                <button id="backBtn" class="btn btn-secondary">返回</button>
            </div>
            
            <div class="room-log">
                <h3>房间日志：</h3>
                <div id="roomLog" class="log-content"></div>
            </div>
        `;
        
        document.querySelector('.container').appendChild(roomWaitingPage);
        
        // 绑定事件
        document.getElementById('leaveRoomBtn').addEventListener('click', () => {
            this.leaveRoom(playerId);
        });
        
        document.getElementById('selectHeroBtn').addEventListener('click', () => {
            this.showHeroSelectUI(playerId);
        });
        
        if (this.config.isCreator) {
            document.getElementById('startGameBtn').addEventListener('click', () => {
                this.startOnlineGame();
            });
        }
        
        document.getElementById('backBtn').addEventListener('click', () => {
            this.leaveRoom(playerId);
        });
        
        // 添加初始日志
        this.addRoomLog(`进入房间成功，当前玩家：${playerName}`);
    },

    pollRoomStatus(playerId) {
        if (!this.config.isJoined || this.config.isGameStarted) return;
        
        const pollInterval = setInterval(() => {
            const roomInfo = Room.getRoomInfo(this.config.roomId);
            if (!roomInfo) {
                Game.addLog('房间已不存在！');
                clearInterval(pollInterval);
                this.reset();
                return;
            }
            
            // 更新状态和玩家列表
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

    updateRoomPlayersUI(players, currentPlayerId) {
        const playersList = document.getElementById('roomPlayersList');
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

    showHeroSelectUI(playerId) {
        // 确保武将选择页面存在
        let heroSelectPage = document.getElementById('heroSelectPage');
        if (!heroSelectPage) {
            heroSelectPage = document.createElement('div');
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
        
        // 切换页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        heroSelectPage.classList.add('active');
        
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
                    document.querySelectorAll('.page').forEach(page => {
                        page.classList.remove('active');
                    });
                    document.getElementById('roomWaitingPage').classList.add('active');
                } else {
                    alert('选择武将失败！该武将已被选择');
                }
            });
            
            heroList.appendChild(heroItem);
        });
        
        // 绑定返回按钮
        document.getElementById('backBtn').addEventListener('click', () => {
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById('roomWaitingPage').classList.add('active');
        });
    },

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
                isSelf: player.id.includes('online_player') // 修复：正确识别本地玩家
            };
        });
        
        // 切换到游戏页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // 确保游戏页面存在
        let gamePage = document.getElementById('gamePage');
        if (!gamePage) {
            PracticeMode.createMissingPages(); // 复用练习模式的页面创建逻辑
            gamePage = document.getElementById('gamePage');
        }
        gamePage.classList.add('active');
        
        // 初始化游戏
        Game.init('online', playerConfigs);
        this.bindGameEvents();
        Game.start();
        
        Game.addLog('联机游戏开始！');
        this.addRoomLog('房主已开始游戏');
    },

    // 复用练习模式的事件绑定
    bindGameEvents: PracticeMode.bindGameEvents,

    leaveRoom(playerId) {
        Room.leaveRoom(this.config.roomId, playerId);
        Game.addLog(`你已离开房间：${this.config.roomId}`);
        this.reset();
    },

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

    reset() {
        const roomWaitingPage = document.getElementById('roomWaitingPage');
        if (roomWaitingPage) roomWaitingPage.remove();
        
        this.config = {
            roomId: '',
            isCreator: false,
            isJoined: false,
            isGameStarted: false,
            isInitializing: false
        };
        
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('modePage').classList.add('active');
        
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
