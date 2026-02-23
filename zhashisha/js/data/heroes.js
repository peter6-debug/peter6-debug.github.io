// 所有武将配置（完整46个，含诈尸）
const HEROES = [
    // 特殊武将：诈尸
    {
        id: "zha-shi",
        name: "诈尸",
        title: "特殊武将",
        hp: 5,
        skills: [
            { name: "回炉", desc: "限定技，当你进入濒死状态时，你可以恢复两点体力，然后摸三张牌" },
            { name: "突袭", desc: "出牌阶段限一次，你可以弃置一张手牌，令一名角色展示其全部手牌，你获得所有与弃置牌同花色的手牌" },
            { name: "不灭", desc: "当你死亡时，你选择一名其他角色，直到其下个回合开始，其不能使用或打出手牌" }
        ]
    },

    // 1. 金子博
    {
        id: "jin-zi-bo",
        name: "金子博",
        title: "子博姐姐",
        hp: 4,
        skills: [
            { name: "买通", desc: "摸牌阶段，你可以多摸一张牌，但本回合你不能使用“记名”直至你回合结束" },
            { name: "别说话", desc: "出牌阶段，你可以失去一点体力，摸两张牌" }
        ]
    },

    // 2. 黄嘉铭
    {
        id: "huang-jia-ming",
        name: "黄嘉铭",
        title: "科学甜菜",
        hp: 3,
        skills: [
            { name: "变异", desc: "当你受到伤害时，你可以声明一种颜色，然后进行一次判定，如果判定结果与声明颜色相同，伤害来源代替你成为伤害的目标" },
            { name: "数学", desc: "你可以将红色牌当满分试卷使用" }
        ]
    },

    // 3. 孙一凡
    {
        id: "sun-yi-fan",
        name: "孙一凡",
        title: "英语课代表",
        hp: 4,
        skills: [
            { name: "先知", desc: "出牌阶段限一次，你可以失去一点体力，然后与一名其他角色交换手牌" }
        ]
    },

    // 4. 宋浩宇
    {
        id: "song-hao-yu",
        name: "宋浩宇",
        title: "辽阔",
        hp: 4,
        skills: [
            { name: "辽阔", desc: "你计算其他角色的距离始终-1" },
            { name: "挑衅", desc: "出牌阶段限一次，你选择一名其他角色，由其开始，轮流打出记名，首先不出记名的一方受到对方造成的一点伤害" }
        ]
    },

    // 5. 翟天佑
    {
        id: "zhai-tian-you",
        name: "翟天佑",
        title: "幸运努力者",
        hp: 4,
        skills: [
            { name: "幸运", desc: "当一张判定牌生效前，你可以重新进行一次判定，每牌限一次" }
        ]
    },

    // 6. 谭钦泽
    {
        id: "tan-qin-ze",
        name: "谭钦泽",
        title: "致死负伤",
        hp: 4,
        skills: [
            { name: "滋润", desc: "出牌阶段限一次，你可以令一名其他角色交给你一张牌，然后回复1点体力" }
        ]
    },

    // 7. 张淑雅
    {
        id: "zhang-shu-ya",
        name: "张淑雅",
        title: "文静小淑女",
        hp: 4,
        skills: [
            { name: "文静", desc: "锁定技，所有锦囊牌对你无效" }
        ]
    },

    // 8. 张巽凯
    {
        id: "zhang-xun-kai",
        name: "张巽凯",
        title: "迅捷如风",
        hp: 4,
        skills: [
            { name: "迅捷", desc: "摸牌阶段回合开始时，你可以少摸X张牌，若如此做，你视为对一名其他角色使用X张无次数距离限制的记名。其不可以使用广播响应" }
        ]
    },

    // 9. 马曦茗
    {
        id: "ma-xi-ming",
        name: "马曦茗",
        title: "无称号",
        hp: 3,
        skills: [
            { name: "反伤", desc: "当你受到伤害时，若你没有广播，你防止此伤害，改为减少一点体力上限" },
            { name: "愤怒", desc: "你可以将红色牌当记名使用或打出" }
        ]
    },

    // 10. 于耀茜
    {
        id: "yu-yao-qian",
        name: "于耀茜",
        title: "黑马",
        hp: 3,
        skills: [
            { name: "醒脑", desc: "出牌阶段限一次，你可以令一名角色下一次摸牌阶段开始时多摸一张牌" }
        ]
    },

    // 11. 刘之畦
    {
        id: "liu-zhi-qi",
        name: "刘之畦",
        title: "人设保持者",
        hp: 4,
        skills: [
            { name: "耕耘", desc: "结束阶段限一次，你可以弃置一张牌，然后摸两张牌" }
        ]
    },

    // 12. 杨凯博
    {
        id: "yang-kai-bo",
        name: "杨凯博",
        title: "胖胖嘟嘟小勇士",
        hp: 6,
        skills: [
            { name: "胜负", desc: "出牌阶段限一次，你可以与其他角色拼点，若你赢，你对其造成1点伤害，若你没赢，则你的下一个回合开始时，你跳过之" }
        ]
    },

    // 13. 刁子涵
    {
        id: "diao-zi-han",
        name: "刁子涵",
        title: "古怪小精灵",
        hp: 3,
        skills: [
            { name: "古怪", desc: "当你成为“记名”的目标时，你可以弃置攻击者一张牌" },
            { name: "子涵", desc: "锁定技，你计算与其他角色的距离始终+1" }
        ]
    },

    // 14. 崔崎骏
    {
        id: "cui-qi-jun",
        name: "崔崎骏",
        title: "死亡",
        hp: 3,
        skills: [
            { name: "转学", desc: "当你受到一点伤害时，你可以弃置一张牌，然后转移此伤害" }
        ]
    },

    // 15. 吕穆若
    {
        id: "lv-mu-ruo",
        name: "吕穆若",
        title: "寡言小沉稳",
        hp: 3,
        skills: [
            { name: "慷慨", desc: "出牌阶段，你可以将一张牌交给一名角色，然后你回复一点体力" },
            { name: "体弱", desc: "你可以将黑色牌当满分试卷使用" }
        ]
    },

    // 16. 丛梓童
    {
        id: "cong-zi-tong",
        name: "丛梓童",
        title: "纯真小童心",
        hp: 3,
        skills: [
            { name: "纯真", desc: "当你失去最后一张手牌时，你可以摸两张牌" },
            { name: "谦虚", desc: "锁定技，当任何锦囊牌对你造成伤害后，防止之" }
        ]
    },

    // 17. 贤梓轶
    {
        id: "xian-zi-yi",
        name: "贤梓轶",
        title: "出众作家",
        hp: 4,
        skills: [
            { name: "出众", desc: "当你计算与其他角色的距离时，始终-1" },
            { name: "不良", desc: "锁定技，当你对异性使用牌时，其不可以使用或打出手牌，直至此牌结算结束" }
        ]
    },

    // 18. 王艺凝
    {
        id: "wang-yi-ning",
        name: "王艺凝",
        title: "创想小艺术家",
        hp: 3,
        skills: [
            { name: "创想", desc: "当你使用锦囊牌时，你可以摸一张牌" },
            { name: "音乐", desc: "锁定技，你使用锦囊牌无距离限制" }
        ]
    },

    // 19. 丛芷萱
    {
        id: "cong-zhi-xuan",
        name: "丛芷萱",
        title: "大虫",
        hp: 3,
        skills: [
            { name: "解忧", desc: "出牌阶段限一次，你可以弃置所有手牌，然后摸等量的牌" },
            { name: "蛋糕", desc: "当你在回合外获得牌时，交给你牌的角色可以摸一张牌" }
        ]
    },

    // 20. 赵邦杰
    {
        id: "zhao-bang-jie",
        name: "赵邦杰",
        title: "上任班长（死班长）",
        hp: 4,
        skills: [
            { name: "旧权", desc: "其他角色使用“记名”造成伤害时后，你可弃其1张牌，令此记名无效" },
            { name: "老班威", desc: "如果攻击学习币比你少的人，伤害+1" }
        ]
    },

    // 21. 韩雪莹
    {
        id: "han-xue-ying",
        name: "韩雪莹",
        title: "冰雪小晶莹",
        hp: 3,
        skills: [
            { name: "寒澈", desc: "当你使用“广播”抵消“记名”的效果后，你可以对攻击者造成1点伤害" }
        ]
    },

    // 22. 罗祎
    {
        id: "luo-yi",
        name: "罗祎",
        title: "老师小能手",
        hp: 4,
        skills: [
            { name: "举报", desc: "锁定技，当你使用“记名”时，你可以令目标角色本回合不能使用“广播”；若目标血量大于或等于你，此伤害+1" }
        ]
    },

    // 23. 肖奕含
    {
        id: "xiao-yi-han",
        name: "肖奕含",
        title: "艺术家",
        hp: 3,
        skills: [
            { name: "创作", desc: "当你受到伤害时，你可以弃置3张牌，防止之，然后摸两张牌" },
            { name: "英姿", desc: "锁定技，你不能成为任何异性角色使用的黑色牌的目标" }
        ]
    },

    // 24. 姚泓宇
    {
        id: "yao-hong-yu",
        name: "姚泓宇",
        title: "神笔马良",
        hp: 3,
        skills: [
            { name: "妙笔", desc: "出牌阶段限一次，你可以将一张黑色手牌当任意一张基本牌使用" },
            { name: "生花", desc: "当你于回合外使用或打出牌时，你可以摸一张牌" }
        ]
    },

    // 25. 邵欣然
    {
        id: "shao-xin-ran",
        name: "邵欣然",
        title: "欣然小喜乐",
        hp: 4,
        skills: [
            { name: "喜颜", desc: "当你回复一点体力时，你可以令一名其他角色摸一张牌" }
        ]
    },

    // 26. 冯筱迪
    {
        id: "feng-xiao-di",
        name: "冯筱迪",
        title: "外八战神",
        hp: 4,
        skills: [
            { name: "外八", desc: "出牌阶段限一次，你可以弃置全部手牌，然后指定一名角色，直至该角色下一个回合开始时，其受到的伤害+1" }
        ]
    },

    // 27. 熊羽唯
    {
        id: "xiong-yu-wei",
        name: "熊羽唯",
        title: "霸气小王者",
        hp: 3,
        skills: [
            { name: "霸气", desc: "锁定技，当你体力值为1时，你造成的伤害均+1" }
        ]
    },

    // 28. 袁明伟
    {
        id: "yuan-ming-wei",
        name: "袁明伟",
        title: "公正小君子",
        hp: 4,
        skills: [
            { name: "正大", desc: "当你使用“记名”时，若对方或你一方没有手牌，此“记名”造成的伤害+1" }
        ]
    },

    // 29. 赵翰飞
    {
        id: "zhao-han-fei",
        name: "赵翰飞",
        title: "小书生",
        hp: 4,
        skills: [
            { name: "书写", desc: "你可以将一张“广播”当“记名”，记名当广播使用或打出" }
        ]
    },

    // 30. 杨乔雅
    {
        id: "yang-qiao-ya",
        name: "杨乔雅",
        title: "优雅小佳人",
        hp: 3,
        skills: [
            { name: "魅力", desc: "出牌阶段限一次，你可以令一名角色交给你一张牌，然后你交给其一张牌" },
            { name: "滑冰", desc: "你使用任何牌均无距离限制" }
        ]
    },

    // 31. 魏天晰
    {
        id: "wei-tian-xi",
        name: "魏天晰",
        title: "洞察小智者",
        hp: 3,
        skills: [
            { name: "洞察", desc: "当一名角色的准备阶段开始时，你可以观看牌堆顶的2张牌，然后将其以任意顺序放回牌堆顶或牌堆底；若该角色为你，则改为观看三张牌" }
        ]
    },

    // 32. 徐佳慧
    {
        id: "xu-jia-hui",
        name: "徐佳慧",
        title: "现任班长",
        hp: 4,
        skills: [
            { name: "包容", desc: "当一名角色受到伤害后，你可以弃置一张牌，防止此伤害" },
            { name: "秉公", desc: "结束阶段限一次，你可以让体力最多的其他角色交给你1牌" }
        ]
    },

    // 33. 李若曦
    {
        id: "li-ruo-xi",
        name: "李若曦",
        title: "晨曦小暖阳",
        hp: 3,
        skills: [
            { name: "晨曦", desc: "摸牌阶段，若你体力值不满，你可以多摸一张牌" }
        ]
    },

    // 34. 郝端端
    {
        id: "hao-duan-duan",
        name: "郝端端",
        title: "守规小标兵",
        hp: 3,
        skills: [
            { name: "守规", desc: "锁定技，你不会成为延时锦囊牌的目标；你的判定牌始终为红色" },
            { name: "美颜", desc: "你可以将任意一张牌当作广播使用或打出" }
        ]
    },

    // 35. 凌象乾
    {
        id: "ling-xiang-qian",
        name: "凌象乾",
        title: "田径面瘫",
        hp: 3,
        skills: [
            { name: "高冷", desc: "锁定技，你回合第一张“记名”无距离限制，且不可被广播响应" },
            { name: "速度", desc: "当你受到伤害后，可看牌堆顶3张牌，任意放回牌堆顶或牌堆底" }
        ]
    },

    // 36. 李诗雨
    {
        id: "li-shi-yu",
        name: "李诗雨",
        title: "道法课代表",
        hp: 4,
        skills: [
            { name: "诗意", desc: "摸牌阶段结束时，你进行一次判定，若判定结果点数不为K，则你对你选择的一名角色造成一点伤害；若为K，则你受到一点无来源伤害" },
            { name: "守法", desc: "当你受到一点伤害后，你可以令一名角色摸牌至体力上限" }
        ]
    },

    // 37. 韩欣蕊
    {
        id: "han-xin-rui",
        name: "韩欣蕊",
        title: "绽放小花朵",
        hp: 3,
        skills: [
            { name: "绽放", desc: "你可以将两张手牌当一张“记名”使用，此“记名”造成的伤害+1" }
        ]
    },

    // 38. 董轶鑫
    {
        id: "dong-yi-xin",
        name: "董轶鑫",
        title: "聚金小能手",
        hp: 5,
        skills: [
            { name: "聚金", desc: "锁定技，摸牌阶段，你少摸一张牌" }
        ]
    },

    // 39. 张歆杨
    {
        id: "zhang-xin-yang",
        name: "张歆杨",
        title: "向荣暖阳",
        hp: 4,
        skills: [
            { name: "志阳", desc: "锁定技，你不可以成为记名的目标" }
        ]
    },

    // 40. 朱星睿
    {
        id: "zhu-xing-rui",
        name: "朱星睿",
        title: "小智者",
        hp: 4,
        skills: [
            { name: "星点", desc: "当你使用“记名”时，你可以进行一次判定，若为红色，此“记名”造成的伤害+1" }
        ]
    },

    // 41. 解雨欣
    {
        id: "xie-yu-xin",
        name: "解雨欣",
        title: "书虫",
        hp: 3,
        skills: [
            { name: "大爱", desc: "当一名角色处于濒死状态时，你可以弃置一张基本牌，令其回复1点体力" },
            { name: "雨欣", desc: "若你没有相应牌，你可以令一名异性角色回复一点体力并摸一张牌" }
        ]
    },

    // 42. 夏聆语
    {
        id: "xia-ling-yu",
        name: "夏聆语",
        title: "善听小读者",
        hp: 3,
        skills: [
            { name: "善听", desc: "当其他角色使用锦囊牌时，你可以摸一张牌" }
        ]
    },

    // 43. 刘哲轩
    {
        id: "liu-zhe-xuan",
        name: "刘哲轩",
        title: "辩证思想家",
        hp: 4,
        skills: [
            { name: "辩证", desc: "你可以将两张“记名”当一张“广播”使用；也可以将两张“广播”当一张“记名”使用" },
            { name: "方圆", desc: "摸牌阶段，你可以多摸一张牌，你的手牌上限等于你的体力上限" }
        ]
    },

    // 44. 张浩楠
    {
        id: "zhang-hao-nan",
        name: "张浩楠",
        title: "坚韧勇士",
        hp: 4,
        skills: [
            { name: "坚韧", desc: "限定技，锁定技，当你受到伤害时，若此伤害会使你进入濒死状态，防止此伤害，然后将体力回复至体力上限，并摸三张牌" }
        ]
    },

    // 45. 张子轩
    {
        id: "zhang-zi-xuan",
        name: "张子轩",
        title: "飘逸少年",
        hp: 4,
        skills: [
            { name: "飘逸", desc: "你可以将一张锦囊牌当“满分试卷”使用或打出" }
        ]
    }
];

// 工具函数：根据ID查找武将
function getHeroById(heroId) {
    return HEROES.find(hero => hero.id === heroId) || null;
}

// 工具函数：随机抽取N个不重复的武将（排除已选ID）
function getRandomHeroes(count = 5, excludedIds = []) {
    const availableHeroes = HEROES.filter(hero => !excludedIds.includes(hero.id));
    // 洗牌算法
    const shuffled = [...availableHeroes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
