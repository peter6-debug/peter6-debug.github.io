/**
 * 本地存储工具类
 * 封装localStorage操作，提供数据持久化、游戏存档/读档、配置管理等功能
 * 支持数据加密、过期时间、批量操作等增强功能
 */
const StorageUtil = {
    // 存储前缀（避免键名冲突）
    prefix: 'zhashisha_',
    
    // 加密密钥（简单XOR加密）
    secretKey: 'zhashisha2024',
    
    /**
     * 设置本地存储
     * @param {string} key - 存储键名
     * @param {any} value - 存储值
     * @param {number} expire - 过期时间（秒），0为永不过期
     * @param {boolean} encrypt - 是否加密存储
     */
    set(key, value, expire = 0, encrypt = false) {
        try {
            // 构建存储对象
            const storageObj = {
                value: value,
                expire: expire > 0 ? Date.now() + expire * 1000 : 0,
                createTime: Date.now()
            };
            
            // 序列化并可选加密
            let storageStr = JSON.stringify(storageObj);
            if (encrypt) {
                storageStr = this.encrypt(storageStr);
            }
            
            // 存储到localStorage
            localStorage.setItem(this.prefix + key, storageStr);
            
            return true;
        } catch (error) {
            console.error('存储失败：', error);
            return false;
        }
    },

    /**
     * 获取本地存储
     * @param {string} key - 存储键名
     * @param {boolean} decrypt - 是否解密
     * @returns {any} 存储值（过期/不存在返回null）
     */
    get(key, decrypt = false) {
        try {
            const storageStr = localStorage.getItem(this.prefix + key);
            
            // 不存在
            if (!storageStr) return null;
            
            // 解密
            let storageObjStr = storageStr;
            if (decrypt) {
                storageObjStr = this.decrypt(storageStr);
            }
            
            // 解析
            const storageObj = JSON.parse(storageObjStr);
            
            // 检查过期
            if (storageObj.expire > 0 && Date.now() > storageObj.expire) {
                this.remove(key); // 自动清理过期数据
                return null;
            }
            
            return storageObj.value;
        } catch (error) {
            console.error('读取失败：', error);
            return null;
        }
    },

    /**
     * 移除本地存储
     * @param {string} key - 存储键名
     */
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('移除失败：', error);
            return false;
        }
    },

    /**
     * 清空所有存储（仅当前前缀）
     */
    clear() {
        try {
            // 只删除当前前缀的存储项
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('清空失败：', error);
            return false;
        }
    },

    /**
     * 简单XOR加密
     * @param {string} str - 要加密的字符串
     * @returns {string} 加密后的Base64字符串
     */
    encrypt(str) {
        let encrypted = '';
        for (let i = 0; i < str.length; i++) {
            // XOR加密
            encrypted += String.fromCharCode(
                str.charCodeAt(i) ^ this.secretKey.charCodeAt(i % this.secretKey.length)
            );
        }
        // Base64编码
        return btoa(unescape(encodeURIComponent(encrypted)));
    },

    /**
     * 简单XOR解密
     * @param {string} encryptedStr - 加密后的Base64字符串
     * @returns {string} 解密后的字符串
     */
    decrypt(encryptedStr) {
        try {
            // Base64解码
            const decoded = decodeURIComponent(escape(atob(encryptedStr)));
            let decrypted = '';
            
            // XOR解密
            for (let i = 0; i < decoded.length; i++) {
                decrypted += String.fromCharCode(
                    decoded.charCodeAt(i) ^ this.secretKey.charCodeAt(i % this.secretKey.length)
                );
            }
            
            return decrypted;
        } catch (error) {
            console.error('解密失败：', error);
            return '';
        }
    },

    /**
     * 保存游戏存档
     * @param {string} saveName - 存档名称
     * @param {Object} gameState - 游戏状态数据
     * @returns {boolean} 是否保存成功
     */
    saveGame(saveName, gameState) {
        // 构建存档数据
        const saveData = {
            saveName: saveName,
            gameState: gameState,
            players: Game.players.map(player => {
                // 序列化玩家数据（排除DOM相关属性）
                return {
                    id: player.id,
                    name: player.name,
                    hero: player.hero,
                    isSelf: player.isSelf,
                    isAlive: player.isAlive,
                    maxHp: player.maxHp,
                    currentHp: player.currentHp,
                    hpLimit: player.hpLimit,
                    handCards: player.handCards,
                    equipments: player.equipments,
                    treasures: player.treasures,
                    status: player.status,
                    skillUsed: player.skillUsed,
                    isTurn: player.isTurn,
                    hasDrawn: player.hasDrawn,
                    hasEnded: player.hasEnded
                };
            }),
            cardPool: randomUtil.cardPool,
            logs: Game.logs,
            saveTime: new Date().toLocaleString()
        };
        
        // 加密存储（有效期7天）
        return this.set(`save_${saveName}`, saveData, 7 * 24 * 60 * 60, true);
    },

    /**
     * 读取游戏存档
     * @param {string} saveName - 存档名称
     * @returns {Object|null} 存档数据
     */
    loadGame(saveName) {
        const saveData = this.get(`save_${saveName}`, true);
        if (!saveData) return null;
        
        Game.addLog(`成功加载存档：${saveName}`);
        return saveData;
    },

    /**
     * 获取所有存档列表
     * @returns {Array} 存档列表
     */
    getSaveList() {
        const saveList = [];
        
        // 遍历所有存储项
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(`${this.prefix}save_`)) {
                const saveName = key.replace(`${this.prefix}save_`, '');
                const saveData = this.get(`save_${saveName}`, true);
                
                if (saveData) {
                    saveList.push({
                        name: saveName,
                        saveTime: saveData.saveTime,
                        playerCount: saveData.players.length,
                        mode: saveData.gameState.mode
                    });
                }
            }
        });
        
        // 按保存时间排序（最新的在前）
        return saveList.sort((a, b) => new Date(b.saveTime) - new Date(a.saveTime));
    },

    /**
     * 删除游戏存档
     * @param {string} saveName - 存档名称
     * @returns {boolean} 是否删除成功
     */
    deleteSave(saveName) {
        const result = this.remove(`save_${saveName}`);
        if (result) {
            Game.addLog(`成功删除存档：${saveName}`);
        }
        return result;
    },

    /**
     * 保存游戏配置
     * @param {Object} config - 游戏配置
     * @returns {boolean} 是否保存成功
     */
    saveConfig(config) {
        // 合并现有配置
        const currentConfig = this.get('config') || {};
        const newConfig = { ...currentConfig, ...config };
        
        // 存储（永不过期，不加密）
        return this.set('config', newConfig, 0, false);
    },

    /**
     * 获取游戏配置
     * @returns {Object} 游戏配置
     */
    getConfig() {
        // 默认配置
        const defaultConfig = {
            sound: true,
            music: true,
            bgmVolume: 0.7,
            soundVolume: 0.8,
            autoSave: true,
            language: 'zh-CN'
        };
        
        // 合并用户配置
        const userConfig = this.get('config') || {};
        return { ...defaultConfig, ...userConfig };
    },

    /**
     * 批量设置存储
     * @param {Object} data - 键值对对象
     * @param {number} expire - 过期时间（秒）
     * @param {boolean} encrypt - 是否加密
     * @returns {Object} 每个键的设置结果
     */
    batchSet(data, expire = 0, encrypt = false) {
        const results = {};
        
        Object.keys(data).forEach(key => {
            results[key] = this.set(key, data[key], expire, encrypt);
        });
        
        return results;
    },

    /**
     * 批量获取存储
     * @param {Array} keys - 键名数组
     * @param {boolean} decrypt - 是否解密
     * @returns {Object} 键值对结果
     */
    batchGet(keys, decrypt = false) {
        const results = {};
        
        keys.forEach(key => {
            results[key] = this.get(key, decrypt);
        });
        
        return results;
    }
};

// 全局暴露存储工具类
window.StorageUtil = StorageUtil;

// 自动保存功能（每5分钟）
setInterval(() => {
    if (Game.state.isStarted && !Game.state.isOver) {
        const config = StorageUtil.getConfig();
        if (config.autoSave) {
            // 自动保存到临时存档
            StorageUtil.saveGame('auto_save', Game.state);
            DOM.showToast('游戏已自动保存', 'info', 2000);
        }
    }
}, 5 * 60 * 1000);

// 页面关闭前提示保存
window.addEventListener('beforeunload', (e) => {
    if (Game.state.isStarted && !Game.state.isOver) {
        // 自动保存
        StorageUtil.saveGame('temp_save', Game.state);
        
        // 显示提示
        e.preventDefault();
        e.returnValue = '游戏正在进行中，离开将自动保存进度！';
        return '游戏正在进行中，离开将自动保存进度！';
    }
});
