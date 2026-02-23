// 卡牌类型定义
function createCardDeck() {
    const deck = [];
    let cardId = 1;

    // 基本牌
    // 杀（红）- 10张
    for (let i = 0; i < 10; i++) {
        deck.push({
            id: 1,
            name: '记名（杀）',
            type: 'basic',
            color: 'red',
            uniqueId: `card_${cardId++}`
        });
    }

    // 杀（黑）- 10张
    for (let i = 0; i < 10; i++) {
        deck.push({
            id: 2,
            name: '记名（杀）',
            type: 'basic',
            color: 'black',
            uniqueId: `card_${cardId++}`
        });
    }

    // 闪（红）- 8张
    for (let i = 0; i < 8; i++) {
        deck.push({
            id: 3,
            name: '广播做好事记录（闪）',
            type: 'basic',
            color: 'red',
            uniqueId: `card_${cardId++}`
        });
    }

    // 桃（红）- 6张
    for (let i = 0; i < 6; i++) {
        deck.push({
            id: 4,
            name: '礼物（桃）',
            type: 'basic',
            color: 'red',
            uniqueId: `card_${cardId++}`
        });
    }

    // 酒（红）- 4张
    for (let i = 0; i < 4; i++) {
        deck.push({
            id: 9,
            name: '满分卷（酒）',
            type: 'basic',
            color: 'red',
            uniqueId: `card_${cardId++}`
        });
    }

    // 锦囊牌
    // 南蛮入侵（黑）- 3张
    for (let i = 0; i < 3; i++) {
        deck.push({
            id: 5,
            name: '班主任回班（南蛮入侵）',
            type: 'jinang',
            color: 'black',
            uniqueId: `card_${cardId++}`
        });
    }

    // 万箭齐发（红）- 3张
    for (let i = 0; i < 3; i++) {
        deck.push({
            id: 6,
            name: '反抗占课（万箭齐发）',
            type: 'jinang',
            color: 'red',
            uniqueId: `card_${cardId++}`
        });
    }

    // 五谷丰登（红）- 2张
    for (let i = 0; i < 2; i++) {
        deck.push({
            id: 7,
            name: '抄作业（五谷丰登）',
            type: 'jinang',
            color: 'red',
            uniqueId: `card_${cardId++}`
        });
    }

    // 无懈可击（黑）- 4张
    for (let i = 0; i < 4; i++) {
        deck.push({
            id: 8,
            name: '领导检查（无懈可击）',
            type: 'jinang',
            color: 'black',
            uniqueId: `card_${cardId++}`
        });
    }

    // 装备牌
    // 仁王盾（黑）- 2张
    for (let i = 0; i < 2; i++) {
        deck.push({
            id: 10,
            name: '减负书包（仁王盾）',
            type: 'equipment',
            color: 'black',
            uniqueId: `card_${cardId++}`
        });
    }

    // 赤兔（红）- 2张
    for (let i = 0; i < 2; i++) {
        deck.push({
            id: 11,
            name: '暴走跑鞋（赤兔）',
            type: 'equipment',
            color: 'red',
            uniqueId: `card_${cardId++}`
        });
    }

    // 洗牌
    return deck.sort(() => Math.random() - 0.5);
}

// 渲染卡牌信息模态框
function renderCardInfoModal() {
    const cardInfoContent = document.getElementById('card-info-content');
    if (!cardInfoContent) return;

    const cardInfo = `
        <h4>基本牌</h4>
        <ul>
            <li><strong>记名（杀）</strong>：对距离1的角色造成1点伤害</li>
            <li><strong>广播做好事记录（闪）</strong>：抵消一次杀</li>
            <li><strong>礼物（桃）</strong>：回复1点学习币</li>
            <li><strong>满分卷（酒）</strong>：下一张杀伤害+1</li>
        </ul>
        
        <h4>锦囊牌</h4>
        <ul>
            <li><strong>班主任回班（南蛮入侵）</strong>：除你外所有人需出杀</li>
            <li><strong>反抗占课（万箭齐发）</strong>：除你外所有人需出闪</li>
            <li><strong>抄作业（五谷丰登）</strong>：每人摸一张牌</li>
            <li><strong>领导检查（无懈可击）</strong>：抵消一张锦囊</li>
        </ul>
        
        <h4>装备牌</h4>
        <ul>
            <li><strong>减负书包（仁王盾）</strong>：黑色杀无效</li>
            <li><strong>暴走跑鞋（赤兔）</strong>：攻击距离+1</li>
        </ul>
    `;

    cardInfoContent.innerHTML = cardInfo;
}

window.createCardDeck = createCardDeck;
window.renderCardInfoModal = renderCardInfoModal;
