/**
 * 房间管理类 - 修复创建房间失败问题
 */
const Room = {
    // 存储房间数据
    rooms: {},
    
    /**
     * 创建房间
     * @param {string} roomId - 房间ID
     * @returns {boolean} 是否创建成功
     */
    createRoom(roomId) {
        if (!roomId || this.rooms[roomId]) {
            console.log(`房间${roomId}已存在或ID无效`);
            return false;
        }
        
        // 创建房间数据结构
        this.rooms[roomId] = {
            id: roomId,
            players: [],
            isStarted: false,
            createTime: Date.now()
        };
        
        console.log(`房间${roomId}创建成功`);
        return true;
    },
    
    /**
     * 加入房间
     * @param {string} roomId - 房间ID
     * @param {Object} player - 玩家数据
     * @returns {boolean} 是否加入成功
     */
    joinRoom(roomId, player) {
        // 检查房间是否存在
        if (!this.rooms[roomId]) {
            console.error(`房间${roomId}不存在`);
            return false;
        }
        
        const room = this.rooms[roomId];
        
        // 检查玩家数量限制
        if (room.players.length >= 4) {
            console.error(`房间${roomId}已满`);
            return false;
        }
        
        // 检查玩家是否已存在
        const playerExists = room.players.some(p => p.id === player.id);
        if (playerExists) {
            console.error(`玩家${player.id}已在房间${roomId}中`);
            return false;
        }
        
        // 添加玩家
        room.players.push({
            id: player.id,
            name: player.name,
            heroId: player.heroId || null,
            isReady: player.isReady || false,
            joinTime: Date.now()
        });
        
        console.log(`玩家${player.id}加入房间${roomId}成功，当前人数：${room.players.length}`);
        return true;
    },
    
    /**
     * 离开房间
     * @param {string} roomId - 房间ID
     * @param {string} playerId - 玩家ID
     * @returns {boolean} 是否离开成功
     */
    leaveRoom(roomId, playerId) {
        if (!this.rooms[roomId]) {
            return false;
        }
        
        const room = this.rooms[roomId];
        const initialLength = room.players.length;
        
        // 移除玩家
        room.players = room.players.filter(p => p.id !== playerId);
        
        // 如果房间为空，删除房间
        if (room.players.length === 0) {
            delete this.rooms[roomId];
            console.log(`房间${roomId}已删除（无玩家）`);
        }
        
        return initialLength > room.players.length;
    },
    
    /**
     * 选择武将
     * @param {string} roomId - 房间ID
     * @param {string} playerId - 玩家ID
     * @param {string} heroId - 武将ID
     * @returns {boolean} 是否选择成功
     */
    selectHero(roomId, playerId, heroId) {
        if (!this.rooms[roomId]) return false;
        
        const room = this.rooms[roomId];
        const player = room.players.find(p => p.id === playerId);
        
        if (!player) return false;
        
        // 检查武将是否已被选择
        const heroSelected = room.players.some(p => p.heroId === heroId && p.id !== playerId);
        if (heroSelected) return false;
        
        // 更新玩家武将信息
        player.heroId = heroId;
        player.isReady = true;
        
        return true;
    },
    
    /**
     * 开始游戏
     * @param {string} roomId - 房间ID
     * @returns {boolean} 是否开始成功
     */
    startGame(roomId) {
        if (!this.rooms[roomId]) return false;
        
        const room = this.rooms[roomId];
        
        // 检查所有玩家是否已准备
        const allReady = room.players.every(p => p.isReady && p.heroId);
        if (!allReady) return false;
        
        room.isStarted = true;
        return true;
    },
    
    /**
     * 获取房间信息
     * @param {string} roomId - 房间ID
     * @returns {Object|null} 房间信息
     */
    getRoomInfo(roomId) {
        return this.rooms[roomId] || null;
    },
    
    /**
     * 检查房间是否存在
     * @param {string} roomId - 房间ID
     * @returns {boolean} 是否存在
     */
    checkRoomExists(roomId) {
        return !!this.rooms[roomId];
    },
    
    /**
     * 获取所有房间列表
     * @returns {Array} 房间列表
     */
    getAllRooms() {
        return Object.values(this.rooms);
    },
    
    /**
     * 清理过期房间（超过30分钟）
     */
    cleanExpiredRooms() {
        const now = Date.now();
        const expireTime = 30 * 60 * 1000; // 30分钟
        
        Object.keys(this.rooms).forEach(roomId => {
            const room = this.rooms[roomId];
            if (now - room.createTime > expireTime && !room.isStarted) {
                delete this.rooms[roomId];
                console.log(`清理过期房间：${roomId}`);
            }
        });
    }
};

// 每5分钟清理一次过期房间
setInterval(() => {
    Room.cleanExpiredRooms();
}, 5 * 60 * 1000);

window.Room = Room;
