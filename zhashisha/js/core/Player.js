/**
 * 玩家类：管理单个玩家的所有状态（武将、体力、手牌、装备、技能等）
 * 核心属性/方法均围绕游戏规则实现，无动画/音效
 */
class Player {
    /**
     * 构造函数初始化玩家
     * @param {string} id - 玩家唯一ID
     * @param {string} name - 玩家昵称
     * @param {Object} hero - 选择的武将（来自HEROES数组）
     * @param {boolean} isSelf - 是否为本地玩家
     */
    constructor(id, name, hero, isSelf = false) {
        this.id = id; // 唯一标识
        this.name = name; // 玩家名称
        this.hero = hero; // 所选武将
        this.isSelf = isSelf; // 是否为自己
        this.isAlive = true; // 是否存活
        this.isInRoom = false; // 是否在房间中
        
        // 体力相关
        this.maxHp = hero.hp; // 最大体力（武将体力值）
        this.currentHp = hero.hp; // 当前体力
        this.hpLimit = hero.hp; // 体力上限
        
        // 卡牌相关
        this.handCards = []; // 手牌
        this.equipments = { // 装备区
            weapon: null, // 武器
            armor: null, // 防具
            plusHorse: null, // 进攻马（+1马）
            minusHorse: null // 防御马（-1马）
        };
        this.treasures = []; // 宝物（最多2个）
        
        // 状态相关
        this.status = { // 标记状态
            chained: false, // 是否被连环
            banned: false, // 是否被禁止出牌
            hurtPlus: false, // 是否受到伤害加成
            attackPlus: false // 是否攻击加成
        };
        this.skillUsed = { // 技能使用记录（防止重复使用）
            limitedSkill: false, // 限定技是否已用
            roundSkill: {} // 回合内技能使用记录
        };
        
        // 回合相关
        this.isTurn = false; // 是否为当前回合
        this.hasDrawn = false; // 本回合是否已摸牌
        this.hasEnded = false; // 本回合是否已结束
    }

    /**
     * 玩家摸牌
     * @param {number} count - 摸牌数量
     * @returns {Array} 摸到的牌
     */
    drawCards(count = 1) {
        if (!this.isAlive) return [];
        if (this.hasDrawn && this.isTurn) {
            console.log(`${this.name}本回合已摸牌，无法重复摸牌`);
            return [];
        }
        
        const drawnCards = randomUtil.drawCards(count);
        this.handCards = [...this.handCards, ...drawnCards];
        this.hasDrawn = true; // 标记本回合已摸牌
        
        // 记录游戏日志
        Game.addLog(`${this.name}摸了${count}张牌，当前手牌数：${this.handCards.length}`);
        
        return drawnCards;
    }

    /**
     * 玩家出牌
     * @param {Object} card - 要出的牌
     * @param {Player} target - 目标玩家（可选）
     * @returns {boolean} 是否出牌成功
     */
    playCard(card, target = null) {
        if (!this.isAlive) return false;
        if (!this.isTurn) return false;
        if (this.hasEnded) return false;
        
        // 检查手牌中是否有该牌
        const cardIndex = this.handCards.findIndex(c => c.id === card.id);
        if (cardIndex === -1) {
            console.log(`${this.name}手牌中没有${card.name}，出牌失败`);
            return false;
        }

        // 移除手牌
        const playedCard = this.handCards.splice(cardIndex, 1)[0];
        
        // 根据卡牌类型处理出牌逻辑
        switch (true) {
            // 基本牌-记名
            case playedCard.id.includes('ji-ming'):
                this.playAttackCard(playedCard, target);
                break;
            // 基本牌-广播
            case playedCard.id === 'guang-bo':
                this.playDefenseCard(playedCard, target);
                break;
            // 基本牌-小红花
            case playedCard.id === 'xiao-hong-hua':
                this.playHealCard(playedCard, target || this);
                break;
            // 基本牌-满分试卷
            case playedCard.id === 'man-fen-shi-juan':
                this.playBuffCard(playedCard);
                break;
            // 装备牌
            case Object.values(CARDS.EQUIP.WEAPON).some(e => e.id === playedCard.id):
                this.equipWeapon(playedCard);
                break;
            case Object.values(CARDS.EQUIP.ARMOR).some(e => e.id === playedCard.id):
                this.equipArmor(playedCard);
                break;
            case Object.values(CARDS.EQUIP.HORSE).some(e => e.id === playedCard.id):
                this.equipHorse(playedCard);
                break;
            case Object.values(CARDS.EQUIP.TREASURE).some(e => e.id === playedCard.id):
                this.equipTreasure(playedCard);
                break;
            // 锦囊牌
            default:
                this.playTrickCard(playedCard, target);
                break;
        }

        Game.addLog(`${this.name}打出了【${playedCard.name}】`);
        return true;
    }

    /**
     * 装备武器
     * @param {Object} weapon - 武器牌
     */
    equipWeapon(weapon) {
        // 卸下原有武器（放入手牌）
        if (this.equipments.weapon) {
            this.handCards.push(this.equipments.weapon);
            Game.addLog(`${this.name}卸下了【${this.equipments.weapon.name}】`);
        }
        this.equipments.weapon = weapon;
        Game.addLog(`${this.name}装备了【${weapon.name}】`);
    }

    /**
     * 装备防具
     * @param {Object} armor - 防具牌
     */
    equipArmor(armor) {
        if (this.equipments.armor) {
            this.handCards.push(this.equipments.armor);
            Game.addLog(`${this.name}卸下了【${this.equipments.armor.name}】`);
        }
        this.equipments.armor = armor;
        Game.addLog(`${this.name}装备了【${armor.name}】`);
    }

    /**
     * 装备坐骑
     * @param {Object} horse - 坐骑牌
     */
    equipHorse(horse) {
        if (horse.name.includes('快速')) { // +1马（防御马）
            if (this.equipments.plusHorse) {
                this.handCards.push(this.equipments.plusHorse);
                Game.addLog(`${this.name}卸下了【${this.equipments.plusHorse.name}】`);
            }
            this.equipments.plusHorse = horse;
        } else { // -1马（进攻马）
            if (this.equipments.minusHorse) {
                this.handCards.push(this.equipments.minusHorse);
                Game.addLog(`${this.name}卸下了【${this.equipments.minusHorse.name}】`);
            }
            this.equipments.minusHorse = horse;
        }
        Game.addLog(`${this.name}装备了【${horse.name}】`);
    }

    /**
     * 装备宝物
     * @param {Object} treasure - 宝物牌
     */
    equipTreasure(treasure) {
        if (this.treasures.length >= 2) {
            // 超过数量限制，替换第一个宝物
            const removed = this.treasures.shift();
            this.handCards.push(removed);
            Game.addLog(`${this.name}卸下了【${removed.name}】`);
        }
        this.treasures.push(treasure);
        Game.addLog(`${this.name}装备了【${treasure.name}】`);
    }

    /**
     * 打出攻击牌（记名类）
     * @param {Object} card - 攻击牌
     * @param {Player} target - 目标玩家
     */
    playAttackCard(card, target) {
        if (!target || !target.isAlive) {
            Game.addLog('攻击目标不存在或已阵亡，攻击失败');
            return;
        }

        // 检查距离是否合法
        if (!this.checkDistance(target)) {
            Game.addLog(`${this.name}与${target.name}距离过远，无法攻击`);
            return;
        }

        // 计算伤害值
        let damage = card.name.includes('严重') || card.name.includes('警告') ? 2 : 1;
        
        // 武器加成
        if (this.equipments.weapon && this.equipments.weapon.name.includes('连发')) {
            damage += 1;
        }
        
        // 武将技能加成
        if (this.hero.id === 'xiong-yu-wei' && this.currentHp === 1) {
            damage += 1;
        }

        // 目标防具减免
        if (target.equipments.armor) {
            if (target.equipments.armor.name.includes('纪律盾牌') && card.suit === '黑桃') {
                Game.addLog(`${target.name}的【${target.equipments.armor.name}】免疫了此次攻击`);
                return;
            }
            if (target.equipments.armor.name.includes('手工纸铠甲') && !card.name.includes('警告')) {
                Game.addLog(`${target.name}的【${target.equipments.armor.name}】免疫了普通记名`);
                return;
            }
            if (target.equipments.armor.name.includes('手工纸铠甲') && card.name.includes('警告')) {
                damage += 1; // 火杀对藤甲伤害+1
            }
        }

        // 目标受到伤害
        target.takeDamage(damage, this, card);
    }

    /**
     * 打出防御牌（广播类）
     * @param {Object} card - 防御牌
     * @param {Player} target - 保护的目标
     */
    playDefenseCard(card, target) {
        const defendTarget = target || this;
        Game.addLog(`${this.name}使用【${card.name}】保护${defendTarget.name}`);
        defendTarget.status.banned = false; // 解除禁止状态
    }

    /**
     * 打出治疗牌（小红花）
     * @param {Object} card - 治疗牌
     * @param {Player} target - 治疗目标
     */
    playHealCard(card, target) {
        if (target.currentHp >= target.maxHp) {
            Game.addLog(`${target.name}已满血，无法治疗`);
            return;
        }
        
        target.currentHp = Math.min(target.currentHp + 1, target.maxHp);
        Game.addLog(`${this.name}使用【${card.name}】为${target.name}恢复了1点体力，当前体力：${target.currentHp}/${target.maxHp}`);
        
        // 触发武将技能（如邵欣然的喜颜）
        if (this.hero.id === 'shao-xin-ran') {
            const randomPlayer = Game.players.find(p => p.isAlive && p.id !== this.id);
            if (randomPlayer) {
                randomPlayer.drawCards(1);
                Game.addLog(`${this.name}触发技能【喜颜】，${randomPlayer.name}摸了1张牌`);
            }
        }
    }

    /**
     * 打出增益牌（满分试卷）
     */
    playBuffCard(card) {
        this.status.attackPlus = true;
        Game.addLog(`${this.name}使用【${card.name}】，下一次攻击伤害+1`);
        
        // 濒死自救
        if (this.currentHp <= 0) {
            this.currentHp = 1;
            Game.addLog(`${this.name}使用【${card.name}】自救，恢复至1点体力`);
        }
    }

    /**
     * 打出锦囊牌
     * @param {Object} card - 锦囊牌
     * @param {Player} target - 目标玩家
     */
    playTrickCard(card, target) {
        switch (card.id) {
            case 'ban-gan-bu-zhi-ling': // 班干部指令
                if (target) {
                    target.status.banned = true;
                    Game.addLog(`${this.name}对${target.name}使用【${card.name}】，本回合禁止其使用记名`);
                }
                break;
            case 'tiao-kai-lao-shi': // 调开老师
                this.status.banned = false;
                Game.addLog(`${this.name}使用【${card.name}】，本回合免疫所有记名`);
                break;
            case 'mei-shou-xiao-wan-ju': // 没收小玩具
                if (target && target.handCards.length > 0) {
                    const randomIndex = Math.floor(Math.random() * target.handCards.length);
                    const removedCard = target.handCards.splice(randomIndex, 1)[0];
                    this.handCards.push(removedCard);
                    Game.addLog(`${this.name}对${target.name}使用【${card.name}】，没收了【${removedCard.name}】`);
                }
                break;
            case 'yi-wai-jiang-li': // 意外奖励
                this.drawCards(2);
                Game.addLog(`${this.name}使用【${card.name}】，额外摸了2张牌`);
                break;
            default:
                Game.addLog(`【${card.name}】效果暂未实现`);
                break;
        }
    }

    /**
     * 受到伤害
     * @param {number} damage - 伤害值
     * @param {Player} attacker - 伤害来源
     * @param {Object} card - 造成伤害的牌
     */
    takeDamage(damage, attacker, card) {
        if (!this.isAlive) return;
        
        // 触发武将技能（如崔崎骏的转学）
        if (this.hero.id === 'cui-qi-jun' && this.handCards.length > 0) {
            const randomPlayer = Game.players.find(p => p.isAlive && p.id !== this.id && p.id !== attacker.id);
            if (randomPlayer) {
                randomPlayer.takeDamage(damage, attacker, card);
                Game.addLog(`${this.name}触发技能【转学】，将伤害转移给${randomPlayer.name}`);
                return;
            }
        }

        // 计算最终伤害
        let finalDamage = damage;
        if (this.status.hurtPlus) finalDamage += 1;
        
        // 扣减体力
        this.currentHp -= finalDamage;
        Game.addLog(`${this.name}受到${finalDamage}点伤害，当前体力：${this.currentHp}/${this.maxHp}`);
        
        // 检查是否濒死
        if (this.currentHp <= 0) {
            this.checkDeath(attacker);
        }
        
        // 触发连环伤害
        if (this.status.chained) {
            Game.players.forEach(p => {
                if (p.isAlive && p.status.chained && p.id !== this.id) {
                    p.takeDamage(finalDamage, attacker, card);
                }
            });
        }
    }

    /**
     * 检查是否死亡
     * @param {Player} attacker - 伤害来源
     */
    checkDeath(attacker) {
        // 触发武将限定技（如诈尸的回炉）
        if (this.hero.id === 'zha-shi' && !this.skillUsed.limitedSkill) {
            this.currentHp = 2;
            this.drawCards(3);
            this.skillUsed.limitedSkill = true;
            Game.addLog(`${this.name}触发限定技【回炉】，恢复2点体力并摸3张牌`);
            return;
        }

        // 触发武将技能（如张浩楠的坚韧）
        if (this.hero.id === 'zhang-hao-nan' && !this.skillUsed.limitedSkill) {
            this.currentHp = this.maxHp;
            this.drawCards(3);
            this.skillUsed.limitedSkill = true;
            Game.addLog(`${this.name}触发限定技【坚韧】，恢复至满血并摸3张牌`);
            return;
        }

        // 判定死亡
        this.isAlive = false;
        this.currentHp = 0;
        Game.addLog(`${this.name}阵亡了！`);
        
        // 触发诈尸的不灭技能
        if (this.hero.id === 'zha-shi') {
            const target = Game.players.find(p => p.isAlive && p.id === attacker.id);
            if (target) {
                target.status.banned = true;
                Game.addLog(`${this.name}触发技能【不灭】，${target.name}下一回合不能出牌`);
            }
        }

        // 检查游戏是否结束
        Game.checkGameOver();
    }

    /**
     * 检查与目标玩家的距离
     * @param {Player} target - 目标玩家
     * @returns {boolean} 是否在攻击距离内
     */
    checkDistance(target) {
        // 基础距离1
        let distance = 1;
        
        // 进攻马（-1马）减距离
        if (this.equipments.minusHorse) distance -= 1;
        
        // 防御马（+1马）加距离
        if (target.equipments.plusHorse) distance += 1;
        
        // 武将技能（如宋浩宇的辽阔）
        if (this.hero.id === 'song-hao-yu') distance -= 1;
        
        return distance <= 1;
    }

    /**
     * 结束回合
     */
    endTurn() {
        if (!this.isTurn) return;
        
        this.isTurn = false;
        this.hasEnded = true;
        this.hasDrawn = false;
        this.skillUsed.roundSkill = {}; // 重置回合技能
        
        // 清除临时状态
        this.status.attackPlus = false;
        
        Game.addLog(`${this.name}结束了回合`);
        Game.nextTurn(); // 切换到下一玩家回合
    }

    /**
     * 重置玩家状态（新回合）
     */
    resetTurnStatus() {
        this.isTurn = true;
        this.hasEnded = false;
        this.hasDrawn = false;
    }

    /**
     * 获取玩家信息摘要（用于UI展示）
     * @returns {Object} 简化的玩家信息
     */
    getSummary() {
        return {
            id: this.id,
            name: this.name,
            heroName: this.hero.name,
            currentHp: this.currentHp,
            maxHp: this.maxHp,
            handCardCount: this.handCards.length,
            isAlive: this.isAlive,
            isSelf: this.isSelf,
            isTurn: this.isTurn
        };
    }
}
