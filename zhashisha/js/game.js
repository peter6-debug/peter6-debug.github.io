// 新增：处理属性伤害和装备效果
Game.prototype.handleCardEffect = function(card, player, targetId) {
    const result = {
        healthChanges: [],
        eliminated: null
    };

    const targetPlayer = this.gameState.players.find(p => p.id === targetId);
    if (!targetPlayer) return result;

    // 基础牌效果
    if (card.type === 'basic') {
        // 记名/严重记名/警告记名
        if (card.name.includes('记名')) {
            // 检查距离
            const distance = this.calculateDistance(player, targetPlayer);
            if (distance > 1) {
                result.error = '距离太远';
                return result;
            }

            // 计算基础伤害
            let damage = 1;
            if (card.name === '严重记名') damage = 2;
            if (card.name === '警告记名') damage = 2;

            // 警告记名+手工铠甲效果
            if (card.name === '警告记名' && targetPlayer.equipment.some(e => e.name === '手工铠甲')) {
                damage += 1;
                addGameLog(`${targetPlayer.name} 装备了手工铠甲，火属性伤害+1！`);
            }

            // 满分试卷加成
            if (player.usedJiu) {
                damage += 1;
                player.usedJiu = false;
                addGameLog(`${player.name} 使用了满分试卷，伤害+1！`);
            }

            // 武将技能加成（罗祎、熊羽唯、袁明伟等）
            if (player.character?.name === '罗祎' && targetPlayer.health >= player.health) {
                damage += 1;
                addGameLog(`${player.name} 发动【举报】，目标血量更高，伤害+1！`);
            }
            if (player.character?.name === '熊羽唯' && player.health === 1) {
                damage += 1;
                addGameLog(`${player.name} 发动【霸气】，体力为1，伤害+1！`);
            }
            if (player.character?.name === '袁明伟' && (player.handCards.length === 0 || targetPlayer.handCards.length === 0)) {
                damage += 1;
                addGameLog(`${player.name} 发动【正大】，无手牌/目标无手牌，伤害+1！`);
            }

            // 检查广播抵消
            let canBlock = true;
            // 凌象乾的高冷技能：第一张记名不可被广播响应
            if (player.character?.name === '凌象乾' && player.turnFirstSha) {
                canBlock = false;
                player.turnFirstSha = false;
                addGameLog(`${player.name} 发动【高冷】，此记名不可被广播响应！`);
            }
            // 罗祎的举报技能：禁止使用广播
            if (player.character?.name === '罗祎') {
                targetPlayer.cannotUseShan = true;
                addGameLog(`${targetPlayer.name} 被【举报】，本回合不能使用广播！`);
                canBlock = false;
            }

            // 检查目标是否出广播
            const hasShan = targetPlayer.handCards.some(c => c.name === '广播做好事记录');
            if (hasShan && canBlock && !targetPlayer.cannotUseShan) {
                // 目标出广播抵消
                const shanCard = targetPlayer.handCards.find(c => c.name === '广播做好事记录');
                targetPlayer.handCards = targetPlayer.handCards.filter(c => c.uniqueId !== shanCard.uniqueId);
                this.gameState.playArea.push({
                    card: shanCard,
                    from: targetPlayer.id,
                    to: player.id
                });
                addGameLog(`${targetPlayer.name} 打出广播做好事记录，抵消了记名！`);
                
                // 韩雪莹的寒澈技能
                if (targetPlayer.character?.name === '韩雪莹') {
                    player.health -= 1;
                    result.healthChanges.push({
                        playerId: player.id,
                        health: player.health
                    });
                    addGameLog(`${targetPlayer.name} 发动【寒澈】，对${player.name}造成1点伤害！`);
                }
            } else {
                // 造成伤害
                targetPlayer.health -= damage;
                result.healthChanges.push({
                    playerId: targetId,
                    health: targetPlayer.health
                });

                // 检查阵亡
                if (targetPlayer.health <= 0) {
                    result.eliminated = targetId;
                }

                addGameLog(`${targetPlayer.name} 受到${damage}点伤害，剩余学习币: ${targetPlayer.health}`);
                
                // 赵邦杰的旧权技能
                const zhaobangjie = this.gameState.players.find(p => p.character?.name === '赵邦杰' && p.health > 0);
                if (zhaobangjie && targetPlayer.health > 0) {
                    addGameLog(`${zhaobangjie.name} 可发动【旧权】弃置${player.name}1张牌抵消此伤害！`);
                    // 简化处理：自动弃置玩家一张牌
                    if (player.handCards.length > 0) {
                        const discardCard = player.handCards.pop();
                        addGameLog(`${zhaobangjie.name} 发动【旧权】，弃置了${player.name}的${discardCard.name}！`);
                        targetPlayer.health += damage; // 抵消伤害
                        result.healthChanges[0].health = targetPlayer.health;
                        addGameLog(`${targetPlayer.name} 的伤害被抵消，恢复至${targetPlayer.health}点学习币！`);
                    }
                }
            }
        }

        // 小红花
        if (card.name === '小红花') {
            targetPlayer.health += 1;
            // 限制最大血量为体力上限
            const maxHealth = targetPlayer.character?.health || 4;
            if (targetPlayer.health > maxHealth) {
                targetPlayer.health = maxHealth;
            }
            result.healthChanges.push({
                playerId: targetId,
                health: targetPlayer.health
            });
            
            // 邵欣然的喜颜技能
            if (player.character?.name === '邵欣然' && player.id === targetId) {
                addGameLog(`${player.name} 发动【喜颜】，可令一名角色摸1张牌！`);
                // 简化处理：随机选一名角色摸牌
                const otherPlayer = this.gameState.players.find(p => p.id !== player.id && p.health > 0);
                if (otherPlayer) {
                    this.drawCard(otherPlayer.id, 1);
                }
            }
        }

        // 满分试卷
        if (card.name === '满分试卷') {
            // 濒死自救
            if (player.health === 0) {
                player.health += 1;
                result.healthChanges.push({
                    playerId: player.id,
                    health: player.health
                });
                addGameLog(`${player.name} 使用满分试卷自救，恢复1点学习币！`);
            } else {
                // 标记伤害加成
                player.usedJiu = true;
                addGameLog(`${player.name} 使用满分试卷，下一张记名伤害+1！`);
            }
        }
    }

    // 装备牌效果
    if (card.type === 'equipment') {
        player.equipment.push(card);
        result.equipmentAdded = card;
        
        // 张歆杨的志阳技能：不能成为记名目标
        if (player.character?.name === '张歆杨') {
            addGameLog(`${player.name} 发动【志阳】，不会成为记名的目标！`);
        }
    }

    return result;
};

// 扩展：处理武将技能（部分核心技能）
Game.prototype.handleCharacterSkills = function(player, action, data) {
    // 金子博 - 买通
    if (player.character?.name === '金子博' && action === 'draw') {
        if (!player.usedMaitong) {
            this.drawCard(player.id, 1); // 多摸1张
            player.cannotUseSha = true; // 本回合不能用记名
            player.usedMaitong = true;
            addGameLog(`${player.name} 发动【买通】，多摸1张牌，本回合不能使用记名！`);
        }
    }

    // 黄嘉铭 - 变异
    if (player.character?.name === '黄嘉铭' && action === 'damage') {
        const randomColor = Math.random() > 0.5 ? 'red' : 'black';
        addGameLog(`${player.name} 发动【变异】，声明颜色：${randomColor === 'red' ? '红' : '黑'}！`);
        
        // 简化判定：50%概率成功
        if (Math.random() > 0.5) {
            const damageSource = this.gameState.players.find(p => p.id === data.sourceId);
            if (damageSource) {
                damageSource.health -= data.damage;
                addGameLog(`判定成功！${damageSource.name} 代替${player.name}承受${data.damage}点伤害！`);
            }
        }
    }

    // 郝端端 - 美颜（任意牌当广播）
    if (player.character?.name === '郝端端' && action === 'needShan') {
        if (player.handCards.length > 0) {
            const randomCard = player.handCards.pop();
            addGameLog(`${player.name} 发动【美颜】，将${randomCard.name}当广播使用！`);
            return true; // 成功抵消
        }
    }

    // 更多武将技能可在此扩展...
};

// 其他原有逻辑保持不变，仅新增以上适配代码
