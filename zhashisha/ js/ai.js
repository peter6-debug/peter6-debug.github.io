// AI玩家类
class AIPlayer {
    constructor(id, name, character) {
        this.id = id;
        this.name = name;
        this.character = character;
        this.health = character.health;
        this.handCards = [];
        this.equipment = [];
        this.isAI = true;
        // 技能标记
        this.cannotUseSha = false;
        this.extraDraw = false;
        this.cannotUseShan = false;
        this.cannotRespondSha = false;
        this.usedJianRen = false;
        this.usedBianYi = false;
        this.cannotPlayCards = false;
        this.huiluCount = 0;
        this.usedBaoRong = false;
    }

    // AI思考并行动
    thinkAndAct(game) {
        setTimeout(() => {
            // 摸牌阶段
            if (game.phase === 'draw') {
                game.drawCard(this.id, 2);
                game.phase = 'play';
                addGameLog(`${this.name}（AI）摸了2张牌，进入出牌阶段`);
                
                // 延迟出牌
                setTimeout(() => {
                    this.playCards(game);
                }, 1000);
            }
        }, 1000);
    }

    // AI出牌逻辑
    playCards(game) {
        // 找到可攻击的目标
        const enemies = game.players.filter(p => p.id !== this.id && p.health > 0);
        if (enemies.length === 0) {
            game.endTurn();
            return;
        }

        // 优先出杀
        const shaCards = this.handCards.filter(card => card.name.includes('记名（杀）'));
        if (shaCards.length > 0 && !this.cannotUseSha) {
            const target = enemies[Math.floor(Math.random() * enemies.length)];
            const distance = game.calculateDistance(this, target);
            
            if (distance <= 1) {
                // 使用杀
                const shaCard = shaCards[0];
                this.handCards = this.handCards.filter(c => c.uniqueId !== shaCard.uniqueId);
                
                game.playArea.push({
                    card: shaCard,
                    from: this,
                    to: target
                });
                
                addGameLog(`${this.name}（AI）对 ${target.name} 使用了 ${shaCard.name}`);
                
                // 检查目标是否有闪
                const targetHasShan = target.handCards.some(c => c.name.includes('广播做好事记录（闪）'));
                if (!targetHasShan || Math.random() > 0.5) {
                    // 造成伤害
                    target.health -= 1;
                    addGameLog(`${target.name} 受到1点伤害，剩余学习币: ${target.health}`);
                    
                    if (target.health <= 0) {
                        game.removePlayer(target.id);
                    }
                } else {
                    // 目标出闪
                    const shanCard = target.handCards.find(c => c.name.includes('广播做好事记录（闪）'));
                    if (shanCard) {
                        target.handCards = target.handCards.filter(c => c.uniqueId !== shanCard.uniqueId);
                        game.playArea.push({
                            card: shanCard,
                            from: target,
                            to: this
                        });
                        addGameLog(`${target.name} 出闪抵消了 ${this.name} 的杀！`);
                    }
                }
            }
        }

        // 自己血量低时使用桃
        if (this.health < this.character.health / 2) {
            const taoCards = this.handCards.filter(card => card.name.includes('礼物（桃）'));
            if (taoCards.length > 0) {
                const taoCard = taoCards[0];
                this.handCards = this.handCards.filter(c => c.uniqueId !== taoCard.uniqueId);
                
                game.playArea.push({
                    card: taoCard,
                    from: this,
                    to: this
                });
                
                this.health += 1;
                addGameLog(`${this.name}（AI）使用了 ${taoCard.name}，回复1点学习币`);
            }
        }

        // 使用装备牌
        const equipmentCards = this.handCards.filter(card => card.type === 'equipment');
        if (equipmentCards.length > 0) {
            const equipCard = equipmentCards[0];
            this.handCards = this.handCards.filter(c => c.uniqueId !== equipCard.uniqueId);
            this.equipment.push(equipCard);
            
            game.playArea.push({
                card: equipCard,
                from: this,
                to: this
            });
            
            addGameLog(`${this.name}（AI）装备了 ${equipCard.name}`);
        }

        // 使用锦囊牌
        const jinangCards = this.handCards.filter(card => card.type === 'jinang');
        if (jinangCards.length > 0) {
            const jinangCard = jinangCards[0];
            this.handCards = this.handCards.filter(c => c.uniqueId !== jinangCard.uniqueId);
            
            game.playArea.push({
                card: jinangCard,
                from: this,
                to: null
            });
            
            addGameLog(`${this.name}（AI）使用了 ${jinangCard.name}`);
            
            // 处理锦囊效果
            if (jinangCard.id === 5 || jinangCard.id === 6) {
                // 南蛮入侵/万箭齐发
                game.players.forEach(player => {
                    if (player.id !== this.id && player.health > 0) {
                        const hasDefense = jinangCard.id === 5 
                            ? player.handCards.some(c => c.name.includes('记名（杀）'))
                            : player.handCards.some(c => c.name.includes('广播做好事记录（闪）'));
                        
                        if (!hasDefense) {
                            player.health -= 1;
                            addGameLog(`${player.name} 受到1点伤害，剩余学习币: ${player.health}`);
                            
                            if (player.health <= 0) {
                                game.removePlayer(player.id);
                            }
                        } else {
                            const defenseCard = jinangCard.id === 5
                                ? player.handCards.find(c => c.name.includes('记名（杀）'))
                                : player.handCards.find(c => c.name.includes('广播做好事记录（闪）'));
                            
                            player.handCards = player.handCards.filter(c => c.uniqueId !== defenseCard.uniqueId);
                            game.playArea.push({
                                card: defenseCard,
                                from: player,
                                to: null
                            });
                            addGameLog(`${player.name} 出${jinangCard.id === 5 ? '杀' : '闪'}抵御了锦囊`);
                        }
                    }
                });
            } else if (jinangCard.id === 7) {
                // 五谷丰登
                game.players.forEach(player => {
                    if (player.health > 0) {
                        game.drawCard(player.id, 1);
                    }
                });
            }
        }

        // 结束回合
        addGameLog(`${this.name}（AI）结束了回合`);
        game.updateGameUI();
        setTimeout(() => {
            game.endTurn();
        }, 1000);
    }
}

window.AIPlayer = AIPlayer;
