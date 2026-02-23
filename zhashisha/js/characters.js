// 武将数据 - 完整45个武将（适配小学生设定）
const charactersList = [
    {
        id: 0,
        name: '诈尸',
        title: '特殊武将',
        health: 5,
        skills: [
            '【回炉】限定技，濒死时恢复2点体力，摸3张牌',
            '【突袭】出牌阶段限一次，弃1张手牌，令一名角色展示全部手牌，获得同花色手牌',
            '【不灭】死亡时，选一名角色，直至其下个回合，不能使用/打出手牌'
        ]
    },
    {
        id: 1,
        name: '金子博',
        title: '子博姐姐',
        health: 4,
        skills: [
            '【买通】摸牌阶段可多摸1张牌，本回合不能使用"记名"直至回合结束',
            '【别说话】出牌阶段，可失去1点体力，摸2张牌'
        ]
    },
    {
        id: 2,
        name: '黄嘉铭',
        title: '科学甜菜',
        health: 3,
        skills: [
            '【变异】受到伤害时，声明一种颜色并判定，颜色相同则伤害来源代替你受伤害',
            '【数学】可将红色牌当满分试卷使用'
        ]
    },
    {
        id: 3,
        name: '孙一凡',
        title: '英语课代表',
        health: 4,
        skills: [
            '【先知】出牌阶段限一次，失去1点体力，与一名角色交换手牌'
        ]
    },
    {
        id: 4,
        name: '宋浩宇',
        title: '辽阔',
        health: 4,
        skills: [
            '【辽阔】计算其他角色的距离始终-1',
            '【挑衅】出牌阶段限一次，选一名角色，轮流打记名，先不出的受1点伤害'
        ]
    },
    {
        id: 5,
        name: '翟天佑',
        title: '幸运努力者',
        health: 4,
        skills: [
            '【幸运】判定牌生效前，可重新判定，每牌限一次'
        ]
    },
    {
        id: 6,
        name: '谭钦泽',
        title: '致死负伤',
        health: 4,
        skills: [
            '【滋润】出牌阶段限一次，令一名角色交给你1张牌，你回复1点体力'
        ]
    },
    {
        id: 7,
        name: '张淑雅',
        title: '文静小淑女',
        health: 4,
        skills: [
            '【文静】锁定技，所有锦囊牌对你无效'
        ]
    },
    {
        id: 8,
        name: '张巽凯',
        title: '迅捷如风',
        health: 4,
        skills: [
            '摸牌阶段开始时，可少摸X张牌，视为对一名角色使用X张无次数/距离限制的记名，且不可用广播响应'
        ]
    },
    {
        id: 9,
        name: '马曦茗',
        title: '反伤斗士',
        health: 3,
        skills: [
            '【反伤】受到伤害时，若无广播，防止此伤害，改为减少1点体力上限',
            '【愤怒】可将红色牌当记名使用/打出'
        ]
    },
    {
        id: 10,
        name: '于耀茜',
        title: '黑马',
        health: 3,
        skills: [
            '【醒脑】出牌阶段限一次，令一名角色下一次摸牌阶段多摸1张牌'
        ]
    },
    {
        id: 11,
        name: '刘之畦',
        title: '人设保持者',
        health: 4,
        skills: [
            '【耕耘】结束阶段限一次，弃1张牌，摸2张牌'
        ]
    },
    {
        id: 12,
        name: '杨凯博',
        title: '胖胖嘟嘟小勇士',
        health: 6,
        skills: [
            '【胜负】出牌阶段限一次，与其他角色拼点，赢则造成1点伤害，输则下回合跳过'
        ]
    },
    {
        id: 13,
        name: '刁子涵',
        title: '古怪小精灵',
        health: 3,
        skills: [
            '【古怪】成为"记名"目标时，可弃置攻击者1张牌',
            '【子涵】锁定技，计算与其他角色的距离始终+1'
        ]
    },
    {
        id: 14,
        name: '崔崎骏',
        title: '死亡',
        health: 3,
        skills: [
            '【转学】受到1点伤害时，可弃1张牌，转移此伤害'
        ]
    },
    {
        id: 15,
        name: '吕穆若',
        title: '寡言小沉稳',
        health: 3,
        skills: [
            '【慷慨】出牌阶段，可将1张牌交给一名角色，回复1点体力',
            '【体弱】可将黑色牌当满分试卷使用'
        ]
    },
    {
        id: 16,
        name: '丛梓童',
        title: '纯真小童心',
        health: 3,
        skills: [
            '【纯真】失去最后一张手牌时，可摸2张牌',
            '【谦虚】锁定技，锦囊牌对你造成的伤害都防止'
        ]
    },
    {
        id: 17,
        name: '贤梓轶',
        title: '出众作家',
        health: 4,
        skills: [
            '【出众】计算与其他角色的距离始终-1',
            '【不良】锁定技，对异性使用牌时，其不可使用/打出手牌直至结算结束'
        ]
    },
    {
        id: 18,
        name: '王艺凝',
        title: '创想小艺术家',
        health: 3,
        skills: [
            '【创想】使用锦囊牌时，可摸1张牌',
            '【音乐】锁定技，使用锦囊牌无距离限制'
        ]
    },
    {
        id: 19,
        name: '丛芷萱',
        title: '大虫',
        health: 3,
        skills: [
            '【解忧】出牌阶段限一次，弃置所有手牌，摸等量的牌',
            '【蛋糕】回合外获得牌时，给你牌的角色可摸1张牌'
        ]
    },
    {
        id: 20,
        name: '赵邦杰',
        title: '上任班长（死班长）',
        health: 5,
        skills: [
            '【旧权】其他角色用"记名"造成伤害后，可弃其1张牌，令此记名无效',
            '【老班威】攻击学习币比你少的人，伤害+1'
        ]
    },
    {
        id: 21,
        name: '韩雪莹',
        title: '冰雪小晶莹',
        health: 3,
        skills: [
            '【寒澈】用"广播"抵消"记名"后，可对攻击者造成1点伤害'
        ]
    },
    {
        id: 22,
        name: '罗祎',
        title: '老师小能手',
        health: 4,
        skills: [
            '【举报】锁定技，使用"记名"时，可令目标本回合不能用"广播"；目标血量≥你则伤害+1'
        ]
    },
    {
        id: 23,
        name: '肖奕含',
        title: '艺术家',
        health: 3,
        skills: [
            '【创作】受到伤害时，可弃3张牌防止之，然后摸2张牌',
            '【英姿】锁定技，不会成为异性角色使用的黑色牌的目标'
        ]
    },
    {
        id: 24,
        name: '姚泓宇',
        title: '神笔马良',
        health: 3,
        skills: [
            '【妙笔】出牌阶段限一次，可将黑色手牌当任意基本牌使用',
            '【生花】回合外使用/打出牌时，可摸1张牌'
        ]
    },
    {
        id: 25,
        name: '邵欣然',
        title: '欣然小喜乐',
        health: 4,
        skills: [
            '【喜颜】回复1点体力时，可令一名角色摸1张牌'
        ]
    },
    {
        id: 26,
        name: '冯筱迪',
        title: '外八战神',
        health: 4,
        skills: [
            '【外八】出牌阶段限一次，弃置全部手牌，指定一名角色，其受到的伤害+1直至下个回合'
        ]
    },
    {
        id: 27,
        name: '熊羽唯',
        title: '霸气小王者',
        health: 3,
        skills: [
            '【霸气】锁定技，体力值为1时，造成的伤害均+1'
        ]
    },
    {
        id: 28,
        name: '袁明伟',
        title: '公正小君子',
        health: 4,
        skills: [
            '【正大】使用"记名"时，若你或对方无手牌，此记名伤害+1'
        ]
    },
    {
        id: 29,
        name: '赵翰飞',
        title: '小书生',
        health: 4,
        skills: [
            '【书写】可将"广播"当"记名"、"记名"当"广播"使用/打出'
        ]
    },
    {
        id: 30,
        name: '杨乔雅',
        title: '优雅小佳人',
        health: 3,
        skills: [
            '【魅力】出牌阶段限一次，令一名角色交给你1张牌，你再交给其1张牌',
            '【滑冰】使用任何牌均无距离限制'
        ]
    },
    {
        id: 31,
        name: '魏天晰',
        title: '洞察小智者',
        health: 3,
        skills: [
            '【洞察】一名角色准备阶段，可观看牌堆顶2张牌，任意顺序放回；若为自己则看3张'
        ]
    },
    {
        id: 32,
        name: '徐佳慧',
        title: '现任班长',
        health: 4,
        skills: [
            '【包容】一名角色受到伤害后，可弃1张牌防止此伤害',
            '【秉公】结束阶段限一次，让体力最多的其他角色交给你1张牌'
        ]
    },
    {
        id: 33,
        name: '李若曦',
        title: '晨曦小暖阳',
        health: 3,
        skills: [
            '【晨曦】摸牌阶段，若体力不满，可多摸1张牌'
        ]
    },
    {
        id: 34,
        name: '郝端端',
        title: '守规小标兵',
        health: 3,
        skills: [
            '【守规】锁定技，不会成为延时锦囊目标；判定牌始终为红色',
            '【美颜】可将任意牌当广播使用/打出'
        ]
    },
    {
        id: 35,
        name: '凌象乾',
        title: '田径面瘫',
        health: 3,
        skills: [
            '【高冷】锁定技，回合第一张"记名"无距离限制，且不可被广播响应',
            '【速度】受到伤害后，可看牌堆顶3张牌，任意放回牌堆顶/底'
        ]
    },
    {
        id: 36,
        name: '李诗雨',
        title: '道法课代表',
        health: 4,
        skills: [
            '【诗意】摸牌阶段结束时判定，点数非K则对一名角色造成1点伤害；为K则自己受1点无来源伤害',
            '【守法】受到1点伤害后，可令一名角色摸牌至体力上限'
        ]
    },
    {
        id: 37,
        name: '韩欣蕊',
        title: '绽放小花朵',
        health: 3,
        skills: [
            '【绽放】可将两张手牌当一张"记名"使用，此记名伤害+1'
        ]
    },
    {
        id: 38,
        name: '董轶鑫',
        title: '聚金小能手',
        health: 5,
        skills: [
            '【聚金】锁定技，摸牌阶段少摸1张牌'
        ]
    },
    {
        id: 39,
        name: '张歆杨',
        title: '向荣暖阳',
        health: 4,
        skills: [
            '【志阳】锁定技，不会成为记名的目标'
        ]
    },
    {
        id: 40,
        name: '朱星睿',
        title: '小智者',
        health: 4,
        skills: [
            '【星点】使用"记名"时，可判定，红色则伤害+1'
        ]
    },
    {
        id: 41,
        name: '解雨欣',
        title: '书虫',
        health: 3,
        skills: [
            '【大爱】一名角色濒死时，可弃1张基本牌，令其恢复1点体力',
            '【雨欣】若无相应牌，可令一名异性角色回复1点体力并摸1张牌'
        ]
    },
    {
        id: 42,
        name: '夏聆语',
        title: '善听小读者',
        health: 3,
        skills: [
            '【善听】其他角色使用锦囊牌时，可摸1张牌'
        ]
    },
    {
        id: 43,
        name: '刘哲轩',
        title: '辩证思想家',
        health: 4,
        skills: [
            '【辩证】可将两张"记名"当一张"广播"；或两张"广播"当一张"记名"使用',
            '【方圆】摸牌阶段可多摸1张牌，手牌上限等于体力上限'
        ]
    },
    {
        id: 44,
        name: '张浩楠',
        title: '坚韧勇士',
        health: 4,
        skills: [
            '【坚韧】限定技，锁定技，受到濒死伤害时防止之，恢复至体力上限并摸3张牌'
        ]
    },
    {
        id: 45,
        name: '张子轩',
        title: '飘逸少年',
        health: 4,
        skills: [
            '【飘逸】可将锦囊牌当"满分试卷"使用/打出'
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
            <strong>${character.name}</strong> <small>(${character.title || ''})</small>
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
