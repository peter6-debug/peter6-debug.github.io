/**
 * 随机工具类：负责卡牌洗牌、随机抽取、武将随机选择等核心随机逻辑
 * 无动画/音效，纯逻辑实现
 */
class RandomUtil {
    constructor() {
        // 初始化牌堆（深拷贝所有卡牌，避免修改原数据）
        this.cardPool = JSON.parse(JSON.stringify(ALL_CARDS));
        this.shuffleCardPool(); // 初始化时洗牌
    }

    /**
     * 洗牌算法（Fisher-Yates 洗牌）
     * 保证牌堆随机打乱，模拟真实洗牌效果
     */
    shuffleCardPool() {
        for (let i = this.cardPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cardPool[i], this.cardPool[j]] = [this.cardPool[j], this.cardPool[i]];
        }
    }

    /**
     * 从牌堆摸N张牌
     * @param {number} count - 摸牌数量，默认1张
     * @returns {Array} 摸到的卡牌数组
     */
    drawCards(count = 1) {
        // 牌堆不足时重新洗牌补充
        if (this.cardPool.length < count) {
            this.cardPool = JSON.parse(JSON.stringify(ALL_CARDS));
            this.shuffleCardPool();
            console.log('牌堆不足，已重新洗牌补充');
        }
        
        const drawnCards = this.cardPool.splice(0, count);
        return drawnCards;
    }

    /**
     * 随机抽取N个不重复的武将（排除已选ID）
     * @param {number} count - 抽取数量，默认5个
     * @param {Array} excludedIds - 排除的武将ID数组
     * @returns {Array} 随机武将数组
     */
    getRandomHeroes(count = 5, excludedIds = []) {
        const availableHeroes = HEROES.filter(hero => !excludedIds.includes(hero.id));
        // 洗牌后截取前N个
        const shuffled = [...availableHeroes].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * 随机生成房间ID（6位数字+字母组合）
     * @returns {string} 唯一房间ID
     */
    generateRoomId() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let roomId = '';
        for (let i = 0; i < 6; i++) {
            roomId += chars[Math.floor(Math.random() * chars.length)];
        }
        return roomId;
    }

    /**
     * 判定函数（模拟卡牌判定，返回随机花色/点数）
     * @returns {Object} 判定结果 {suit: 花色, point: 点数}
     */
    judge() {
        const suits = ['红桃', '黑桃', '方块', '梅花'];
        const points = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        return {
            suit: suits[Math.floor(Math.random() * suits.length)],
            point: points[Math.floor(Math.random() * points.length)]
        };
    }
}

// 全局实例化随机工具类
const randomUtil = new RandomUtil();
