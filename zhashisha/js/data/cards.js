// 卡牌类型：BASIC(基本牌)、TRICK(锦囊)、EQUIP(装备)
const CARDS = {
    // 一、基本牌（完整）
    BASIC: [
        { 
            id: "ji-ming", 
            name: "记名", 
            type: "normal", 
            desc: "对距离1的角色造成1点学习币伤害（被老师记名批评，扣1学习币）" 
        },
        { 
            id: "yan-zhong-ji-ming", 
            name: "严重记名", 
            type: "thunder", 
            desc: "雷属性记名，对目标造成2点学习币伤害（比普通记名更严重）" 
        },
        { 
            id: "jing-gao-ji-ming", 
            name: "警告记名", 
            type: "fire", 
            desc: "火属性记名，对目标造成2点学习币伤害，若目标有“手工铠甲（藤甲）”，伤害额外+1" 
        },
        { 
            id: "guang-bo", 
            name: "广播做好事记录", 
            desc: "抵消一次“记名”（无论普通还是严重记名），相当于用做好事抵消一次批评" 
        },
        { 
            id: "xiao-hong-hua", 
            name: "小红花", 
            desc: "恢复1点学习币；若队友学习币为0（即将“出局”），可用来救队友，恢复1点学习币" 
        },
        { 
            id: "man-fen-shi-juan", 
            name: "满分试卷", 
            desc: "本回合下一张“记名”伤害+1（普通记名变2点，严重/警告记名变3点）；自身学习币为0时，可自救，恢复1点学习币" 
        }
    ],

    // 二、普通类锦囊牌（完整）
    TRICK: [
        { 
            id: "ban-gan-bu-zhi-ling", 
            name: "班干部指令", 
            desc: "指定一名同学，本回合不能使用任何“记名”（相当于班干部禁止他批评别人）" 
        },
        { 
            id: "tiao-kai-lao-shi", 
            name: "调开老师", 
            desc: "本回合，所有其他同学都不能对你使用“记名”（相当于老师被调走，没人能批评你）" 
        },
        { 
            id: "mei-shou-xiao-wan-ju", 
            name: "没收小玩具", 
            desc: "选择一名同学，弃置他手里1张牌（装备牌、手牌均可，相当于没收他的小玩具）" 
        },
        { 
            id: "dian-ran-xiao-zhi-tiao", 
            name: "点燃小纸条", 
            desc: "让一名同学展示他手里1张牌，若那张牌是红色，对他造成1点火属性伤害（1点学习币）" 
        },
        { 
            id: "lian-huan-xiao-e-zuo-ju", 
            name: "连环小恶作剧", 
            desc: "对所有处于“连环扣（铁索连环）”状态的同学，各造成1点火属性伤害（1点学习币）" 
        },
        { 
            id: "jie-wen-ju-bao-chou", 
            name: "借文具“报仇”", 
            desc: "向一名有装备牌的同学借1件装备，然后可以用这件装备，对他攻击范围内的同学使用1次“记名”" 
        },
        { 
            id: "chao-jia-dui-jue", 
            name: "吵架对决", 
            desc: "和一名同学轮流打出“记名”，谁先出不出“记名”，谁就失去1点学习币（相当于吵架输了受惩罚）" 
        },
        { 
            id: "xiao-zu-fen-xiang-hui", 
            name: "小组分享会", 
            desc: "你和所有队友，各恢复1点学习币，再各摸1张牌（相当于小组分享奖励）" 
        },
        { 
            id: "tuan-jie-yi-xin", 
            name: "团结一心", 
            desc: "本回合，你和所有队友打出的“记名”，伤害都+1（相当于团结起来，批评更有“力度”）" 
        },
        { 
            id: "ban-zhu-ren-hui-ban", 
            name: "班主任回班", 
            desc: "除你之外，所有同学都必须打出1张“记名”，谁出不出，谁就失去1点学习币（相当于班主任来了，没人敢不“表态”）" 
        },
        { 
            id: "da-sao-chu-cheng-fa", 
            name: "大扫除惩罚", 
            desc: "1V1模式专用：让对方弃置所有装备牌，或者失去2点学习币，二选一" 
        },
        { 
            id: "jie-dong-xi-bu-huan", 
            name: "借东西不还", 
            desc: "选择距离1的一名同学，从他手里拿1张牌（手牌、装备牌均可，相当于借了东西不还）" 
        },
        { 
            id: "quan-ban-fen-xiang-xiao-hong-hua", 
            name: "全班分享小红花", 
            desc: "所有同学（包括你自己），各恢复1点学习币（相当于全班都得到了老师的奖励）" 
        },
        { 
            id: "lian-huan-kou", 
            name: "连环扣", 
            desc: "选择1-2名同学，将他们“连环”起来，之后只要其中1人受到属性伤害（雷、火），其他连环的人也会受到同样伤害" 
        },
        { 
            id: "fan-kang-zhan-ke", 
            name: "反抗占课", 
            desc: "除你之外，所有同学都必须打出1张“广播做好事记录（闪）”，谁出不出，谁就失去1点学习币（相当于反抗占课，没参与的受惩罚）" 
        },
        { 
            id: "fa-zuo-ye-ben", 
            name: "发作业本", 
            desc: "从牌堆摸出和在场同学数量一样多的牌，摊开后，从你开始，每人依次选1张牌拿走" 
        },
        { 
            id: "ling-dao-jian-cha", 
            name: "领导检查", 
            desc: "可以抵消任意一张锦囊牌的效果（相当于领导来了，阻止了一次“惩罚”或“活动”）" 
        },
        { 
            id: "yi-wai-jiang-li", 
            name: "意外奖励", 
            desc: "从牌堆摸2张牌（相当于意外得到老师的奖励，多拿了“道具”）" 
        },
        { 
            id: "qing-lao-shi-fa-hua", 
            name: "请老师发话", 
            desc: "指定一名同学，本回合不能打出任何牌（手牌、装备牌都不能用，相当于老师让他“安静待着”）" 
        }
    ],

    // 三、装备类卡牌（完整）
    EQUIP: {
        // 1. 武器（完整）
        WEAPON: [
            { id: "lian-fa-qian-bi", name: "连发铅笔", desc: "出牌阶段可以使用任意张“记名”" },
            { id: "tong-zhuo-hu-zhu-chi", name: "同桌互助尺", desc: "使用“记名”指定异性同学后，可让其弃1张牌，或你摸1张牌" },
            { id: "po-zhang-xiao-dao", name: "破障小刀", desc: "使用“记名”时，无视对方的防具效果" },
            { id: "chang-hua-bi", name: "长画笔", desc: "可将两张手牌当作“记名”使用" },
            { id: "jie-shi-zhi-chi", name: "结实直尺", desc: "“记名”被对方用“广播做好事记录”抵消时，可弃2张牌强制命中" },
            { id: "chang-bing-sao-zhou", name: "长柄扫帚", desc: "“记名”被抵消时，可继续使用1张“记名”" },
            { id: "si-ge-chang-chi", name: "四格长尺", desc: "使用最后1张“记名”时，可最多指定3名同学为目标" },
            { id: "yuan-she-wan-ju-gong", name: "远射玩具弓", desc: "“记名”命中后，可弃掉对方1件坐骑" },
            { id: "leng-jing-bing-bang-dao", name: "冷静冰棒刀", desc: "“记名”命中时，可不让对方掉学习币，改为弃其2张牌" },
            { id: "feng-li-xue-bi-dao", name: "锋利削笔刀", desc: "对方没有手牌时，“记名”伤害+1" },
            { id: "cai-se-ka-tong-shan", name: "彩色卡通扇", desc: "可将普通“记名”当作“警告记名（火杀）”使用" },
            { id: "dan-she-wan-ju-qiang", name: "弹射玩具枪", desc: "打出“广播做好事记录”时，可对距离3以内的同学造成1点学习币伤害" },
            { id: "xiao-zu-he-zuo-jian", name: "小组合作剑", desc: "同组所有同学的攻击距离+1" },
            { id: "san-cha-su-liao-bi", name: "三叉塑料笔", desc: "“记名”命中1名同学后，可对另1名同学造成1点学习币伤害" },
            { id: "fei-xing-ka-tong-bi", name: "飞行卡通笔", desc: "“记名”命中后，可获得对方1张牌" },
            { id: "jing-mei-ka-tong-dao", name: "精美卡通刀", desc: "“记名”命中后，可从牌堆摸1张牌" },
            { id: "jian-gu-su-liao-mao", name: "坚固塑料矛", desc: "使用“记名”时，对方不能用“广播做好事记录”抵消" },
            { id: "kong-long-zao-xing-chang-dao", name: "恐龙造型长刀", desc: "“记名”伤害+1，若命中手牌≥3张的同学，额外造成1点学习币伤害" },
            { id: "ka-tong-dian-zi-qin", name: "卡通电子琴", desc: "使用“记名”后，可让对方本回合不能使用锦囊牌" },
            { id: "e-mo-zao-xing-chang-ji", name: "恶魔造型长戟", desc: "“记名”命中后，可让对方弃掉所有手牌" },
            { id: "hong-se-mei-gong-dao", name: "红色美工刀", desc: "“记名”命中后，可让对方下回合不能摸牌" },
            { id: "shuang-zi-ka-tong-jian", name: "双子卡通剑", desc: "使用“记名”指定同组同学相邻的角色时，伤害+1" },
            { id: "tai-yang-zao-xing-chang-gong", name: "太阳造型长弓", desc: "“记名”可指定距离6以内的任意1名同学，命中后弃其1张装备牌" },
            { id: "da-li-ka-tong-fu", name: "大力卡通斧", desc: "“记名”被抵消时，可弃1张牌，对对方造成1点学习币伤害" },
            { id: "ju-xing-wan-ju-che", name: "巨型玩具车", desc: "“记名”命中后，可弃掉对方所有装备牌" },
            { id: "chao-da-su-liao-chang-chi", name: "超大塑料长尺", desc: "使用“记名”时，可指定2-3名同学为目标，每人造成1点学习币伤害" },
            { id: "lian-fa-wan-ju-nu", name: "连发玩具弩", desc: "出牌阶段可使用任意张“记名”，且“记名”伤害+1" },
            { id: "po-sun-su-liao-ji", name: "破损塑料戟", desc: "“记名”伤害不变，若对方有防具，可额外弃其1张手牌" },
            { id: "wu-jian-an-quan-jian", name: "无尖安全剑", desc: "“记名”命中后，可让对方弃1张牌，或自己恢复1点学习币" },
            { id: "chang-bing-wan-ju-qiang", name: "长柄玩具枪", desc: "“记名”未命中时，可再使用1张“记名”" },
            { id: "long-xing-ka-tong-jian", name: "龙形卡通剑", desc: "“记名”伤害+1，无视对方1件坐骑的效果" },
            { id: "fu-gu-wan-ju-nu", name: "复古玩具弩", desc: "“记名”可指定距离4以内的同学，命中后对方不能使用“广播做好事记录”1回合" },
            { id: "cai-se-yu-mao-shan", name: "彩色羽毛扇", desc: "可将普通“记名”当作“严重记名（雷杀）”或“警告记名（火杀）”使用" },
            { id: "su-liao-suo-lian", name: "塑料锁链", desc: "使用“记名”时，可同时将目标与另1名同学“连环”" }
        ],

        // 2. 防具（完整）
        ARMOR: [
            { id: "an-quan-xiao-bei-xin", name: "安全小背心", desc: "需要出“广播做好事记录”时，判定：红桃则视为已出“闪”" },
            { id: "ji-lv-dun-pai", name: "纪律盾牌", desc: "黑色“记名”对自己无效（不会受到伤害）" },
            { id: "shou-gong-zhi-kai-jia", name: "手工纸铠甲", desc: "普通“记名”对自己无效，但火属性“警告记名”伤害+1" },
            { id: "ruan-jia-tou-kui", name: "软甲头盔", desc: "每次受到的伤害最多为1点；失去这件防具时，恢复1点学习币" },
            { id: "fan-guang-ka-tong-jia", name: "反光卡通甲", desc: "免疫火属性“警告记名”的伤害" },
            { id: "xue-xi-mi-ji", name: "学习秘籍", desc: "受到伤害时，可从牌堆摸1张牌；同组队友可帮自己抵挡1次伤害" },
            { id: "yin-se-su-liao-jia", name: "银色塑料甲", desc: "每次受到伤害后，可从牌堆摸1张牌" },
            { id: "zhong-shi-ka-tong-pao", name: "中式卡通袍", desc: "每次受到伤害时，可让伤害来源弃1张牌" },
            { id: "qu-wei-ba-gua-pai", name: "趣味八卦牌", desc: "需要出“闪”时，判定：红色牌则视为已出“闪”，且可摸1张牌" },
            { id: "hua-bu-xiao-wai-tao", name: "花布小外套", desc: "免疫所有锦囊牌造成的学习币伤害" },
            { id: "ka-tong-yao-dai", name: "卡通腰带", desc: "手牌上限+1，且不会被对方弃掉超过1张牌/回合" },
            { id: "gao-ji-ba-gua-bei-xin", name: "高级八卦背心", desc: "需要出“闪”时，判定：任意花色均可视为已出“闪”，失败可重判1次" },
            { id: "chao-ji-ji-lv-dun", name: "超级纪律盾", desc: "黑色“记名”和黑色锦囊牌对自己均无效" },
            { id: "fang-shui-zhi-kai-jia", name: "防水纸铠甲", desc: "普通“记名”无效，且免疫雷属性“严重记名”的伤害" },
            { id: "shi-zi-zao-xing-tou-kui", name: "狮子造型头盔", desc: "受到伤害时，有一半概率（判定红色）减免1点伤害" },
            { id: "hei-se-xiao-pi-feng", name: "黑色小披风", desc: "对方不能指定自己为“记名”或锦囊牌的唯一目标" },
            { id: "dai-ci-xiao-wai-tao", name: "带刺小外套", desc: "攻击自己的同学，命中后会受到1点学习币伤害（反弹伤害）" },
            { id: "ka-tong-lian-yi-qun", name: "卡通连衣裙", desc: "异性同学对自己使用“记名”时，伤害-1；可弃掉这件防具，抵消1次伤害" },
            { id: "hei-se-fan-guang-jia", name: "黑色反光甲", desc: "免疫所有属性伤害（雷、火），且普通“记名”伤害-1" },
            { id: "su-liao-hu-xin-jing", name: "塑料护心镜", desc: "可抵消1次任意属性伤害（雷、火），抵消后弃掉这件防具" },
            { id: "zuo-wei-suo-you-quan-zheng", name: "座位所有权证", desc: "手牌上限+2，且不会被对方“借东西不还（顺手牵羊）”拿走手牌" }
        ],

        // 3. 马（完整）
        HORSE: [
            { id: "kuai-su-yun-dong-xie", name: "快速运动鞋", desc: "其他同学计算与你的距离+1（难以对你使用“记名”）" },
            { id: "qing-bian-yun-dong-xie", name: "轻便运动鞋", desc: "其他同学计算与你的距离+1，且你摸牌阶段多摸1张牌" },
            { id: "fang-hua-yun-dong-xie", name: "防滑运动鞋", desc: "其他同学计算与你的距离+1，受到伤害时可弃掉这匹马，减免1点伤害" },
            { id: "gao-dang-yun-dong-xie", name: "高档运动鞋", desc: "其他同学计算与你的距离+1，且你手牌上限+1" },
            { id: "cai-se-pao-bu-xie", name: "彩色跑步鞋", desc: "你计算与其他同学的距离-1（更容易对别人使用“记名”）" },
            { id: "fei-kuai-pao-bu-xie", name: "飞快跑步鞋", desc: "你计算与其他同学的距离-1，且“记名”未命中时可再出1张牌" },
            { id: "shan-dian-pao-bu-xie", name: "闪电跑步鞋", desc: "你计算与其他同学的距离-1，且“记名”伤害+1" },
            { id: "ji-feng-pao-bu-xie", name: "疾风跑步鞋", desc: "你计算与其他同学的距离-1，且可无视1件对方的坐骑效果" },
            { id: "jin-se-hua-ban", name: "金色滑板", desc: "其他同学计算与你的距离+2，且你不会被“连环扣（铁索连环）”" },
            { id: "ka-tong-xiao-lu-zuo-qi", name: "卡通小鹿坐骑", desc: "其他同学计算与你的距离+1，你每次摸牌可多摸1张" },
            { id: "man-su-tuo-xie", name: "慢速拖鞋", desc: "你和其他同学计算彼此的距离均不变，但你手牌上限-1" },
            { id: "chao-ji-ka-tong-xiao-che", name: "超级卡通校车", desc: "你和同组所有同学，计算距离时均±1（可攻可守）" }
        ],

        // 4. 宝物（完整）
        TREASURE: [
            { id: "ka-tong-shu-bao", name: "卡通书包", desc: "可将多余的手牌放在书包里，回合结束时可摸回这些牌（最多放3张）" },
            { id: "ban-zhang-hui-zhang", name: "班长徽章", desc: "出牌阶段可多使用1张“记名”，且同组同学手牌上限+1" },
            { id: "fa-guang-wan-ju-qiu", name: "发光玩具球", desc: "手牌上限+1，摸牌阶段可多摸1张牌" },
            { id: "ka-tong-huang-guan", name: "卡通皇冠", desc: "每次使用锦囊牌后，可摸1张牌；但受到的伤害+1" },
            { id: "ban-zhang-rang-wei-shu", name: "班长让位书", desc: "可将自己的“班长徽章（玉玺）”转给同组同学，同时双方各恢复1点学习币" },
            { id: "ka-tong-fa-shi", name: "卡通发饰", desc: "女性同学使用时，手牌上限+2；男性同学使用时，“记名”伤害+1" },
            { id: "jin-se-ka-tong-tou-guan", name: "金色卡通头冠", desc: "摸牌阶段多摸1张牌，且不会被对方“没收小玩具（过河拆桥）”" },
            { id: "ka-tong-li-pin-he", name: "卡通礼品盒", desc: "可存放1张牌，需要时再拿出来使用（最多存放1张）" },
            { id: "te-ji-ban-zhang-hui-zhang", name: "特级班长徽章", desc: "出牌阶段可使用任意张“记名”，且同组所有同学“记名”伤害+1" },
            { id: "ka-tong-xiao-niao-bai-jian", name: "卡通小鸟摆件", desc: "同组同学弃牌时，可选择1张牌交给你" },
            { id: "qu-wei-mi-gong-tu", name: "趣味迷宫图", desc: "每次判定前，可更换1张判定牌（改变判定结果）" },
            { id: "shen-mi-ka-pian", name: "神秘卡片", desc: "可将1张手牌当作任意1张基本牌使用（每天最多使用2次）" },
            { id: "ka-tong-xiao-tui-che", name: "卡通小推车", desc: "同组所有同学，回合结束时可各恢复1点学习币" },
            { id: "dai-ci-xiao-tui-che", name: "带刺小推车", desc: "对方同学计算与你的距离+1，且攻击你时会受到1点学习币伤害" },
            { id: "xuan-zhuan-wan-ju-che", name: "旋转玩具车", desc: "你计算与其他同学的距离-1，且每次“记名”命中后可摸1张牌" },
            { id: "xue-xi-xiao-shou-ce", name: "学习小手册", desc: "同组同学使用锦囊牌时，可额外抵消1次对方的“领导检查（无懈可击）”" }
        ]
    }
};

// 合并所有卡牌为一维数组（方便随机抽取/查找）
const ALL_CARDS = [
    ...CARDS.BASIC,
    ...CARDS.TRICK,
    ...CARDS.EQUIP.WEAPON,
    ...CARDS.EQUIP.ARMOR,
    ...CARDS.EQUIP.HORSE,
    ...CARDS.EQUIP.TREASURE
];

// 工具函数：根据ID查找卡牌
function getCardById(cardId) {
    return ALL_CARDS.find(card => card.id === cardId) || null;
}
