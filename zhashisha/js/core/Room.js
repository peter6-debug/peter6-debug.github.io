/**
 * 房间管理类：负责联机房间的创建、加入、玩家管理
 * 基于localStorage实现本地房间存储（无后端，仅前端模拟联机）
 * 无动画/音效，纯逻辑实现
 */
class Room {
    constructor() {
        this.rooms = JSON.parse(localStorage.getItem('zhashisha_rooms')) || {}; // 房间存储
    }

    /**
     * 创建新房间
     * @returns {string} 房间ID
     */
    static createRoom() {
        const roomId = randomUtil.generateRoomId();
        const roomData = {
            id: roomId,
            creator: 'player_' + Date.now(), // 创建者ID
            players: [], // 房间内玩家
            isStarted: false, // 游戏是否开始
            createTime: new Date().getTime()
        };
        
        // 存储房间数据
        const rooms = JSON.parse(localStorage.getItem('zhashisha_rooms')) || {};
        rooms[roomId] = roomData;
        localStorage.setItem('zhashisha_rooms', JSON.stringify(rooms));
        
        console.log(`房间创建成功：${roomId}`);
        return roomId;
    }

    /**
     * 检查房间是否存在
     * @param {string} roomId - 房间ID
     * @returns {boolean} 是否存在
     */
    static checkRoomExists(roomId) {
        const rooms = JSON.parse(localStorage.getItem('zhashisha_rooms')) || {};
        return !!rooms[roomId];
    }

    /**
     * 加入房间
     * @param {string} roomId - 房间ID
     * @param {Object} player - 加入的玩家信息
     * @returns {boolean} 是否加入成功
     */
    static joinRoom(roomId, player) {
        if (!this.checkRoomExists(roomId)) {
            console.log(`房间${roomId}不存在`);
            return false;
        }
        
        const rooms = JSON.parse(localStorage.getItem('zhashisha_rooms')) || {};
        const room = rooms[roomId];
        
        // 检查房间是否已满（最多4人）
        if (room.players.length >= 4) {
            console.log(`房间${roomId}已满`);
            return false;
        }
        
        // 检查游戏是否已开始
        if (room.isStarted) {
            console.log(`房间${roomId}游戏已开始，无法加入`);
            return false;
        }
        
        // 添加玩家
        room.players.push({
            id: player.id,
            name: player.name,
            heroId: null, // 未选武将
            isReady: false // 未准备
        });
        
        // 更新房间数据
        rooms[roomId] = room;
        localStorage.setItem('zhashisha_rooms', JSON.stringify(rooms));
        
        console.log(`玩家${player.name}加入房间${roomId}成功`);
        return true;
    }

    /**
     * 玩家选择武将
     * @param {string} roomId - 房间ID
     * @param {string} playerId - 玩家ID
     * @param {string} heroId - 武将ID
     * @returns {boolean} 是否选择成功
     */
    static selectHero(roomId, playerId, heroId) {
        if (!this.checkRoomExists(roomId)) return false;
        
        const rooms = JSON.parse(localStorage.getItem('zhashisha_rooms')) || {};
        const room = rooms[roomId];
        const playerIndex = room.players.findIndex(p => p.id === playerId);
        
        if (playerIndex === -1) return false;
        
        // 检查武将是否已被选择
        const heroSelected = room.players.some(p => p.heroId === heroId);
        if (heroSelected) {
            console.log(`武将${heroId}已被选择`);
            return false;
        }
        
        // 设置玩家武将
        room.players[playerIndex].heroId = heroId;
        room.players[playerIndex].isReady = true;
        
        // 更新房间数据
        rooms[roomId] = room;
        localStorage.setItem('zhashisha_rooms', JSON.stringify(rooms));
        
        console.log(`玩家${playerId}选择了武将${heroId}`);
        return true;
    }

    /**
     * 开始房间游戏
     * @param {string} roomId - 房间ID
     * @returns {boolean} 是否开始成功
     */
    static startGame(roomId) {
        if (!this.checkRoomExists(roomId)) return false;
        
        const rooms = JSON.parse(localStorage.getItem('zhashisha_rooms')) || {};
        const room = rooms[roomId];
        
        // 检查所有玩家是否已准备
        const allReady = room.players.every(p => p.isReady && p.heroId);
        if (!allReady) {
            console.log('还有玩家未选择武将或未准备');
            return false;
        }
        
        room.isStarted = true;
        rooms[roomId] = room;
        localStorage.setItem('zhashisha_rooms', JSON.stringify(rooms));
        
        console.log(`房间${roomId}游戏开始`);
        return true;
    }

    /**
     * 获取房间信息
     * @param {string} roomId - 房间ID
     * @returns {Object|null} 房间信息
     */
    static getRoomInfo(roomId) {
        if (!this.checkRoomExists(roomId)) return null;
        
        const rooms = JSON.parse(localStorage.getItem('zhashisha_rooms')) || {};
        return rooms[roomId];
    }

    /**
     * 离开房间
     * @param {string} roomId - 房间ID
     * @param {string} playerId - 玩家ID
     * @returns {boolean} 是否离开成功
     */
    static leaveRoom(roomId, playerId) {
        if (!this.checkRoomExists(roomId)) return false;
        
        const rooms = JSON.parse(localStorage.getItem('zhashisha_rooms')) || {};
        const room = rooms[roomId];
        
        // 移除玩家
        room.players = room.players.filter(p => p.id !== playerId);
        
        // 房间为空则删除
        if (room.players.length === 0) {
            delete rooms[roomId];
        } else {
            rooms[roomId] = room;
        }
        
        localStorage.setItem('zhashisha_rooms', JSON.stringify(rooms));
        console.log(`玩家${playerId}离开房间${roomId}`);
        return true;
    }

    /**
     * 清理过期房间（超过30分钟未开始的房间）
     */
    static cleanExpiredRooms() {
        const rooms = JSON.parse(localStorage.getItem('zhashisha_rooms')) || {};
        const now = new Date().getTime();
        const expiredRooms = {};
        
        // 保留未过期的房间
        Object.keys(rooms).forEach(roomId => {
            const room = rooms[roomId];
            // 30分钟过期
            if (now - room.createTime < 30 * 60 * 1000) {
                expiredRooms[roomId] = room;
            }
        });
        
        localStorage.setItem('zhashisha_rooms', JSON.stringify(expiredRooms));
        console.log('过期房间清理完成');
    }
}

// 页面加载时清理过期房间
window.addEventListener('load', () => {
    Room.cleanExpiredRooms();
});
