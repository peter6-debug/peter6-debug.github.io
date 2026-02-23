// 武将数据
const charactersList = [
    {
        id: 1,
        name: '金子博',
        health: 4,
        skills: [
            '买通：摸牌阶段可多摸1张，本回合不能出杀',
            '贿赂：可以丢弃一张牌，让一名角色本回合不能使用闪'
        ]
    },
    {
        id: 2,
        name: '郝端端',
        health: 3,
        skills: [
            '美颜：任意牌可当闪使用',
            '魅力：受到杀的伤害时，可以让来源弃一张牌'
        ]
    },
    {
        id: 3,
        name: '翟天佑',
        health: 3,
        skills: [
            '幸运：濒死时可重掷判定牌',
            '天命：每回合限一次，可以弃两张牌摸三张牌'
        ]
    },
    {
        id: 4,
        name: '贤梓轶',
        health: 4,
        skills: [
            '不良传：对郝端端造成1点伤害',
            '出众：攻击距离-1',
            '帅气：每回合可以多使用一张杀'
        ]
    },
    {
        id: 5,
        name: '孙一凡',
        health: 3,
        skills: [
            '先知：减少1学习币交换手牌',
            '预判：可以查看牌堆顶的三张牌，选择一张加入手牌'
        ]
    },
    {
        id: 6,
        name: '宋浩宇',
        health: 4,
        skills: [
            '辽阔：攻击范围+1',
            '豁达：受到伤害时，可以摸一张牌'
        ]
    },
    {
        id: 7,
        name: '李若曦',
        health: 3,
        skills: [
            '晨曦：血量不满时多摸1张牌',
            '温柔：可以将桃交给其他角色并回复1点体力'
        ]
    },
    {
        id: 8,
        name: '张淑雅',
        health: 3,
        skills: [
            '杀免疫：不受杀的伤害',
            '守护：可以替其他角色承受杀的伤害'
        ]
    },
    {
        id: 9,
        name: '张巽凯',
        health: 4,
        skills: [
            '反伤：有闪时反伤1点伤害',
            '杀免疫：不受杀的伤害',
            '霸气：出牌阶段可以弃一张牌，令一名角色本回合不能出牌'
        ]
    },
    {
        id: 10,
        name: '吕穆若',
        health: 2,
        skills: [
            '寡言：不能成为锦囊目标',
            '体弱多病：酒可当桃使用',
            '聪慧：摸牌阶段可以少摸一张牌，然后弃置一名角色的一张牌'
        ]
    }
];

// 获取武将信息
function getCharacterById(id) {
    return charactersList.find(char => char.id === id) || charactersList[0];
}

// 渲染武将选择界面
function renderCharacterSelection() {
    const characterList = document.getElementById('character-list');
    if (!characterList) return;

    characterList.innerHTML = '';

    charactersList.forEach(character => {
        const characterItem = document.createElement('div');
        characterItem.className = 'character-item';
        characterItem.dataset.characterId = character.id;
        characterItem.innerHTML = `
            <strong>${character.name}</strong>
            <p>学习币：${character.health}</p>
            <p>${character.skills.join('<br>')}</p>
        `;

        // 点击选择武将
        characterItem.addEventListener('click', function() {
            document.querySelectorAll('.character-item').forEach(item => {
                item.classList.remove('selected');
            });
            this.classList.add('selected');
            window.selectedCharacterId = parseInt(this.dataset.characterId);
        });

        characterList.appendChild(characterItem);
    });

    // 默认选择第一个武将
    const firstCharacter = document.querySelector('.character-item');
    if (firstCharacter) {
        firstCharacter.click();
    }
}

window.charactersList = charactersList;
window.getCharacterById = getCharacterById;
window.renderCharacterSelection = renderCharacterSelection;
