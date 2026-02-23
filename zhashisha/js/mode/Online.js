/**
 * 联机模式核心逻辑
 * 基于Room类实现房间创建/加入、玩家匹配、联机对战等功能
 * 无后端依赖，通过localStorage实现本地联机模拟
 * 无动画/音效，纯逻辑实现
 */
const OnlineMode = {
    // 模式配置
    config: {
        roomId: '', // 当前房间ID
        isCreator: false, // 是否为房间创建者
        isJoined: false, // 是否已加入房间
        isGameStarted: false // 游戏是否已开始
    },

    /**
     * 初始化联机模式
     * @param {string} roomId - 房间ID
     * @param {boolean} isCreator - 是否为创建者
     */
    init(roomId, isCreator = false) {
        // 重置模式状态
        this.config = {
            roomId: roomId,
            isCreator: isCreator,
            isJoined: false,
            isGameStarted: false
        };
        
        // 隐藏其他页面
        document.getElementById('modePage').classList.remove('active');
        document.getElementById('heroSelectPage').classList.remove('active');
        document.getElementById('gamePage').classList.remove('active');
        
        // 创建玩家ID（基于时间戳+随机数）
        const playerId = `online_player_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const playerName = isCreator ? '房主' : `玩家${Math.floor(Math.random() * 1000)}`;
        
        // 加入房间
        const joinSuccess = Room.joinRoom(roomId, {
            id: playerId,
            name: playerName,
            heroId: null,
            isReady: false
        });
        
        if (!joinSuccess) {
            alert(`加入房间${roomId}失败！`);
            this.reset();
            return;
        }
        
        this.config.isJoined = true;
        Game.addLog(`成功${isCreator ? '创建并加入' : '加入'}房间：${roomId}`);
        Game.addLog(`你的玩家ID：${playerId}，昵称：${playerName}`);
        
        // 显示房间等待界面（动态创建）
        this.showRoomWaitingUI(playerId, playerName);
        
        // 轮询检查房间状态
        this.pollRoomStatus(playerId);
    },

    /**
     * 显示房间等待界面
     * @param {string} playerId - 当前玩家ID
     * @param {string} playerName - 当前玩家昵称
     */
    showRoomWaitingUI(playerId, playerName) {
        // 创建房间等待界面（如果不存在）
        let roomWaitingPage = document.getElementById('roomWaitingPage');
        if (!roomWaitingPage) {
            roomWaitingPage = document.createElement('div');
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
                </div>
                
                <div class="room-log">
                    <h3>房间日志：</h3>
                    <div id="roomLog" class="log-content"></div>
                </div>
            `;
            
            document.querySelector('.container').appendChild(roomWaitingPage);
            
            // 绑定离开房间事件
            document.getElementById('leaveRoomBtn').addEventListener('click', () => {
                this.leaveRoom(playerId);
            });
            
            // 绑定选择武将事件
            document.getElementById('selectHeroBtn').addEventListener('click', () => {
                this.showHeroSelectUI(playerId);
            });
            
            // 绑定开始游戏事件（仅房主）
            if (this.config.isCreator) {
                document.getElementById('startGameBtn').addEventListener('click', () => {
                    this.startOnlineGame();
                });
            }
        } else {
            roomWaitingPage.classList.add('active');
        }
    },

    /**
     * 轮询检查房间状态
     * @param {string} playerId - 当前玩家ID
     */
    pollRoomStatus(playerId) {
        if (!this.config.isJoined || this.config.isGameStarted) return;
        
        const pollInterval = setInterval(() => {
            // 获取房间信息
            const roomInfo = Room.getRoomInfo(this.config.roomId);
            if (!roomInfo) {
                Game.addLog('房间已不存在！');
                clearInterval(pollInterval);
                this.reset();
                return;
            }
            
            // 更新房间状态
            const roomStatus = document.getElementById('roomStatus');
            if (roomInfo.isStarted) {
                roomStatus.textContent = '游戏已开始';
                clearInterval(pollInterval);
                return;
            }
            
            // 更新玩家列表
            this.updateRoomPlayersUI(roomInfo.players, playerId);
            
            // 检查是否可以选择武将（所有玩家已加入，且未选择武将）
            const selectHeroBtn = document.getElementById('selectHeroBtn');
            const currentPlayer = roomInfo.players.find(p => p.id === playerId);
            
            if (roomInfo.players.length >= 2 && !currentPlayer.heroId) {
                selectHeroBtn.disabled = false;
            }
            
            // 检查是否可以开始游戏（房主+所有玩家已选择武将）
            const startGameBtn = document.getElementById('startGameBtn');
            const allReady = roomInfo.players.every(p => p.isReady && p.heroId);
            
            if (this.config.isCreator && allReady && roomInfo.players.length >= 2) {
                startGameBtn.disabled = false;
            } else if (this.config.isCreator) {
                startGameBtn.disabled = true;
            }
            
            // 更新房间日志
            this.addRoomLog(`当前房间人数：${roomInfo.players.length}/4`);
            
        }, 1000);
    },

    /**
     * 更新房间玩家列表UI
     * @param {Array} players - 房间玩家列表
     * @param {string} currentPlayerId - 当前玩家ID
     */
    updateRoomPlayersUI(players, currentPlayerId) {
        const playersList = document.getElementById('roomPlayersList');
        playersList.innerHTML = '';
        
        players.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'hero-item';
            playerItem.dataset.playerId = player.id;
            
            // 获取武将信息
            const hero = player.heroId ? getHeroById(player.heroId) : null;
            
            playerItem.innerHTML = `
                <h3>${player.name}${player.id === currentPlayerId ? '（你）' : ''}</h3>
                <p>状态：${player.isReady ? '已选武将' : '未选武将'}</p>
                ${hero ? `<p>所选武将：${hero.name}（${hero.title}）</p>` : '<p>所选武将：未选择</p>'}
            `;
            
            playersList.appendChild(playerItem);
        });
        
        // 记录日志
        this.addRoomLog(`玩家列表更新：共${players.length}人`);
    },

    /**
     * 显示武将选择界面（联机模式）
     * @param {string} playerId - 当前玩家ID
     */
    showHeroSelectUI(playerId) {
        // 隐藏房间等待页，显示武将选择页
        document.getElementById('roomWaitingPage').classList.remove('active');
        document.getElementById('heroSelectPage').classList.add('active');
        
        // 清空武将列表
        const heroList = document.getElementById('heroList');
        heroList.innerHTML = '';
        
        // 获取房间信息，排除已选武将
        const roomInfo = Room.getRoomInfo(this.config.roomId);
        const selectedHeroIds = roomInfo.players.map(p => p.heroId).filter(id => id);
        
        // 随机抽取5个武将
        const randomHeroes = randomUtil.getRandomHeroes(5, selectedHeroIds);
        
        // 渲染武将列表
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
            
            // 绑定选择事件
            heroItem.addEventListener('click', () => {
                // 选择武将
                const success = Room.selectHero(this.config.roomId, playerId, hero.id);
                
                if (success) {
                    Game.addLog(`你选择了武将：${hero.name}（${hero.title}）`);
                    this.addRoomLog(`玩家${playerId}选择了武将：${hero.name}`);
                    
                    // 返回房间等待页
                    document.getElementById('heroSelectPage').classList.remove('active');
                    document.getElementById('roomWaitingPage').classList.add('active');
                } else {
                    alert('选择武将失败！该武将已被选择');
                }
            });
            
            heroList.appendChild(heroItem);
        });
    },

    /**
     * 开始联机游戏
     */
    startOnlineGame() {
        // 检查房间状态
        const roomInfo = Room.getRoomInfo(this.config.roomId);
        if (!roomInfo || !this.config.isCreator) {
            alert('无法开始游戏：你不是房主或房间不存在');
            return;
        }
        
        // 开始游戏
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
                isSelf: player.id === roomInfo.players.find(p => p.id.includes('online_player')).id
            };
        });
        
        // 隐藏房间等待页，显示游戏页
        document.getElementById('roomWaitingPage').classList.remove('active');
        document.getElementById('gamePage').classList.add('active');
        
        // 初始化游戏
        Game.init('online', playerConfigs);
        
        // 绑定游戏操作事件（同练习模式）
        this.bindGameEvents();
        
        // 开始游戏
        Game.start();
        
        Game.addLog('联机游戏开始！');
        this.addRoomLog('房主已开始游戏');
    },

    /**
     * 绑定联机模式游戏操作事件
     */
    bindGameEvents() {
        // 复用练习模式的事件绑定逻辑
        PracticeMode.bindGameEvents();
        
        // 额外的联机模式事件
        // 刷新玩家列表（同步其他玩家状态）
        setInterval(() => {
            if (Game.state.isStarted && !Game.state.isOver) {
                DOM.updatePlayerList();
            }
        }, 2000);
    },

    /**
     * 离开房间
     * @param {string} playerId - 当前玩家ID
     */
    leaveRoom(playerId) {
        const leaveSuccess = Room.leaveRoom(this.config.roomId, playerId);
        
        if (leaveSuccess) {
            Game.addLog(`你已离开房间：${this.config.roomId}`);
            this.addRoomLog(`玩家${playerId}已离开房间`);
        } else {
            alert('离开房间失败！');
        }
        
        // 重置模式
        this.reset();
    },

    /**
     * 添加房间日志
     * @param {string} content - 日志内容
     */
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

    /**
     * 重置联机模式
     */
    reset() {
        // 移除房间等待页
        const roomWaitingPage = document.getElementById('roomWaitingPage');
        if (roomWaitingPage) {
            roomWaitingPage.remove();
        }
        
        // 重置配置
        this.config = {
            roomId: '',
            isCreator: false,
            isJoined: false,
            isGameStarted: false
        };
        
        // 返回模式选择页
        document.getElementById('gamePage').classList.remove('active');
        document.getElementById('heroSelectPage').classList.remove('active');
        document.getElementById('modePage').classList.add('active');
        
        Game.addLog('联机模式已重置，请重新选择模式开始游戏');
    },

    /**
     * 获取联机模式状态
     * @returns {Object} 模式状态
     */
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

// 全局暴露联机模式
window.OnlineMode = OnlineMode;
