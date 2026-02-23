/**
 * WebRTC联机核心模块 - 诈尸杀小学生版
 * 基于PeerJS实现点对点联机，无需服务器，支持房间创建/加入、玩家同步、游戏状态同步
 */

class OnlineGame {
    constructor(gameInstance) {
        this.gameInstance = gameInstance; // 游戏核心实例
        this.peer = null; // PeerJS实例
        this.connections = {}; // 存储所有连接 { peerId: conn }
        this.roomId = null; // 当前房间ID
        this.isHost = false; // 是否是房主
        this.players = {}; // 联机玩家列表 { playerId: { id, name, character, health, isHost, isLocal } }
        this.localPlayerId = null; // 本地玩家ID
        this.localPlayerName = null; // 本地玩家名称
        this.localCharacter = null; // 本地玩家选择的武将
        this.gameStarted = false; // 游戏是否开始
    }

    /**
     * 初始化联机模块
     * @param {string} playerName 本地玩家昵称
     */
    init(playerName) {
        this.localPlayerName = playerName || `玩家${Math.floor(Math.random() * 1000)}`;
        
        // 创建PeerJS实例（随机ID）
        this.peer = new Peer(Math.random().toString(36).substring(2, 10));
        
        // PeerJS事件监听
        this.peer.on('open', (id) => {
            this.localPlayerId = id;
            addGameLog(`🌐 你的联机ID: ${id}`);
        });

        this.peer.on('connection', (conn) => {
            this.handleIncomingConnection(conn);
        });

        this.peer.on('error', (err) => {
            addGameLog(`❌ 联机错误: ${err.message}`);
            console.error('PeerJS Error:', err);
        });

        this.peer.on('close', () => {
            addGameLog('🌐 联机连接已关闭');
        });
    }

    /**
     * 处理入站连接（房主接收其他玩家连接）
     * @param {Peer.DataConnection} conn 连接实例
     */
    handleIncomingConnection(conn) {
        if (!this.isHost) return; // 非房主拒绝入站连接

        addGameLog(`🌐 玩家 ${conn.peer} 请求加入房间`);
        
        conn.on('open', () => {
            this.connections[conn.peer] = conn;
            this.setupConnListeners(conn);

            // 向新玩家发送房间信息（现有玩家、房间规则）
            conn.send({
                type: 'room_info',
                data: {
                    roomId: this.roomId,
                    hostId: this.localPlayerId,
                    players: this.players
                }
            });

            // 向现有玩家广播新玩家加入
            this.broadcast({
                type: 'player_joined',
                data: {
                    playerId: conn.peer,
                    playerName: '新玩家', // 等待玩家发送自己的信息
                    character: null
                }
            }, [conn.peer]);
        });
    }

    /**
     * 为连接设置消息监听
     * @param {Peer.DataConnection} conn 连接实例
     */
    setupConnListeners(conn) {
        conn.on('data', (data) => {
            this.handleMessage(conn.peer, data);
        });

        conn.on('close', () => {
            addGameLog(`🌐 玩家 ${conn.peer} 已断开连接`);
            delete this.connections[conn.peer];
            delete this.players[conn.peer];
            
            // 广播玩家离开
            this.broadcast({
                type: 'player_left',
                data: { playerId: conn.peer }
            });

            // 更新UI
            this.updatePlayerListUI();
        });

        conn.on('error', (err) => {
            addGameLog(`❌ 与 ${conn.peer} 的连接出错: ${err.message}`);
        });
    }

    /**
     * 处理接收到的消息
     * @param {string} senderId 发送者ID
     * @param {object} data 消息数据
     */
    handleMessage(senderId, data) {
        switch (data.type) {
            case 'join_room':
                this.handleJoinRoom(senderId, data.data);
                break;
            case 'player_info':
                this.handlePlayerInfo(senderId, data.data);
                break;
            case 'character_selected':
                this.handleCharacterSelected(senderId, data.data);
                break;
            case 'start_game':
                this.handleStartGame(senderId, data.data);
                break;
            case 'game_action':
                this.handleGameAction(senderId, data.data);
                break;
            case 'turn_end':
                this.handleTurnEnd(senderId, data.data);
                break;
            case 'game_over':
                this.handleGameOver(senderId, data.data);
                break;
            default:
                addGameLog(`⚠️ 未知消息类型: ${data.type}`);
                break;
        }
    }

    /**
     * 处理加入房间请求（房主逻辑）
     * @param {string} playerId 玩家ID
     * @param {object} data 加入请求数据
     */
    handleJoinRoom(playerId, data) {
        if (!this.isHost) return;

        // 验证房间ID
        if (data.roomId !== this.roomId) {
            this.sendMessage(playerId, {
                type: 'join_room_response',
                data: { success: false, reason: '房间ID错误' }
            });
            return;
        }

        // 游戏已开始则拒绝加入
        if (this.gameStarted) {
            this.sendMessage(playerId, {
                type: 'join_room_response',
                data: { success: false, reason: '游戏已开始' }
            });
            return;
        }

        // 记录新玩家
        this.players[playerId] = {
            id: playerId,
            name: data.playerName || `玩家${playerId.slice(0, 4)}`,
            character: null,
            health: 0,
            isHost: false,
            isLocal: false
        };

        // 回复加入成功
        this.sendMessage(playerId, {
            type: 'join_room_response',
            data: { 
                success: true,
                roomId: this.roomId,
                hostId: this.localPlayerId,
                players: this.players
            }
        });

        // 广播新玩家加入
        this.broadcast({
            type: 'player_joined',
            data: this.players[playerId]
        }, [playerId]);

        addGameLog(`🌐 ${this.players[playerId].name} 加入房间`);
        this.updatePlayerListUI();
    }

    /**
     * 处理玩家信息同步
     * @param {string} playerId 玩家ID
     * @param {object} data 玩家信息
     */
    handlePlayerInfo(playerId, data) {
        if (this.players[playerId]) {
            this.players[playerId].name = data.name || this.players[playerId].name;
            this.broadcast({
                type: 'player_info_updated',
                data: this.players[playerId]
            });
            this.updatePlayerListUI();
        }
    }

    /**
     * 处理武将选择同步
     * @param {string} playerId 玩家ID
     * @param {object} data 武将信息
     */
    handleCharacterSelected(playerId, data) {
        if (this.players[playerId]) {
            this.players[playerId].character = data.character;
            this.players[playerId].health = data.character.health || 4;
            
            // 房主同步所有玩家武将选择状态
            if (this.isHost) {
                this.broadcast({
                    type: 'character_selected_broadcast',
                    data: {
                        playerId: playerId,
                        character: data.character,
                        health: this.players[playerId].health
                    }
                });
            }

            addGameLog(`🎭 ${this.players[playerId].name} 选择了武将: ${data.character.name}`);
            this.updatePlayerListUI();
        }
    }

    /**
     * 处理开始游戏请求
     * @param {string} senderId 发送者ID
     * @param {object} data 游戏开始数据
     */
    handleStartGame(senderId, data) {
        // 只有房主可以发起开始游戏
        if (senderId !== this.roomId && this.isHost) return;

        // 检查所有玩家是否已选择武将
        const allSelected = Object.values(this.players).every(p => p.character);
        if (!allSelected) {
            addGameLog('⚠️ 还有玩家未选择武将，无法开始游戏');
            return;
        }

        this.gameStarted = true;
        this.broadcast({
            type: 'game_started',
            data: {
                players: this.players,
                firstPlayerId: data.firstPlayerId || this.localPlayerId
            }
        });

        addGameLog('🎮 游戏开始！');
        // 通知游戏核心开始联机游戏
        if (this.gameInstance) {
            this.gameInstance.startOnlineGame(this.players, data.firstPlayerId || this.localPlayerId);
        }
    }

    /**
     * 处理游戏操作同步（出牌、攻击等）
     * @param {string} senderId 发送者ID
     * @param {object} data 操作数据
     */
    handleGameAction(senderId, data) {
        if (!this.gameStarted) return;

        // 广播操作到所有玩家
        this.broadcast({
            type: 'game_action_broadcast',
            data: {
                playerId: senderId,
                action: data.action,
                card: data.card,
                targetId: data.targetId,
                result: data.result
            }
        });

        // 同步游戏状态到本地游戏实例
        if (this.gameInstance && senderId !== this.localPlayerId) {
            this.gameInstance.syncOnlineAction(data);
        }
    }

    /**
     * 处理回合结束同步
     * @param {string} senderId 发送者ID
     * @param {object} data 回合数据
     */
    handleTurnEnd(senderId, data) {
        this.broadcast({
            type: 'turn_ended_broadcast',
            data: {
                currentPlayerId: data.currentPlayerId,
                nextPlayerId: data.nextPlayerId
            }
        });

        if (this.gameInstance && senderId !== this.localPlayerId) {
            this.gameInstance.syncOnlineTurnEnd(data);
        }
    }

    /**
     * 处理游戏结束
     * @param {string} senderId 发送者ID
     * @param {object} data 游戏结束数据
     */
    handleGameOver(senderId, data) {
        this.gameStarted = false;
        this.broadcast({
            type: 'game_ended',
            data: {
                winnerId: data.winnerId,
                winnerName: data.winnerName
            }
        });

        addGameLog(`🏆 游戏结束！胜利者: ${data.winnerName}`);
        if (this.gameInstance) {
            this.gameInstance.endOnlineGame(data);
        }
    }

    /**
     * 创建房间
     * @returns {string} 房间ID
     */
    createRoom() {
        this.isHost = true;
        this.roomId = this.localPlayerId;
        
        // 添加房主到玩家列表
        this.players[this.localPlayerId] = {
            id: this.localPlayerId,
            name: this.localPlayerName,
            character: null,
            health: 0,
            isHost: true,
            isLocal: true
        };

        addGameLog(`🏠 创建房间成功！房间号: ${this.roomId}`);
        return this.roomId;
    }

    /**
     * 加入房间
     * @param {string} roomId 房间ID
     */
    joinRoom(roomId) {
        if (!roomId) {
            addGameLog('❌ 房间ID不能为空');
            return;
        }

        this.roomId = roomId;
        
        // 连接房主
        const conn = this.peer.connect(roomId);
        
        conn.on('open', () => {
            this.connections[roomId] = conn;
            this.setupConnListeners(conn);
            addGameLog(`🌐 正在连接房间: ${roomId}`);

            // 发送加入房间请求
            this.sendMessage(roomId, {
                type: 'join_room',
                data: {
                    roomId: roomId,
                    playerName: this.localPlayerName,
                    playerId: this.localPlayerId
                }
            });
        });

        conn.on('error', (err) => {
            addGameLog(`❌ 无法连接到房间: ${err.message}`);
        });
    }

    /**
     * 发送消息给指定玩家
     * @param {string} peerId 目标玩家ID
     * @param {object} data 消息数据
     */
    sendMessage(peerId, data) {
        if (this.connections[peerId]) {
            try {
                this.connections[peerId].send(data);
            } catch (e) {
                addGameLog(`❌ 发送消息失败: ${e.message}`);
            }
        } else {
            addGameLog(`❌ 未找到与 ${peerId} 的连接`);
        }
    }

    /**
     * 广播消息到所有玩家
     * @param {object} data 消息数据
     * @param {array} excludeIds 排除的玩家ID列表
     */
    broadcast(data, excludeIds = []) {
        Object.keys(this.connections).forEach(peerId => {
            if (!excludeIds.includes(peerId)) {
                this.sendMessage(peerId, data);
            }
        });
    }

    /**
     * 更新玩家列表UI
     */
    updatePlayerListUI() {
        // 通知主逻辑更新UI
        if (window.updateOnlinePlayerList) {
            window.updateOnlinePlayerList(this.players);
        }
    }

    /**
     * 玩家选择武将（同步到其他玩家）
     * @param {object} character 武将数据
     */
    selectCharacter(character) {
        this.localCharacter = character;
        this.players[this.localPlayerId].character = character;
        this.players[this.localPlayerId].health = character.health || 4;

        // 发送武将选择信息
        this.sendMessage(this.roomId, {
            type: 'character_selected',
            data: {
                character: character,
                health: character.health || 4
            }
        });

        addGameLog(`🎭 你选择了武将: ${character.name}`);
    }

    /**
     * 发起开始游戏（房主专用）
     */
    startGame() {
        if (!this.isHost) {
            addGameLog('❌ 只有房主可以开始游戏');
            return;
        }

        // 随机选择第一个行动的玩家
        const playerIds = Object.keys(this.players);
        const firstPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];

        this.sendMessage(this.roomId, {
            type: 'start_game',
            data: {
                firstPlayerId: firstPlayerId
            }
        });

        this.handleStartGame(this.localPlayerId, { firstPlayerId: firstPlayerId });
    }

    /**
     * 同步游戏操作到联机玩家
     * @param {object} actionData 操作数据
     */
    syncGameAction(actionData) {
        this.sendMessage(this.roomId, {
            type: 'game_action',
            data: actionData
        });
    }

    /**
     * 同步回合结束到联机玩家
     * @param {object} turnData 回合数据
     */
    syncTurnEnd(turnData) {
        this.sendMessage(this.roomId, {
            type: 'turn_end',
            data: turnData
        });
    }

    /**
     * 结束联机游戏
     * @param {object} gameOverData 游戏结束数据
     */
    endGame(gameOverData) {
        this.sendMessage(this.roomId, {
            type: 'game_over',
            data: gameOverData
        });
    }

    /**
     * 断开所有连接
     */
    disconnect() {
        // 关闭所有连接
        Object.values(this.connections).forEach(conn => {
            conn.close();
        });
        
        // 关闭Peer实例
        if (this.peer) {
            this.peer.destroy();
        }

        this.connections = {};
        this.players = {};
        this.gameStarted = false;
        this.isHost = false;
        
        addGameLog('🌐 已断开所有联机连接');
    }
}

// 全局工具函数：初始化联机模块
function initOnlineModule(gameInstance) {
    const onlineGame = new OnlineGame(gameInstance);
    window.onlineGame = onlineGame;
    return onlineGame;
}

// 暴露到全局
window.OnlineGame = OnlineGame;
window.initOnlineModule = initOnlineModule;
