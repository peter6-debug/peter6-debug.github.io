// 卡牌类型定义 - 适配小学生校园版
function createCardDeck() {
    const deck = [];
    let cardId = 1;

    // 一、基本牌
    // 1. 记名（红/黑）- 15张
    for (let i = 0; i < 8; i++) {
        deck.push({
            id: 1,
            name: '记名',
            type: 'basic',
            color: 'red',
            uniqueId: `card_${cardId++}`,
            desc: '对距离1的角色造成1点学习币伤害（被老师记名批评）'
        });
    }
    for (let i = 0; i < 7; i++) {
        deck.push({
            id: 1,
            name: '记名',
            type: 'basic',
            color: 'black',
            uniqueId: `card_${cardId++}`,
            desc: '对距离1的角色造成1点学习币伤害（被老师记名批评）'
        });
    }

    // 2. 严重记名（雷属性）- 5张
    for (let i = 0; i < 5; i++) {
        deck.push({
            id: 2,
            name: '严重记名',
            type: 'basic',
            color: 'black',
            attribute: 'thunder',
            uniqueId: `card_${cardId++}`,
            desc: '雷属性记名，对目标造成2点学习币伤害（更严重的批评）'
        });
    }

    // 3. 警告记名（火属性）- 5张
    for (let i = 0; i < 5; i++) {
        deck.push({
            id: 3,
            name: '警告记名',
            type: 'basic',
            color: 'red',
            attribute: 'fire',
            uniqueId: `card_${cardId++}`,
            desc: '火属性记名，对目标造成2点学习币伤害，若目标有手工铠甲，伤害+1'
        });
    }

    // 4. 广播做好事记录（闪）- 10张
    for (let i = 0; i < 10; i++) {
        deck.push({
            id: 4,
            name: '广播做好事记录',
            type: 'basic',
            color: 'red',
            uniqueId: `card_${cardId++}`,
            desc: '抵消一次记名（无论普通还是严重记名），用做好事抵消批评'
        });
    }

    // 5. 小红花（桃）- 8张
    for (let i = 0; i < 8; i++) {
        deck.push({
            id: 5,
            name: '小红花',
            type: 'basic',
            color: 'red',
            uniqueId: `card_${cardId++}`,
            desc: '回复1点学习币；可救濒死的队友'
        });
    }

    // 6. 满分试卷（酒）- 6张
    for (let i = 0; i < 6; i++) {
        deck.push({
            id: 6,
            name: '满分试卷',
            type: 'basic',
            color: 'red',
            uniqueId: `card_${cardId++}`,
            desc: '本回合下一张记名伤害+1；自身濒死时可自救恢复1点学习币'
        });
    }

    // 二、普通类锦囊牌
    // 7. 班干部指令 - 3张
    for (let i = 0; i < 3; i++) {
        deck.push({
            id: 7,
            name: '班干部指令',
            type: 'jinang',
            color: 'black',
            uniqueId: `card_${cardId++}`,
            desc: '指定一名同学，本回合不能使用任何记名'
        });
    }

    // 8. 调开老师 - 2张
    for (let i = 0; i < 2; i++) {
        deck.push({
            id: 8,
            name: '调开老师',
            type: 'jinang',
            color: 'red',
            uniqueId: `card_${cardId++}`,
            desc: '本回合，所有其他同学都不能对你使用记名'
        });
    }

    // 9. 没收小玩具 - 4张
    for (let i = 0; i < 4; i++) {
        deck.push({
            id: 9,
            name: '没收小玩具',
            type: 'jinang',
            color: 'black',
            uniqueId: `card_${cardId++}`,
            desc: '选择一名同学，弃置他手里1张牌（装备/手牌）'
        });
    }

    // 10. 点燃小纸条 - 3张
    for (let i = 0; i < 3; i++) {
        deck.push({
            id: 10,
            name: '点燃小纸条',
            type: 'jinang',
            color: 'red',
            attribute: 'fire',
            uniqueId: `card_${cardId++}`,
            desc: '让一名同学展示1张牌，若为红色，对他造成1点火属性伤害'
        });
    }

    // 11. 连环小恶作剧 - 4张
    for (let i = 0; i < 4; i++) {
        deck.push({
            id: 11,
            name: '连环小恶作剧',
            type: 'jinang',
            color: 'red',
            attribute: 'fire',
            uniqueId: `card_${cardId++}`,
            desc: '对所有处于连环扣状态的同学，各造成1点火属性伤害'
        });
    }

    // 12. 借文具"报仇" - 2张
    for (let i = 0; i < 2; i++) {
        deck.push({
            id: 12,
            name: '借文具"报仇"',
            type: 'jinang',
            color: 'black',
            uniqueId: `card_${cardId++}`,
            desc: '向一名有装备的同学借1件装备，然后对其攻击范围内的同学用1次记名'
        });
    }

    // 13. 吵架对决 - 3张
    for (let i = 0; i < 3; i++) {
        deck.push({
            id: 13,
            name: '吵架对决',
            type: 'jinang',
            color: 'red',
            uniqueId: `card_${cardId++}`,
            desc: '和一名同学轮流打出记名，先出不出的失去1点学习币'
        });
    }

    // 14. 小组分享会 - 2张
    for (let i = 0; i < 2; i++) {
        deck.push({
            id: 14,
            name: '小组分享会',
            type: 'jinang',
            color: 'red',
            uniqueId: `card_${cardId++}`,
            desc: '你和所有队友，各恢复1点学习币，再各摸1张牌'
        });
    }

    // 15. 团结一心 - 2张
    for (let i = 0; i < 2; i++) {
        deck.push({
            id: 15,
            name: '团结一心',
            type: 'jinang',
            color: 'red',
            uniqueId: `card_${cardId++}`,
            desc: '本回合，你和所有队友打出的记名，伤害都+1'
        });
    }

    // 16. 班主任回班 - 3张
    for (let i = 0; i < 3; i++) {
        deck.push({
            id: 16,
            name: '班主任回班',
            type: 'jinang',
            color: 'black',
            uniqueId: `card_${cardId++}`,
            desc: '除你之外，所有同学都必须打出1张记名，不出的失去1点学习币'
        });
    }

    // 17. 大扫除惩罚 - 1张
    deck.push({
        id: 17,
        name: '大扫除惩罚',
        type: 'jinang',
        color: 'black',
        uniqueId: `card_${cardId++}`,
        desc: '1V1专用：让对方弃置所有装备牌，或失去2点学习币（二选一）'
    });

    // 18. 借东西不还 - 3张
    for (let i = 0; i < 3; i++) {
        deck.push({
            id: 18,
            name: '借东西不还',
            type: 'jinang',
            color: 'black',
            uniqueId: `card_${cardId++}`,
            desc: '选择距离1的一名同学，从他手里拿1张牌（手牌/装备）'
        });
    }

    // 19. 全班分享小红花 - 2张
    for (let i = 0; i < 2; i++) {
        deck.push({
            id: 19,
            name: '全班分享小红花',
            type: 'jinang',
            color: 'red',
            uniqueId: `card_${cardId++}`,
            desc: '所有同学（包括你），各恢复1点学习币'
        });
    }

    // 20. 连环扣 - 4张
    for (let i = 0; i < 4; i++) {
        deck.push({
            id: 20,
            name: '连环扣',
            type: 'jinang',
            color: 'black',
            uniqueId: `card_${cardId++}`,
            desc: '选择1-2名同学连环，其中1人受属性伤害，其他人也受同样伤害'
        });
    }

    // 21. 反抗占课 - 2张
    for (let i = 0; i < 2; i++) {
        deck.push({
            id: 21,
            name: '反抗占课',
            type: 'jinang',
            color: 'red',
            uniqueId: `card_${cardId++}`,
            desc: '除你之外，所有同学都必须打出1张广播，不出的失去1点学习币'
        });
    }

    // 22. 发作业本 - 3张
    for (let i = 0; i < 3; i++) {
        deck.push({
            id: 22,
            name: '发作业本',
            type: 'jinang',
            color: 'red',
            uniqueId: `card_${cardId++}`,
            desc: '摸出和在场同学数量相同的牌，从你开始每人选1张拿走'
        });
    }

    // 23. 领导检查（无懈可击）- 4张
    for (let i = 0; i < 4; i++) {
        deck.push({
            id: 23,
            name: '领导检查',
            type: 'jinang',
            color: 'black',
            uniqueId: `card_${cardId++}`,
            desc: '可以抵消任意一张锦囊牌的效果'
        });
    }

    // 24. 意外奖励 - 3张
    for (let i = 0; i < 3; i++) {
        deck.push({
            id: 24,
            name: '意外奖励',
            type: 'jinang',
            color: 'red',
            uniqueId: `card_${cardId++}`,
            desc: '从牌堆摸2张牌（意外得到老师奖励）'
        });
    }

    // 25. 请老师发话 - 2张
    for (let i = 0; i < 2; i++) {
        deck.push({
            id: 25,
            name: '请老师发话',
            type: 'jinang',
            color: 'black',
            uniqueId: `card_${cardId++}`,
            desc: '指定一名同学，本回合不能打出任何牌'
        });
    }

    // 装备牌 - 保留原有装备并适配新设定
    // 26. 手工铠甲（藤甲）- 2张
    for (let i = 0; i < 2; i++) {
        deck.push({
            id: 26,
            name: '手工铠甲',
            type: 'equipment',
            color: 'black',
            uniqueId: `card_${cardId++}`,
            desc: '受到火属性伤害时+1，非火属性伤害-1'
        });
    }

    // 27. 暴走跑鞋（赤兔）- 2张
    for (let i = 0; i < 2; i++) {
        deck.push({
            id: 27,
            name: '暴走跑鞋',
            type: 'equipment',
            color: 'red',
            uniqueId: `card_${cardId++}`,
            desc: '攻击距离+1'
        });
    }

    // 洗牌
    return deck.sort(() => Math.random() - 0.5);
}

// 渲染卡牌信息模态框 - 适配新卡牌
function renderCardInfoModal() {
    const cardInfoContent = document.getElementById('card-info-content');
    if (!cardInfoContent) return;

    const cardInfo = `
        <h4>一、基本牌</h4>
        <ul>
            <li><strong>记名</strong>：对距离1的角色造成1点学习币伤害（被老师记名批评）</li>
            <li><strong>严重记名</strong>：雷属性，对目标造成2点学习币伤害（更严重的批评）</li>
            <li><strong>警告记名</strong>：火属性，对目标造成2点伤害，目标有手工铠甲则+1</li>
            <li><strong>广播做好事记录</strong>：抵消一次记名（用做好事抵消批评）</li>
            <li><strong>小红花</strong>：回复1点学习币；可救濒死的队友</li>
            <li><strong>满分试卷</strong>：下一张记名伤害+1；濒死时可自救恢复1点学习币</li>
        </ul>
        
        <h4>二、普通类锦囊牌</h4>
        <ul>
            <li><strong>班干部指令</strong>：指定一名同学，本回合不能使用任何记名</li>
            <li><strong>调开老师</strong>：本回合其他同学不能对你使用记名</li>
            <li><strong>没收小玩具</strong>：选择一名同学，弃置他手里1张牌</li>
            <li><strong>点燃小纸条</strong>：让一名同学展示1张牌，红色则造成1点火伤害</li>
            <li><strong>连环小恶作剧</strong>：对连环扣状态的同学各造成1点火伤害</li>
            <li><strong>借文具"报仇"</strong>：借装备后对其攻击范围内同学用1次记名</li>
            <li><strong>吵架对决</strong>：和一名同学轮流打记名，先不出的失去1点学习币</li>
            <li><strong>小组分享会</strong>：你和队友各恢复1点学习币，各摸1张牌</li>
            <li><strong>团结一心</strong>：本回合你和队友的记名伤害+1</li>
            <li><strong>班主任回班</strong>：除你外所有同学必须打记名，不出的扣1学习币</li>
            <li><strong>大扫除惩罚</strong>：1V1专用，对方弃装备或扣2学习币（二选一）</li>
            <li><strong>借东西不还</strong>：拿距离1同学的1张牌（手牌/装备）</li>
            <li><strong>全班分享小红花</strong>：所有同学各恢复1点学习币</li>
            <li><strong>连环扣</strong>：连环1-2名同学，属性伤害会传递</li>
            <li><strong>反抗占课</strong>：除你外所有同学必须打广播，不出的扣1学习币</li>
            <li><strong>发作业本</strong>：摸对应人数牌，每人选1张拿走</li>
            <li><strong>领导检查</strong>：抵消任意一张锦囊牌效果</li>
            <li><strong>意外奖励</strong>：摸2张牌（意外得到老师奖励）</li>
            <li><strong>请老师发话</strong>：指定同学本回合不能打任何牌</li>
        </ul>
        
        <h4>三、装备牌</h4>
        <ul>
            <li><strong>手工铠甲</strong>：火属性伤害+1，非火属性伤害-1</li>
            <li><strong>暴走跑鞋</strong>：攻击距离+1</li>
        </ul>
    `;

    cardInfoContent.innerHTML = cardInfo;
}

window.createCardDeck = createCardDeck;
window.renderCardInfoModal = renderCardInfoModal;
