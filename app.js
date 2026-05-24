// --- 资源预加载与优化系统 ---
const IMAGES_TO_PRELOAD = [
    "./assets/director_office.webp",
    "./assets/game_cover.webp",
    "./assets/guide_zeng.webp",
    "./assets/report_bg.webp",
    "./assets/teacher_chen.webp",
    "./assets/teacher_li.webp",
    "./assets/teacher_wang.webp",
    "./assets/teacher_wang_cry.webp"
];

function preloadImages() {
    IMAGES_TO_PRELOAD.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

function updateAvatar(newSrc) {
    const characterImgEl = document.getElementById("character-img");
    if (!characterImgEl) return;
    
    const currentSrc = characterImgEl.getAttribute("src");
    if (currentSrc === newSrc) return;
    
    characterImgEl.style.opacity = "0";
    setTimeout(() => {
        updateAvatar(newSrc);
        characterImgEl.onload = () => {
            characterImgEl.style.opacity = "1";
        };
    }, 120);
}

// ==========================================================================
// 暖心治园 RPG v4.0 逻辑脚本 - 颜老师讲稿重构版 (五天 AM/PM 10阶段交互)
// ==========================================================================

// 1. 剧情与微游戏数据定义
const SCENARIOS = [
    {
        day: "星期一",
        period: "上午",
        speaker: "小李 (骨干教师)",
        character: "li",
        avatar: "./assets/teacher_li.webp",
        dialogue: "园长，早晨亮亮妈妈神色冷漠，不接我的打招呼。我觉得她因为上周五的事，准备在家长群发难质问我，我心里乱极了……",
        abcFlow: {
            lensText: "面对潜在的冲突，引导小李戴上哪一副心智“信念眼镜”？",
            options: [
                {
                    id: "B1",
                    title: "信念眼镜 A",
                    desc: "“亮亮妈妈故意针对我，想在家长群搞垮我的声誉，这太欺负人了！”",
                    consequence: "<b>【信念后果】</b>：小李由于深信家长在敌对，情绪被点燃。接待亮亮妈妈时神色紧绷、言辞冷淡，导致矛盾瞬间升级，亮亮妈妈当即拍桌扬言下午必在群里公开控诉。<br><span class='flow-btn'>[ 下一步：调整园长应对策略 ]</span>",
                    bonus: { listen: 0, accept: 0 }
                },
                {
                    id: "B2",
                    title: "信念眼镜 B",
                    desc: "“她是过于心疼和焦虑孩子，虽然沟通有些情绪化，但这正是消除误会的契机。”",
                    consequence: "<b>【信念后果】</b>：小李心态平复。在迎上去时主动微笑询问亮亮的情况，亮亮妈妈见状情绪也缓和了大半，答应下午等小李有空了再沟通。<br><span class='flow-btn'>[ 下一步：调整园长应对策略 ]</span>",
                    bonus: { listen: 2, accept: 2 }
                }
            ]
        },
        options: [
            {
                text: "A. 园长插手包办：“你别回复了。这事交给我，下午我找她聊，你安心带班。”",
                feedback: "【标签：大包大揽】你替她抗下了冲突，但剥夺了她面对家长质疑的专业成长机会，容易让她产生依赖。",
                scores: { listen: 3, accept: 3, empower: 1, boundary: 2, intervene: 4 }
            },
            {
                text: "B. 共同协同复盘：“听起来很委屈，咱们中午一起分析误会，再决定如何理性回复。”",
                feedback: "【标签：共情引领】极佳！先接纳小李的情绪，再共同协作复盘，既给予了专业支持，又维护了教师的主体性。",
                scores: { listen: 5, accept: 5, empower: 5, boundary: 5, intervene: 5 }
            },
            {
                text: "C. 冷漠说教命令：“立刻在群里发官方观察记录！以后自己多注意方法，别被家长揪住把柄。”",
                feedback: "【标签：冰冷说教】只顾解决危机，完全忽视了教师内心的焦虑，会让教师感到被孤立和冷落。",
                scores: { listen: 1, accept: 1, empower: 2, boundary: 5, intervene: 2 }
            }
        ]
    },
    {
        day: "星期一",
        period: "下午",
        speaker: "小李 (焦急万分)",
        character: "li",
        avatar: "./assets/teacher_li.webp",
        dialogue: "园长！下午亮亮妈妈还是在家长群发难了，质问我们为什么亮亮衣服上有泥点、是不是偏心。群里全是刷屏，我该怎么回？",
        minigame: {
            type: "temperature",
            instructions: "请调节沟通回应的温度（滑块在不同区间代表不同沟通策略）："
        },
        options: [
            {
                text: "A. 官方强硬回复（温度过低）：群内发布措辞严厉的声明，要求家长撤回言论，私下沟通。",
                feedback: "【标签：防御对立】冰冷严厉的回应在家长群里树立了高傲、拒绝沟通的形象，激化了家长的怒火并损害了家园信任。",
                scores: { listen: 1, accept: 1, empower: 2, boundary: 4, intervene: 2 }
            },
            {
                text: "B. 温和坚定回复（温度适中）：表示理解家长心情，说明会私下电联，并简单阐述园所的专业观察。",
                feedback: "【标签：专业降温】非常出色的处理！及时隔断了公开群内的情绪蔓延，同时以温暖和专业的姿态亮出态度，为私下沟通打好基础。",
                scores: { listen: 5, accept: 5, empower: 4, boundary: 5, intervene: 5 }
            },
            {
                text: "C. 卑微讨好回复（温度过高）：在群里公开道歉，承诺全面整改并严惩老师，以平息家长怒火。",
                feedback: "【标签：丧失原则】毫无底线的妥协和道歉不仅让家长觉得园所‘心虚’，更严重挫伤了当事教师小李的职业自信和忠诚度。",
                scores: { listen: 4, accept: 3, empower: 1, boundary: 1, intervene: 2 }
            }
        ]
    },
    {
        day: "星期二",
        period: "上午",
        speaker: "小王 (新入职教师)",
        character: "wang",
        avatar: "./assets/teacher_wang.webp",
        dialogue: "园长，这周四就是全园公开日了。我带完班还要填无数张纸质观察表，晚上还要熬夜做环创。我感觉自己像个打卡机器人，好累好焦虑……",
        minigame: {
            type: "maslow",
            instructions: "教师的情绪是由需求未满足引起的。请将小王的抱怨与马斯洛需求层级归纳匹配："
        },
        options: [
            {
                text: "A. 理性说教：“大家都是这么过来的，年轻人多吃点苦，效率高了就好了。”",
                feedback: "【标签：冷漠否定】忽视了隐性情绪劳动的价值，视教师的压力为矫情。这非但不能解决问题，还会加速其离职。",
                scores: { listen: 1, accept: 1, empower: 1, boundary: 5, intervene: 1 }
            },
            {
                text: "B. 关怀减负：“最近确实超负荷了。我们梳理精简表格，环创协调配班分担，保留创意核心即可。”",
                feedback: "【标签：暖心赋能】十分优秀！理解了新教师生理与安全边界层级的缺失，通过合并表格和重构协作，真正关怀人。",
                scores: { listen: 5, accept: 5, empower: 5, boundary: 5, intervene: 4 }
            },
            {
                text: "C. 纵容迎合：“太辛苦了，这周环创你别做了，表格我找人帮你填，你开心最重要！”",
                feedback: "【标签：盲目妥协】充满了同情，但滑向了无原则溺爱。随意降低园所工作标准，无法培养其真正的专业担当。",
                scores: { listen: 5, accept: 4, empower: 1, boundary: 1, intervene: 3 }
            }
        ]
    },
    {
        day: "星期二",
        period: "下午",
        speaker: "小王 (强颜欢笑)",
        character: "wang",
        avatar: "./assets/teacher_wang.webp",
        dialogue: "（小王站在门口迎接家长离园，亮亮妈妈因为周一的怨气还没消，故意挑剔亮亮鞋子穿反了，小王强颜欢笑地道歉，指关节都捏白了……）",
        minigame: {
            type: "battery",
            instructions: "小王的情绪电量极度垂危，请通过点击关怀卡片，为她充能以恢复心力："
        },
        options: [
            {
                text: "A. 给予情感抚慰：递上一杯温热的花茶，温和地说：‘刚刚委屈你了，你做得很得体。’",
                feedback: "【标签：情绪防线】绝佳的情感联结！在新教师遭受‘假笑’情绪压抑时，及时给予看见与接纳，是最佳的心理电量补充。",
                scores: { listen: 5, accept: 5, empower: 3, boundary: 4, intervene: 4 }
            },
            {
                text: "B. 介入支持：主动走上前接下家长的挑剔，让小王回办公室休息，由园长来化解危机。",
                feedback: "【标签：坚实后盾】有力支持！园长站出来遮风挡雨，不仅能有效降温家长情绪，更能给教师安全感，但在赋能方面较弱。",
                scores: { listen: 4, accept: 4, empower: 2, boundary: 3, intervene: 5 }
            },
            {
                text: "C. 忽视小情绪：事后提醒小王：‘家长有情绪很正常，我们做幼师的必须要学会忍耐和调整。’",
                feedback: "【标签：雪上加霜】冰冷的职场要求。在教师情绪几乎枯竭时进行原则说教，相当于是在其伤口上撒盐，极易促成离职。",
                scores: { listen: 1, accept: 1, empower: 1, boundary: 5, intervene: 1 }
            }
        ]
    },
    {
        day: "星期三",
        period: "上午",
        speaker: "陈老师 (资深教师)",
        character: "chen",
        avatar: "./assets/teacher_chen.webp",
        dialogue: "园长，明天公开日彩排我是总调度，但我孩子突然发高烧39.5度。我想请半天假，但彩排又这么重要……我不知道该怎么办了……",
        minigame: {
            type: "scale",
            instructions: "请左右拖动滑块，调节【人文关怀（倾听）】与【工作指标（制度）】的天平位置："
        },
        options: [
            {
                text: "A. 关怀优先：“孩子高烧太揪心了，快回去！彩排工作我亲自顶替你，你别操心了。”",
                feedback: "【标签：包揽负重】虽有人情味，但园长直接替岗打乱了日常分工，不利于中层梯队的成长与独立运作机制。",
                scores: { listen: 5, accept: 5, empower: 2, boundary: 2, intervene: 3 }
            },
            {
                text: "B. 关怀与制度平衡：“孩子要紧，快回医院。你把流程表发给副手小张，我相信她能协助推进，我也会在一旁把关。”",
                feedback: "【标签：制度共情】危机处理典范！既给足了人文温度和免责安全感，又通过小张替岗完成了梯队赋能，机制清晰运转。",
                scores: { listen: 5, accept: 5, empower: 5, boundary: 5, intervene: 5 }
            },
            {
                text: "C. 制度优先：“明天彩排全园都在看。你现在请假现场肯定乱套，能先让家人带去，你彩排完再回去吗？”",
                feedback: "【标签：唯指标论】冷冰冰地追求工作结果。用刚性制度压倒人性底线，会瞬间摧毁老教师的归属感，让团队寒心。",
                scores: { listen: 1, accept: 1, empower: 1, boundary: 5, intervene: 1 }
            }
        ]
    },
    {
        day: "星期三",
        period: "下午",
        speaker: "副手小张 (急得跳脚)",
        character: "li",
        avatar: "./assets/teacher_li.webp",
        dialogue: "园长！彩排现场乱成一锅粥了，音乐播错、路线走偏，小王完全压不住场，亮亮妈妈等几个家长也开始抱怨了，我该怎么办？",
        minigame: {
            type: "crisis",
            instructions: "彩排现场危机重重，请配置适当的支持资源以稳住防线："
        },
        options: [
            {
                text: "A. 实施全面协同保障：简化彩排、增派后勤、园长协助把关但不包办。",
                feedback: "【标签：危机共担】极佳！既精简了冗余工作降低教师焦虑，又通过增派人手建立了坚实的后盾，还保证了小张的实战历练。",
                scores: { listen: 5, accept: 5, empower: 5, boundary: 4, intervene: 5 }
            },
            {
                text: "B. 强硬要求自行克服（未采取任何支持动作）：让小张和小王自己想办法，表示‘这是对你们的考验’。",
                feedback: "【标签：冷漠推卸】在新手团队处境危急时选择‘不作为’，会导致现场彻底失控，极大摧毁新人的信心与归属感。",
                scores: { listen: 1, accept: 1, empower: 1, boundary: 5, intervene: 1 }
            },
            {
                text: "C. 园长全盘接管（仅采取部分防御或过度包办）：自己担任总指挥，直接把小张推到一边，高压接管彩排。",
                feedback: "【标签：大包大揽】虽然彩排问题解决了，但打击了小张的积极性，小张会感到自己‘被否定’，失去成长的动力。",
                scores: { listen: 3, accept: 3, empower: 2, boundary: 2, intervene: 4 }
            }
        ]
    },
    {
        day: "星期四",
        period: "上午",
        speaker: "小王 (极度虚脱)",
        character: "wang",
        avatar: "./assets/teacher_wang.webp",
        dialogue: "公开日非常成功，家长们交口称赞。但我发现小王正呆坐在空无一人的教室里，眼神空洞无光，对外界几乎没有反应……",
        minigame: {
            type: "burnout",
            instructions: "请根据小王的表现和日记判断她目前处于哪一个职业倦怠阶段："
        },
        options: [
            {
                text: "A. 实施物理阻断与休假：让小王卸下工作，给予心理舒缓指导，放假一天彻底休息。",
                feedback: "【标签：危机防御】非常及时的心理干预！识别出教师的枯竭状态并迅速物理断连，避免其精神彻底崩溃。",
                scores: { listen: 5, accept: 5, empower: 4, boundary: 4, intervene: 5 }
            },
            {
                text: "B. 心灵鸡汤与思想工作：鼓励她“这证明了你的能力，熬过这一阵就好了，加油！”",
                feedback: "【标签：有毒正能量】用励志话语来粉饰重度倦怠，不仅毫无效果，还会让教师感到被冷落和被强行要求‘坚强’。",
                scores: { listen: 2, accept: 2, empower: 2, boundary: 5, intervene: 2 }
            },
            {
                text: "C. 无视并派发新任务：叮嘱她“辛苦了，早点回家，明天记得把下周的周计划赶出来”。",
                feedback: "【标签：工作机器】忽视了倦怠的严重性，继续把教师当成运转的机器，通常会导致教师在慢时间内直接提交辞职信。",
                scores: { listen: 1, accept: 1, empower: 1, boundary: 5, intervene: 1 }
            }
        ]
    },
    {
        day: "星期四",
        period: "下午",
        speaker: "小王 (情绪崩溃)",
        character: "wang_cry",
        avatar: "./assets/teacher_wang_cry.webp",
        dialogue: "（小王独自躲在教研室，双肩微微颤抖地抽泣。看到你进门，她慌乱抹干眼泪低下头，有些不知所措……）",
        minigame: {
            type: "breath",
            instructions: "请点击下方按钮，协助处于心理危机崩溃边缘的小王进行【4-7-8 呼吸舒压】："
        },
        options: [
            {
                text: "A. 无声陪伴：“哭出来好受点。最近真的很不容易，别硬撑，有我陪着你，这里很安全。”",
                feedback: "【标签：危机守护】顶级的危机接纳！用最纯粹的陪伴传递了“我和你站在一起”，是防止情绪彻底崩溃的心理气囊。",
                scores: { listen: 5, accept: 5, empower: 4, boundary: 4, intervene: 5 }
            },
            {
                text: "B. 理性止哭：“怎么哭了？别在这哭，被其他老师看到多不好。擦干眼泪，哭是解决不了问题的。”",
                feedback: "【标签：理性压制】你的劝慰隐含对情绪流露的责备，剥夺了她正当的情绪发泄，容易在教师内心筑起更高的防御防线。",
                scores: { listen: 3, accept: 2, empower: 3, boundary: 4, intervene: 3 }
            },
            {
                text: "C. 默默避开：觉得过去会让她尴尬，轻轻带上门退出教研室，打算等她平静后单独谈工作。",
                feedback: "【标签：逃避闪躲】在最严重的心理危机时刻选择“看不见”，会让陷入深渊的员工感到极度的孤立与无助。",
                scores: { listen: 1, accept: 1, empower: 1, boundary: 5, intervene: 1 }
            }
        ]
    },
    {
        day: "星期五",
        period: "上午",
        speaker: "小李 (历练后的成长)",
        character: "li",
        avatar: "./assets/teacher_li.webp",
        dialogue: "园长，群风波后我想通了。下周我想试点自主活动，解放老师的控场心力。但可能会有家长担心安全，可以吗？",
        minigame: {
            type: "safeguard",
            instructions: "支持教师开展专业改革创新前，请为她配备必要的【安全保障包】："
        },
        options: [
            {
                text: "A. 共同试点：“想法很棒！我支持你。我们一起制定安全防线，并用周信向家长沟通设计意图，做个试点。”",
                feedback: "【标签：赋能共前】极佳的管理者风范！不仅肯定了专业反思，更在行动上给予安全规划，做到真正的引领与赋能。",
                scores: { listen: 5, accept: 5, empower: 5, boundary: 5, intervene: 5 }
            },
            {
                text: "B. 安全防守：“这周风波刚停，家长正敏感。万一磕碰被投诉太被动了，还是按老规矩办，安全第一。”",
                feedback: "【标签：防御保守】出于风险规避直接浇灭了骨干教师的创意火苗。虽换来了短期安定，但易让团队走向倦怠沉闷。",
                scores: { listen: 1, accept: 1, empower: 1, boundary: 5, intervene: 1 }
            },
            {
                text: "C. 盲目支持：“创意太好了！放手去干，出了任何安全和家长问题，园长全权替你担着！”",
                feedback: "【标签：大包大揽】看似豪爽担当，但完全免除教师的安全防范职责，会在后期执行中埋下极大的管理隐患。",
                scores: { listen: 5, accept: 4, empower: 4, boundary: 1, intervene: 3 }
            }
        ]
    },
    {
        day: "星期五",
        period: "下午",
        speaker: "颜老师 (总结指导)",
        character: "guide_zeng",
        avatar: "./assets/guide_zeng.webp",
        dialogue: "园长们，这一周的惊涛骇浪表明，教师心理健康是保教工作的压舱石。我们在园内设立了匿名情绪树洞信箱，现在收到了一封来信：",
        minigame: {
            type: "treehouse",
            instructions: "请将该匿名信进行正确的心理问题归类："
        },
        options: [
            {
                text: "A. 建立系统性心理支持机制：开展心理团辅，精简多余考核，给老师机制性解压。",
                feedback: "【标签：定心治园】完美的句号！通过建立长效、系统性的共情与支持机制，真正将园所打造成有温度的心灵港湾。",
                scores: { listen: 5, accept: 5, empower: 5, boundary: 5, intervene: 5 }
            },
            {
                text: "B. 仅提供宣泄渠道：仅挂个树洞箱子，但不改变规章，教师工作量和考核要点一切照旧。",
                feedback: "【标签：形式主义】只听不改，树洞很快就会变成无用的摆设，教师的倦怠问题依然无法得到根本解决。",
                scores: { listen: 3, accept: 3, empower: 2, boundary: 3, intervene: 2 }
            },
            {
                text: "C. 私下排查写信人：认为这反映了团队负能量，顺藤摸瓜找到写信人进行谈话‘定心’。",
                feedback: "【标签：破坏信任】极其致命的做法。追查写信人会彻底摧毁匿名树洞的安全感，让教师感到恐怖和不再信任园长。",
                scores: { listen: 1, accept: 1, empower: 1, boundary: 1, intervene: 1 }
            }
        ]
    }
];

// 2. 测评结果及性格卡片定义
const PERSONALITIES = {
    guardian: {
        title: "生态共生型·深根橡树",
        desc: "你的管理如深根橡树，在园所中心撑起一片宽阔的树荫。你既能以温和的直觉洞察并承接教师们细微的情绪风雨，又能坚守专业教育者的伦理与制度底线。你鼓励每一株草木自主向上生长，而非将她们纳为附庸。在你的治理下，园所形成了一个自适应、具备强大韧性的健康生态系统。",
        quote: "“看见情绪是治理的起点，赋能成长是共情的终点。有温度的底线，才是给团队最深沉的心理安全感。”",
        advice: `
            <div class="advice-item">
                <strong>🌟 黄金配方：共情力、赋能度与理性边界的完美协奏</strong>
                <p>你在模拟管理中展现了卓越的“生态位构建”能力。你坚持“看见人-回应人-支持人-发展人”的闭环，在接纳教师情绪的同时，绝不代庖她们本应承担的成长责任。你的团队不仅充满了心理安全感，更是具备强大自我修复力的“心理韧性”团队。</p>
            </div>
            <div class="advice-item">
                <strong>🌱 进阶心药方</strong>
                <p>建议继续推行“生态对话机制”（如非正式一对一叙事谈心），为新老幼师搭建园所内部的“情绪减压阀”。作为园所生态的引领者，也请时刻关注自身的“情绪劳动”超载，定期进行自我关怀（Self-Care），为自己保留专属的蓄能时间。一个生命力充盈的园长，才能持续滋养整个园所的生命力。</p>
            </div>
        `
    },
    totoro: {
        title: "母爱泛滥型·温室暖棚",
        desc: "你像一座恒温的温室暖棚，怀揣着无微不至的温柔，甚至常常用自己的身躯替教师们扛下所有的狂风骤雨。只要教师感到疲惫或受到家长的委屈，你便会本能地大包大揽。然而，长期的过度保护可能剥夺了植物经历风雨而长成大树的权利。温室之中的娇花，难以应对真实世界的挑战。",
        quote: "“一个大包大揽的园长，带不出独立担当的团队；一个自己内心枯竭的园长，也无法照亮疲惫的教师。”",
        advice: `
            <div class="advice-item">
                <strong>⚠️ 诊断：共情力与接纳度极高，但“理性边界”与“专业赋能”略显不足</strong>
                <p>你极其富有同理心，但在面对教师的情绪困境（如家长投诉、请假或崩溃）时容易产生“替代性创伤”，采取“保姆式”替代处理。这种管理策略极易导致园长自己身心耗竭，同时剥夺了教师独立复盘、学习与家长沟通、以及应对职业危机的专业成长机会。</p>
            </div>
            <div class="advice-item">
                <strong>💊 治园药方</strong>
                <p>引入<b>“专业教练技术”（Coaching）</b>。学会温和而坚定地退后一步，使用共情沟通的“支持-授权”模型。在安抚好教师情绪后，将解决问题的自主权抛回给她们：“我非常理解你的委屈，如果由你来重新处理，你觉得可以从哪些方面入手？我可以为你提供哪些资源支持？”通过制定清晰的安全红线和工作流程（SOP），让教师从“被保护者”成长为“自我负责的专业教育者”。</p>
            </div>
        `
    },
    howl: {
        title: "理性导航型·精密灯塔",
        desc: "你是一座矗立在风浪中的精密灯塔，理性、高效、方向感极强。你擅长在高压危机下迅速厘清规则，设计最优的工作路径，并为团队开辟出清晰的通道。然而，当冰冷的灯光只照亮任务时，往往会忽略教师们在黑暗中默默忍受的情绪暗流。有时候，疲倦的夜航人不需要一张完美的航线图，而仅仅需要一盏温暖的炉火与倾听。",
        quote: "“管理的起点是看见人，共情的起点是感知情绪。当一个人处在情绪风暴中时，给再多的方案都是无效的。”",
        advice: `
            <div class="advice-item">
                <strong>⚠️ 诊断：危机干预与理性边界极强，但“共情倾听”与“情绪接纳”有所欠缺</strong>
                <p>你在工作中极其高效，目标明确，遇到危机（如家园冲突、流程交接）时能迅速建立制度防线。但在面对教师的焦虑、委屈或崩溃时，你的第一反应往往是“立刻纠偏”或“说教式给方案”。这会让教师觉得在你眼里“事情比人重要”，从而在心里筑起防护墙。</p>
            </div>
            <div class="advice-item">
                <strong>💊 治园药方</strong>
                <p>践行<b>“非暴力沟通”（NVC）与“情绪反射”技术</b>。当教师向你抱怨或诉苦时，克制住“立刻给出解决方案”的职业冲动，尝试纯粹倾听五分钟，并用语言反射对方的感受：“听起来你真的很委屈，这确实很不容易。”先为教师疏导内心的“天气系统”，待其情绪平复、理智重新上线时，你出色的方案和专业指引才能真正走入她们的心里。</p>
            </div>
        `
    },
    noface: {
        title: "无原则迎合型·温顺藤蔓",
        desc: "你像一株极其温顺的藤蔓，试图延展自己去承接、顺应和满足每一位教师的各种诉求与情绪。因为害怕冲突和被讨厌，你常常在面对教师的情绪施压时选择毫无原则地退让与妥协。然而，失去骨骼的温柔是溺爱，更是对组织秩序的慢性毒药。模糊的边界会让园所陷入无序，最终伤害到团队的整体安全。",
        quote: "“共情不是无原则妥协，严苛并不是管理的唯一解，但失去边界的温柔往往带来更大的失控与伤害。”",
        advice: `
            <div class="advice-item">
                <strong>⚠️ 诊断：试图共情与接纳一切，但丧失了核心的“管理边界”</strong>
                <p>你极其在乎教师的感受，为了让教师“开心工作”，你常常在她们完不成任务、甚至越过安全底线时选择纵容。这种“以妥协换和谐”的做法，极易在园所内部造成“大锅饭”或规章失效，损害团队的公平性与执行力，也会让遵守规则的优秀教师感到失望。</p>
            </div>
            <div class="advice-item">
                <strong>💊 治园药方</strong>
                <p>建立并践行<b>“心理契约”与“断舍离管理”</b>。清晰厘清：什么是教师个人的专业底线，什么是园所的安全红线。对于违反安全原则与核心规章的行为，必须坚持“零容忍”，但可以使用“温和的语气”表达“坚定的立场”。尝试练习“温和而坚决的拒绝”——温和地对待人，坚定地对待事。</p>
            </div>
        `
    },
    kiki: {
        title: "高压防卫型·冷铁栅栏",
        desc: "你像一圈冷铁栅栏，环绕在园所的安全边界上，防御性极强。你对效率、考核与绝对安全有着近乎苛刻的执念，是一个高度防御型的“救火队管理者”。在你眼里，规章制度是唯一的尺子，创新往往意味着风险，教师的情绪宣泄则是“不专业”的体现。这让你的园所坚固而规范，但也让围栏内的空气变得压抑而凝重，使教师处于长期的“情绪劳动”枯竭状态。",
        quote: "“看不见隐性情绪劳动的价值，就无法留住教师的心。高压考核只能维持出勤，尊重与信任才能激发专业。”",
        advice: `
            <div class="advice-item">
                <strong>⚠️ 诊断：防御性过高，指标导向明显，共情倾听与团队赋能火花双重微弱</strong>
                <p>你极其注重效率、规定和园所的绝对安全（防御性极强）。面对创新，你因为害怕家长投诉而直接否定；面对请假的教师，你试图以工作考核施压；面对哭泣的小王，你选择冷酷回避。这会形成一种高压、低容错、情感冰冷的园所氛围，极大加剧教师的工作负荷 and 情感枯竭。</p>
            </div>
            <div class="advice-item">
                <strong>💊 治园药方</strong>
                <p>学习<b>“心理安全感”（Psychological Safety）理论</b>。明白在学前教育这种高情绪劳动的行业中，心理安全感是团队创新的基石。尝试走下“防卫高台”，在每天巡园时，多观察教师的细微表情，以“关怀询问”代替“质问性检查”，给创新的骨干以合理的“容错空间”。允许团队有呼吸和倾诉的缝隙，冷铁栅栏才能开出绿色的花朵。</p>
            </div>
        `
    }
};

const state = {
    currentScreen: "cover",
    currentDayIndex: 0,
    history: [],
    radarStats: { listen: 0, accept: 0, empower: 0, boundary: 0, intervene: 0 },
    scenarioStage: "incident", // incident | minigame | consequence | options | feedback
    selectedLensBonus: { listen: 0, accept: 0 },
    audio: { ctx: null, windNoise: null, gainNode: null, isPlaying: false }
};

// 4. 音频引擎 (自然风声合成器)
function initAudioEngine() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        state.audio.ctx = new AudioContextClass();
        state.audio.gainNode = state.audio.ctx.createGain();
        state.audio.gainNode.gain.setValueAtTime(0, state.audio.ctx.currentTime);
        state.audio.gainNode.connect(state.audio.ctx.destination);
        
        const bufferSize = 2 * state.audio.ctx.sampleRate;
        const noiseBuffer = state.audio.ctx.createBuffer(1, bufferSize, state.audio.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11;
            b6 = white * 0.115926;
        }
        
        const noiseSource = state.audio.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        
        const filter = state.audio.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 2.0;
        filter.frequency.value = 400;
        
        const lfo = state.audio.ctx.createOscillator();
        lfo.frequency.value = 0.12; 
        const lfoGain = state.audio.ctx.createGain();
        lfoGain.gain.value = 200; 
        
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        noiseSource.connect(filter);
        filter.connect(state.audio.gainNode);
        
        lfo.start(0);
        noiseSource.start(0);
        state.audio.windNoise = noiseSource;
    } catch (e) {
        console.warn("AudioContext init failed.", e);
    }
}

function toggleSound() {
    if (!state.audio.ctx) initAudioEngine();
    if (!state.audio.ctx) return;
    if (state.audio.ctx.state === 'suspended') state.audio.ctx.resume();
    
    const soundIcon = document.getElementById("sound-icon");
    const soundText = document.getElementById("sound-text");
    
    if (state.audio.isPlaying) {
        state.audio.gainNode.gain.linearRampToValueAtTime(0.001, state.audio.ctx.currentTime + 1.0);
        state.audio.isPlaying = false;
        if (soundIcon) {
            soundIcon.innerHTML = `<path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM12 4L9.91 6.09L12 8.18V4zm-8 8h4l5 5V7l-5 5H4v2zm0-2h4l1.91-1.91L8 6.18V10H4v2z"/>`;
        }
        if (soundText) soundText.innerText = "已静音";
    } else {
        state.audio.gainNode.gain.linearRampToValueAtTime(0.12, state.audio.ctx.currentTime + 1.2);
        state.audio.isPlaying = true;
        if (soundIcon) {
            soundIcon.innerHTML = `<path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
        }
        if (soundText) soundText.innerText = "风声轻拂";
    }
}

function transitionTo(screenId) {
    const screens = ["screen-cover", "screen-intro", "screen-gameplay", "screen-report"].map(id => document.getElementById(id));
    screens.forEach(s => {
        if (s) s.classList.remove("active");
    });
    
    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
        target.classList.add("active");
        state.currentScreen = screenId;
    }
}

// ==========================================================================
// 流程渲染引擎
// ==========================================================================
function startGame() {
    transitionTo("intro");
    if (!state.audio.ctx) initAudioEngine();
}

function startWeek() {
    state.currentDayIndex = 0;
    state.history = [];
    state.radarStats = { listen: 0, accept: 0, empower: 0, boundary: 0, intervene: 0 };
    state.selectedLensBonus = { listen: 0, accept: 0 };
    transitionTo("gameplay");
    showScenario(0);
}

function showScenario(index) {
    if (index >= SCENARIOS.length) {
        finishGame();
        return;
    }
    
    const scene = SCENARIOS[index];
    
    const currentDayEl = document.getElementById("current-day");
    const currentPeriodEl = document.getElementById("current-period");
    const speakerNameEl = document.getElementById("speaker-name");
    const dialogueTextEl = document.getElementById("dialogue-text");
    const characterImgEl = document.getElementById("character-img");
    const minigameContainer = document.getElementById("minigame-container");
    const optionsContainer = document.getElementById("options-container");
    
    if (currentDayEl) currentDayEl.innerText = scene.day;
    if (currentPeriodEl) currentPeriodEl.innerText = scene.period;
    if (speakerNameEl) speakerNameEl.innerText = scene.speaker;
    if (dialogueTextEl) dialogueTextEl.innerHTML = scene.dialogue;
    if (characterImgEl) updateAvatar(scene.avatar);
    
    if (minigameContainer) {
        minigameContainer.innerHTML = "";
        minigameContainer.style.display = "none";
    }
    if (optionsContainer) {
        optionsContainer.innerHTML = "";
        optionsContainer.style.display = "none";
    }
    
    state.scenarioStage = "incident";
    
    const nextBtnLabels = [
        "分析心智信念 (B)",
        "调配沟通温度",
        "分析心理需求 (马斯洛)",
        "给小王情绪充能",
        "调节关怀/制度天平",
        "配置危机应对资源",
        "诊断职业倦怠阶段",
        "引导小王呼吸舒压",
        "配置创新防线",
        "阅读树洞匿名信"
    ];
    
    renderContinueButton(nextBtnLabels[index], () => {
        state.scenarioStage = "minigame";
        if (optionsContainer) {
            optionsContainer.innerHTML = "";
            optionsContainer.style.display = "none";
        }
        
        if (index === 0) {
            renderMondayLensMiniGame();
        } else {
            renderMiniGame(index);
        }
    });
}

function renderContinueButton(label, callback) {
    const optionsContainer = document.getElementById("options-container");
    if (!optionsContainer) return;
    
    optionsContainer.style.display = "flex";
    optionsContainer.innerHTML = "";
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-glow";
    btn.style.width = "auto";
    btn.style.alignSelf = "center";
    btn.innerHTML = `${label} &raquo;`;
    btn.addEventListener("click", callback);
    optionsContainer.appendChild(btn);
}

// ==========================================================================
// 关卡微游戏控制
// ==========================================================================
function renderMondayLensMiniGame() {
    const scene = SCENARIOS[0];
    const minigameContainer = document.getElementById("minigame-container");
    const optionsContainer = document.getElementById("options-container");
    
    if (!minigameContainer || !optionsContainer) return;
    
    optionsContainer.innerHTML = "";
    minigameContainer.style.display = "flex";
    minigameContainer.innerHTML = `<p class="minigame-instructions" style="font-weight:600; color:#725227;">${scene.abcFlow.lensText}</p>`;
    
    const layout = document.createElement("div");
    layout.className = "lenses-layout";
    
    scene.abcFlow.options.forEach(opt => {
        const item = document.createElement("div");
        item.className = `lens-item ${opt.id === 'B1' ? 'irrational' : 'rational'}`;
        item.innerHTML = `<h4>${opt.title}</h4><p>${opt.desc}</p>`;
        layout.appendChild(item);
        
        item.addEventListener("click", () => {
            state.selectedLensBonus = opt.bonus;
            state.scenarioStage = "consequence";
            minigameContainer.style.display = "none";
            
            const speakerNameEl = document.getElementById("speaker-name");
            const dialogueTextEl = document.getElementById("dialogue-text");
            const characterImgEl = document.getElementById("character-img");
            if (speakerNameEl) speakerNameEl.innerText = "颜老师 (心理后果演示)";
            if (dialogueTextEl) dialogueTextEl.innerHTML = opt.consequence;
            if (characterImgEl) updateAvatar("./assets/guide_zeng.webp");
            
            renderContinueButton("面对该后果：进行园长决策", () => {
                state.scenarioStage = "options";
                renderOptions(0);
            });
        });
    });
    
    layout.style.animation = "fadeIn 0.3s ease-out";
    minigameContainer.appendChild(layout);
}

function renderMiniGame(index) {
    const scene = SCENARIOS[index];
    const mg = scene.minigame;
    const minigameContainer = document.getElementById("minigame-container");
    if (!minigameContainer || !mg) return;
    
    minigameContainer.style.display = "flex";
    
    const instr = document.createElement("p");
    instr.className = "minigame-instructions";
    instr.style.fontWeight = "600";
    instr.style.color = "#725227";
    instr.innerText = mg.instructions;
    minigameContainer.appendChild(instr);
    
    // Mon PM: 沟通温度调节器
    if (mg.type === "temperature") {
        const layout = document.createElement("div");
        layout.className = "scale-layout";
        
        const sliderContainer = document.createElement("div");
        sliderContainer.className = "scale-slider-container";
        
        const slider = document.createElement("input");
        slider.type = "range";
        slider.className = "scale-slider";
        slider.min = "10";
        slider.max = "90";
        slider.value = "50";
        
        const labels = document.createElement("div");
        labels.className = "scale-labels";
        labels.innerHTML = `<span>强硬反击 (冷)</span><span>卑微妥协 (热)</span>`;
        
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(labels);
        
        const confirmBtn = document.createElement("button");
        confirmBtn.className = "btn btn-primary btn-glow";
        confirmBtn.style.padding = "0.5rem 1.8rem";
        confirmBtn.style.fontSize = "0.9rem";
        confirmBtn.innerText = "确认沟通策略";
        
        layout.appendChild(sliderContainer);
        layout.appendChild(confirmBtn);
        minigameContainer.appendChild(layout);
        
        function updateDialogue(val) {
            const valNum = parseInt(val);
            const dialogueTextEl = document.getElementById("dialogue-text");
            if (dialogueTextEl) {
                if (valNum < 35) {
                    dialogueTextEl.innerHTML = "（沟通温度：偏冷 - 强硬公关）“亮亮妈妈，请您注意说话分寸，不要在群里发布负面主观臆测。如有疑问请私聊，否则我们将予以警告。”";
                } else if (valNum > 65) {
                    dialogueTextEl.innerHTML = "（沟通温度：偏热 - 卑微妥协）“对不起对不起！都是我们工作的严重失职，让亮亮受委屈了，我们一定全面整改，严惩责任老师！”";
                } else {
                    dialogueTextEl.innerHTML = "（沟通温度：适中 - 温和坚定）“亮亮妈妈，非常理解您的焦急。我们珍视亮亮在园的体验。关于衣服泥点的误会，我稍后会电话与您沟通详细情况。”";
                }
            }
        }
        
        slider.addEventListener("input", (e) => updateDialogue(e.target.value));
        updateDialogue("50");
        
        confirmBtn.addEventListener("click", () => {
            const finalVal = parseInt(slider.value);
            state.scenarioStage = "options";
            minigameContainer.style.display = "none";
            if (finalVal < 35) selectOption(1, 0);
            else if (finalVal > 65) selectOption(1, 2);
            else selectOption(1, 1);
        });
    }
    
    // Tue AM: 马斯洛匹配
    else if (mg.type === "maslow") {
        const layout = document.createElement("div");
        layout.className = "maslow-layout";
        
        const pillsContainer = document.createElement("div");
        pillsContainer.className = "complaint-pills";
        
        const complaints = [
            { id: 1, text: "“填表环创累（工作负荷）”", target: "safety" },
            { id: 2, text: "“家长连环催（缺乏边界）”", target: "belonging" },
            { id: 3, text: "“打卡机器人（无成就感）”", target: "self" }
        ];
        
        const targets = [
            { id: "safety", title: "生理/安全边界需求", matched: null },
            { id: "belonging", title: "情感/团队归属需求", matched: null },
            { id: "self", title: "自我实现/成就需求", matched: null }
        ];
        
        let selectedPill = null;
        let mismatchCount = 0;
        
        complaints.forEach(c => {
            const pill = document.createElement("div");
            pill.className = "complaint-pill";
            pill.innerText = c.text;
            pillsContainer.appendChild(pill);
            
            pill.addEventListener("click", () => {
                if (pill.classList.contains("matched")) return;
                pillsContainer.querySelectorAll(".complaint-pill").forEach(p => p.classList.remove("active"));
                pill.classList.add("active");
                selectedPill = c;
            });
        });
        
        const pyramids = document.createElement("div");
        pyramids.className = "target-pyramids";
        
        targets.forEach(t => {
            const lvl = document.createElement("div");
            lvl.className = "pyramid-level";
            lvl.innerHTML = `<span class="level-title">${t.title}</span>`;
            pyramids.appendChild(lvl);
            
            lvl.addEventListener("click", () => {
                if (!selectedPill) {
                    alert("请先点击选中上方的抱怨词气泡！");
                    return;
                }
                
                if (selectedPill.target !== t.id) {
                    mismatchCount++;
                }
                t.matched = selectedPill;
                
                const matchPill = document.createElement("span");
                matchPill.className = "level-match-pill";
                matchPill.innerText = "已连线";
                lvl.appendChild(matchPill);
                
                const pillEl = Array.from(pillsContainer.children).find(el => el.innerText.includes(selectedPill.text.replace(/“|”/g, '')));
                if (pillEl) pillEl.className = "complaint-pill matched";
                
                selectedPill = null;
                
                if (targets.every(tg => tg.matched !== null)) {
                    setTimeout(() => {
                        const speakerNameEl = document.getElementById("speaker-name");
                        const dialogueTextEl = document.getElementById("dialogue-text");
                        const characterImgEl = document.getElementById("character-img");
                        if (speakerNameEl) speakerNameEl.innerText = "颜老师 (分析指导)";
                        
                        if (mismatchCount === 0) {
                            if (dialogueTextEl) dialogueTextEl.innerHTML = "<b>连线归纳成功！</b> 小王抱怨的背后，是底层生理安全和归属需求的缺失。请园长开始决策：";
                        } else {
                            state.radarStats.listen = Math.max(0, state.radarStats.listen - mismatchCount);
                            if (dialogueTextEl) dialogueTextEl.innerHTML = `<b>连线分析结束。</b> 你的归类匹配中存在 ${mismatchCount} 处错置。小王的问题其实是安全边界和归属需求缺口，请园长决策：`;
                        }
                        
                        if (characterImgEl) updateAvatar("./assets/guide_zeng.webp");
                        state.scenarioStage = "options";
                        minigameContainer.style.display = "none";
                        renderOptions(index);
                    }, 600);
                }
            });
        });
        
        layout.appendChild(pillsContainer);
        layout.appendChild(pyramids);
        minigameContainer.appendChild(layout);
    }
    
    // Tue PM: 情绪电量充能
    else if (mg.type === "battery") {
        const layout = document.createElement("div");
        layout.className = "battery-layout";
        
        const batteryContainer = document.createElement("div");
        batteryContainer.className = "battery-container";
        
        const batteryFill = document.createElement("div");
        batteryFill.className = "battery-fill warning";
        batteryFill.style.width = "20%";
        batteryFill.innerHTML = `<span class="battery-value">20%</span>`;
        batteryContainer.appendChild(batteryFill);
        
        const careCards = document.createElement("div");
        careCards.className = "care-cards";
        
        const cardsData = [
            { id: 0, text: "A. 递温热花茶<br>“刚才你受委屈了，你处理得很棒”" },
            { id: 1, text: "B. 主动替岗解围<br>“亮亮妈妈我来处理，小王你先回办公室”" },
            { id: 2, text: "C. 要求以大局为重<br>“做幼师要学会忍耐，多磨炼是好事”" }
        ];
        
        cardsData.forEach(cardData => {
            const card = document.createElement("div");
            card.className = "care-card";
            card.innerHTML = cardData.text;
            careCards.appendChild(card);
            
            card.addEventListener("click", () => {
                const fillVal = batteryFill.querySelector(".battery-value");
                if (cardData.id === 0) {
                    batteryFill.style.width = "60%";
                    batteryFill.className = "battery-fill warning";
                    if (fillVal) fillVal.innerText = "60%";
                } else if (cardData.id === 1) {
                    batteryFill.style.width = "95%";
                    batteryFill.className = "battery-fill good";
                    if (fillVal) fillVal.innerText = "95%";
                } else {
                    batteryFill.style.width = "5%";
                    batteryFill.className = "battery-fill danger";
                    if (fillVal) fillVal.innerText = "5%";
                }
                
                careCards.querySelectorAll(".care-card").forEach(c => c.classList.add("disabled"));
                
                setTimeout(() => {
                    state.scenarioStage = "options";
                    minigameContainer.style.display = "none";
                    selectOption(3, cardData.id);
                }, 1200);
            });
        });
        
        layout.appendChild(batteryContainer);
        layout.appendChild(careCards);
        minigameContainer.appendChild(layout);
    }
    
    // Wed AM: 关怀与制度平衡天平
    else if (mg.type === "scale") {
        const layout = document.createElement("div");
        layout.className = "scale-layout";
        
        const sliderContainer = document.createElement("div");
        sliderContainer.className = "scale-slider-container";
        
        const slider = document.createElement("input");
        slider.type = "range";
        slider.className = "scale-slider";
        slider.min = "10";
        slider.max = "90";
        slider.value = "50";
        
        const labels = document.createElement("div");
        labels.className = "scale-labels";
        labels.innerHTML = `<span>关怀优先 (轻)</span><span>制度优先 (重)</span>`;
        
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(labels);
        
        const gauges = document.createElement("div");
        gauges.className = "scale-gauges";
        
        const g1 = document.createElement("div");
        g1.className = "gauge-item";
        g1.innerHTML = `<span class="gauge-title">副手小张 (独立信心值)</span>
                        <div class="gauge-track"><div id="gauge-zhang" class="gauge-fill" style="width: 50%;"></div></div>
                        <span id="txt-zhang" class="gauge-val">50%</span>`;
                        
        const g2 = document.createElement("div");
        g2.className = "gauge-item";
        g2.innerHTML = `<span class="gauge-title">陈老师 (心理安定感)</span>
                        <div class="gauge-track"><div id="gauge-chen" class="gauge-fill" style="width: 50%;"></div></div>
                        <span id="txt-chen" class="gauge-val">50%</span>`;
                        
        gauges.appendChild(g1);
        gauges.appendChild(g2);
        
        const confirmBtn = document.createElement("button");
        confirmBtn.className = "btn btn-primary btn-glow";
        confirmBtn.style.padding = "0.5rem 1.8rem";
        confirmBtn.style.fontSize = "0.9rem";
        confirmBtn.innerText = "确定调配比率";
        
        layout.appendChild(sliderContainer);
        layout.appendChild(gauges);
        layout.appendChild(confirmBtn);
        minigameContainer.appendChild(layout);
        
        function updateGauges(val) {
            const valNum = parseInt(val);
            const chenStat = Math.max(10, Math.min(100, Math.round(100 - (valNum - 10) * 1.1))); 
            const zhangStat = Math.max(10, Math.min(100, Math.round(valNum * 1.05))); 
            
            const gChen = document.getElementById("gauge-chen");
            const tChen = document.getElementById("txt-chen");
            const gZhang = document.getElementById("gauge-zhang");
            const tZhang = document.getElementById("txt-zhang");
            
            if (gChen) gChen.style.width = `${chenStat}%`;
            if (tChen) tChen.innerText = `${chenStat}%`;
            if (gZhang) gZhang.style.width = `${zhangStat}%`;
            if (tZhang) tZhang.innerText = `${zhangStat}%`;
            
            const dialogueTextEl = document.getElementById("dialogue-text");
            if (dialogueTextEl) {
                if (valNum < 35) {
                    dialogueTextEl.innerHTML = "（天平倾斜：过度关怀）“孩子高烧太揪心了，快回去！彩排工作我亲自顶替你，你别操心了。”";
                } else if (valNum > 65) {
                    dialogueTextEl.innerHTML = "（天平倾斜：冷漠制度）“明天公开日彩排全园都在看。你请假现场肯定乱套，能先让家人带去吗？”";
                } else {
                    dialogueTextEl.innerHTML = "（天平倾斜：理性共情）“孩子要紧，快回医院。你把流程表发给副手小张，我相信她能协助推进，我也会在一旁把关。”";
                }
            }
        }
        
        slider.addEventListener("input", (e) => updateGauges(e.target.value));
        updateGauges("50");
        
        confirmBtn.addEventListener("click", () => {
            const finalVal = parseInt(slider.value);
            state.scenarioStage = "options";
            minigameContainer.style.display = "none";
            if (finalVal < 35) selectOption(4, 0); 
            else if (finalVal > 65) selectOption(4, 2); 
            else selectOption(4, 1);
        });
    }
    
    // Wed PM: 危机资源分配
    else if (mg.type === "crisis") {
        const layout = document.createElement("div");
        layout.className = "safeguard-layout";
        
        const optionsData = [
            { id: 1, text: "A. 简化彩排次要流程，精简出场仪式" },
            { id: 2, text: "B. 调配后勤保障人员，协助班级控场" },
            { id: 3, text: "C. 园长亲自协助把关，但由小张继续总调度" }
        ];
        
        const selectedIds = new Set();
        
        optionsData.forEach(opt => {
            const item = document.createElement("div");
            item.className = "safeguard-item";
            item.innerHTML = `<div class="checkbox-box"></div><span class="safeguard-label">${opt.text}</span>`;
            layout.appendChild(item);
            
            item.addEventListener("click", () => {
                if (selectedIds.has(opt.id)) {
                    selectedIds.delete(opt.id);
                    item.classList.remove("checked");
                } else {
                    selectedIds.add(opt.id);
                    item.classList.add("checked");
                }
            });
        });
        
        const confirmBtn = document.createElement("button");
        confirmBtn.className = "btn btn-primary btn-glow";
        confirmBtn.style.padding = "0.5rem 1.8rem";
        confirmBtn.style.fontSize = "0.9rem";
        confirmBtn.innerText = "确认配置资源";
        layout.appendChild(confirmBtn);
        minigameContainer.appendChild(layout);
        
        confirmBtn.addEventListener("click", () => {
            state.scenarioStage = "options";
            minigameContainer.style.display = "none";
            if (selectedIds.size === 3) selectOption(5, 0); 
            else if (selectedIds.size === 0) selectOption(5, 1); 
            else selectOption(5, 2); 
        });
    }
    
    // Thu AM: 职业倦怠断诊
    else if (mg.type === "burnout") {
        const layout = document.createElement("div");
        layout.className = "diagnosis-layout";
        
        const diaryCard = document.createElement("div");
        diaryCard.className = "diary-card";
        diaryCard.innerHTML = "“公开日虽然成功了，但我心里只有麻木。我不想跟任何人说话，不想看到孩子，甚至觉得明天来幼儿园是一种折磨……”";
        layout.appendChild(diaryCard);
        
        const diagnosisGrid = document.createElement("div");
        diagnosisGrid.className = "diagnosis-grid";
        
        const stages = [
            { id: 0, text: "A. 蜜月期 (高涨热忱)" },
            { id: 1, text: "B. 燃料消耗期 (易疲劳)" },
            { id: 2, text: "C. 慢性症状期 (失眠易怒)" },
            { id: 3, text: "D. 危机期 (麻木情感耗竭)" }
        ];
        
        stages.forEach(stage => {
            const btn = document.createElement("button");
            btn.className = "diag-btn";
            btn.innerText = stage.text;
            diagnosisGrid.appendChild(btn);
            
            btn.addEventListener("click", () => {
                const speakerNameEl = document.getElementById("speaker-name");
                const dialogueTextEl = document.getElementById("dialogue-text");
                const characterImgEl = document.getElementById("character-img");
                
                if (stage.id === 3) {
                    btn.style.backgroundColor = "var(--primary-light)";
                    btn.style.borderColor = "var(--primary-color)";
                    
                    setTimeout(() => {
                        if (speakerNameEl) speakerNameEl.innerText = "颜老师 (分析指导)";
                        if (dialogueTextEl) dialogueTextEl.innerHTML = "<b>诊断正确！</b> 小王表现出极度的情感耗竭和去个性化（冷漠麻木），已处于严重的“危机期”。请园长进行应对决策：";
                        if (characterImgEl) updateAvatar("./assets/guide_zeng.webp");
                        state.scenarioStage = "options";
                        minigameContainer.style.display = "none";
                        renderOptions(6);
                    }, 800);
                } else {
                    btn.style.backgroundColor = "#FEE2E2";
                    btn.style.borderColor = "#EF4444";
                    
                    state.radarStats.intervene = Math.max(0, state.radarStats.intervene - 2);
                    const cleanText = stage.text.replace(/^[A-D]\.\s*/, '');
                    
                    setTimeout(() => {
                        if (speakerNameEl) speakerNameEl.innerText = "颜老师 (分析指导)";
                        if (dialogueTextEl) dialogueTextEl.innerHTML = `<b>诊断有些偏差。</b> 你诊断小王为“${cleanText}”。其实，她表现出的极度麻木与逃避，已属于最严重的“危机期”。请园长进行应对决策：`;
                        if (characterImgEl) updateAvatar("./assets/guide_zeng.webp");
                        state.scenarioStage = "options";
                        minigameContainer.style.display = "none";
                        renderOptions(6);
                    }, 800);
                }
            });
        });
        
        layout.appendChild(diagnosisGrid);
        minigameContainer.appendChild(layout);
    }
    
    // Thu PM: 呼吸同步
    else if (mg.type === "breath") {
        const layout = document.createElement("div");
        layout.className = "breath-layout";
        
        const wrapper = document.createElement("div");
        wrapper.className = "breath-indicator-wrapper";
        
        const circle = document.createElement("div");
        circle.className = "breath-circle";
        circle.innerHTML = `<span id="breath-text" class="breath-state-text">准备</span>`;
        wrapper.appendChild(circle);
        
        const btn = document.createElement("button");
        btn.className = "breath-btn";
        btn.innerText = "开始同步呼吸 (3循环)";
        
        const progress = document.createElement("div");
        progress.className = "breath-progress";
        progress.innerHTML = `<div class="breath-dot"></div><div class="breath-dot"></div><div class="breath-dot"></div>`;
        
        layout.appendChild(wrapper);
        layout.appendChild(btn);
        layout.appendChild(progress);
        minigameContainer.appendChild(layout);
        
        let count = 0;
        let step = 0; // 0: inhale, 1: hold, 2: exhale
        
        function runBreathCycle() {
            if (count >= 3) {
                btn.style.display = "none";
                const bText = document.getElementById("breath-text");
                if (bText) bText.innerText = "平复";
                
                const speakerNameEl = document.getElementById("speaker-name");
                const dialogueTextEl = document.getElementById("dialogue-text");
                const characterImgEl = document.getElementById("character-img");
                if (speakerNameEl) speakerNameEl.innerText = "颜老师 (心理干预引导)";
                if (dialogueTextEl) dialogueTextEl.innerHTML = "（小王跟你完成了深呼吸，哭泣渐止，急促的心率重新归于稳定……）“呼……谢谢园长，我舒服多了。我刚才情绪太失控了，我该怎么办……”";
                if (characterImgEl) updateAvatar("./assets/guide_zeng.webp");
                
                state.scenarioStage = "options";
                minigameContainer.style.display = "none";
                renderOptions(7);
                return;
            }
            
            if (progress.children[count]) {
                progress.children[count].classList.add("active");
            }
            
            const bText = document.getElementById("breath-text");
            if (step === 0) {
                circle.style.transform = "scale(1.4)";
                circle.style.backgroundColor = "rgba(78, 159, 61, 0.4)";
                if (bText) bText.innerText = "吸气 4s";
                setTimeout(() => { step = 1; runBreathCycle(); }, 4000);
            } else if (step === 1) {
                circle.style.transform = "scale(1.4)";
                circle.style.backgroundColor = "rgba(250, 208, 44, 0.4)";
                if (bText) bText.innerText = "憋气 7s";
                setTimeout(() => { step = 2; runBreathCycle(); }, 7000);
            } else if (step === 2) {
                circle.style.transform = "scale(1.0)";
                circle.style.backgroundColor = "rgba(248, 164, 136, 0.4)";
                if (bText) bText.innerText = "呼气 8s";
                setTimeout(() => { step = 0; count++; runBreathCycle(); }, 8000);
            }
        }
        
        btn.addEventListener("click", () => {
            btn.disabled = true;
            btn.innerText = "引导中...";
            count = 0;
            step = 0;
            runBreathCycle();
        });
    }
    
    // Fri AM: 安全防线配置
    else if (mg.type === "safeguard") {
        const layout = document.createElement("div");
        layout.className = "safeguard-layout";
        
        const safeguards = [
            { id: 1, text: "A. 建立具体的“活动安全底线与应急流程”" },
            { id: 2, text: "B. 拟定家长一封信，阐述专业理念与防范措施" },
            { id: 3, text: "C. 设立试点班级，分阶段平稳推广" }
        ];
        
        const selectedIds = new Set();
        
        safeguards.forEach(sg => {
            const item = document.createElement("div");
            item.className = "safeguard-item";
            item.innerHTML = `<div class="checkbox-box"></div><span class="safeguard-label">${sg.text}</span>`;
            layout.appendChild(item);
            
            item.addEventListener("click", () => {
                if (selectedIds.has(sg.id)) {
                    selectedIds.delete(sg.id);
                    item.classList.remove("checked");
                } else {
                    selectedIds.add(sg.id);
                    item.classList.add("checked");
                }
            });
        });
        
        const confirmBtn = document.createElement("button");
        confirmBtn.className = "btn btn-primary btn-glow";
        confirmBtn.style.padding = "0.5rem 1.8rem";
        confirmBtn.style.fontSize = "0.9rem";
        confirmBtn.innerText = "确认防线并发布";
        layout.appendChild(confirmBtn);
        minigameContainer.appendChild(layout);
        
        confirmBtn.addEventListener("click", () => {
            state.scenarioStage = "options";
            minigameContainer.style.display = "none";
            if (selectedIds.size === 3) selectOption(8, 0); 
            else if (selectedIds.size === 0) selectOption(8, 1); 
            else selectOption(8, 2); 
        });
    }
    
    // Fri PM: 匿名信箱归类
    else if (mg.type === "treehouse") {
        const layout = document.createElement("div");
        layout.className = "treehouse-layout";
        
        const letterBox = document.createElement("div");
        letterBox.className = "letter-box";
        letterBox.innerHTML = `<span class="letter-title-tag">教师匿名来信</span>
                               <p class="letter-text">“我每天走进幼儿园都要戴上面具假笑，心好累，好想逃离这一切……”</p>`;
        layout.appendChild(letterBox);
        
        const tagsPool = document.createElement("div");
        tagsPool.className = "tags-pool";
        
        const tags = [
            { id: 0, label: "【人际危机】" },
            { id: 1, label: "【工作负荷】" },
            { id: 2, label: "【职业倦怠】" }
        ];
        
        tags.forEach(tag => {
            const pill = document.createElement("div");
            pill.className = "tag-pill";
            pill.innerText = tag.label;
            tagsPool.appendChild(pill);
            
            pill.addEventListener("click", () => {
                const speakerNameEl = document.getElementById("speaker-name");
                const dialogueTextEl = document.getElementById("dialogue-text");
                const characterImgEl = document.getElementById("character-img");
                
                if (tag.id === 2) {
                    pill.style.backgroundColor = "var(--primary-light)";
                    pill.style.borderColor = "var(--primary-color)";
                    
                    setTimeout(() => {
                        if (speakerNameEl) speakerNameEl.innerText = "颜老师 (总结指导)";
                        if (dialogueTextEl) dialogueTextEl.innerHTML = "<b>归类成功！</b> 匿名信反映的是典型的教师职业倦怠与情感耗竭。请园长决定如何建立永久性关怀机制：";
                        if (characterImgEl) updateAvatar("./assets/guide_zeng.webp");
                        state.scenarioStage = "options";
                        minigameContainer.style.display = "none";
                        renderOptions(9);
                    }, 800);
                } else {
                    pill.style.backgroundColor = "#FEE2E2";
                    pill.style.borderColor = "#EF4444";
                    
                    state.radarStats.accept = Math.max(0, state.radarStats.accept - 2);
                    const cleanTag = tag.label.replace(/【|】/g, '');
                    
                    setTimeout(() => {
                        if (speakerNameEl) speakerNameEl.innerText = "颜老师 (总结指导)";
                        if (dialogueTextEl) dialogueTextEl.innerHTML = `<b>归类有些偏颇。</b> 你归类为“${cleanTag}”。其实，信中流露出的深度心理耗竭与逃避感，主要属于“职业倦怠”。请园长决定如何建立永久性关怀机制：`;
                        if (characterImgEl) updateAvatar("./assets/guide_zeng.webp");
                        state.scenarioStage = "options";
                        minigameContainer.style.display = "none";
                        renderOptions(9);
                    }, 800);
                }
            });
        });
        
        layout.appendChild(tagsPool);
        minigameContainer.appendChild(layout);
    }
}

function renderOptions(index) {
    const optionsContainer = document.getElementById("options-container");
    if (!optionsContainer) return;
    
    optionsContainer.style.display = "flex";
    optionsContainer.innerHTML = "";
    
    const scene = SCENARIOS[index];
    scene.options.forEach((opt, optIdx) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerText = opt.text;
        btn.addEventListener("click", () => selectOption(index, optIdx));
        optionsContainer.appendChild(btn);
    });
}

function selectOption(sceneIdx, optIdx) {
    const scene = SCENARIOS[sceneIdx];
    const opt = scene.options[optIdx];
    
    // 累加雷达分数
    for (let key in opt.scores) {
        state.radarStats[key] += opt.scores[key];
    }
    
    // 周一上午信念选择产生得分
    if (sceneIdx === 0) {
        state.radarStats.listen += state.selectedLensBonus.listen;
        state.radarStats.accept += state.selectedLensBonus.accept;
    }
    
    state.history.push(optIdx);
    
    const minigameContainer = document.getElementById("minigame-container");
    const optionsContainer = document.getElementById("options-container");
    const speakerNameEl = document.getElementById("speaker-name");
    const dialogueTextEl = document.getElementById("dialogue-text");
    const characterImgEl = document.getElementById("character-img");
    
    if (minigameContainer) minigameContainer.style.display = "none";
    if (optionsContainer) optionsContainer.innerHTML = "";
    if (speakerNameEl) speakerNameEl.innerText = "颜老师 (管理解析)";
    if (characterImgEl) updateAvatar("./assets/guide_zeng.webp");
    
    if (dialogueTextEl) {
        dialogueTextEl.innerHTML = `${opt.feedback}<br><br><span style="color:var(--primary-color); font-weight:600; cursor:pointer;">[ 点击此处，进入下一个阶段 ]</span>`;
    }
    
    state.scenarioStage = "feedback";
    
    const nextStep = () => {
        const screenGameplay = document.getElementById("screen-gameplay");
        if (screenGameplay) screenGameplay.removeEventListener("click", nextStep);
        state.currentDayIndex++;
        showScenario(state.currentDayIndex);
    };
    
    setTimeout(() => {
        const screenGameplay = document.getElementById("screen-gameplay");
        if (screenGameplay) screenGameplay.addEventListener("click", nextStep);
    }, 150);
}

// 结算测评
function finishGame() {
    transitionTo("report");
    
    const empathy = state.radarStats.listen + state.radarStats.accept; // Max: ~104
    const empowerment = state.radarStats.empower + state.radarStats.intervene; // Max: ~93
    const boundary = state.radarStats.boundary; // Max: ~46
    
    let pKey = "kiki";
    
    if (empathy >= 75 && empowerment >= 70 && boundary >= 35) {
        pKey = "guardian";
    } else if (empathy >= 75 && boundary < 32) {
        pKey = "totoro";
    } else if (empathy < 65 && empowerment >= 65 && boundary >= 32) {
        pKey = "howl";
    } else if (empathy >= 65 && empowerment >= 65 && boundary < 32) {
        pKey = "noface";
    } else {
        pKey = "kiki";
    }
    
    const personality = PERSONALITIES[pKey];
    
    const titleEl = document.getElementById("personality-title");
    const descEl = document.getElementById("personality-desc");
    const quoteEl = document.getElementById("personality-quote");
    const adviceEl = document.getElementById("advice-content");
    const introGuideEl = document.getElementById("intro-guide-img");
    
    if (titleEl) titleEl.innerText = personality.title;
    if (descEl) descEl.innerText = personality.desc;
    if (quoteEl) quoteEl.innerText = personality.quote;
    if (adviceEl) adviceEl.innerHTML = personality.advice;
    if (introGuideEl) introGuideEl.src = "./assets/guide_zeng.webp";
    
    setTimeout(() => {
        drawRadarChart(state.radarStats);
    }, 300);
}

// Canvas 雷达图绘制
function drawRadarChart(stats) {
    const canvas = document.getElementById("radarChart");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const center = { x: width / 2, y: height / 2 };
    const radius = 95;
    
    const axes = [
        { label: "共情倾听", val: stats.listen, max: 50 }, 
        { label: "情绪接纳", val: stats.accept, max: 50 },
        { label: "团队赋能", val: stats.empower, max: 50 },
        { label: "危机干预", val: stats.intervene, max: 50 },
        { label: "理性边界", val: stats.boundary, max: 50 }
    ];
    
    ctx.clearRect(0, 0, width, height);
    
    function getPoint(index, total, length) {
        const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
        return {
            x: center.x + Math.cos(angle) * length,
            y: center.y + Math.sin(angle) * length
        };
    }
    
    const totalAxes = axes.length;
    
    // 底盘
    for (let layer = 1; layer <= 4; layer++) {
        const curRadius = radius * (layer / 4);
        ctx.beginPath();
        for (let i = 0; i < totalAxes; i++) {
            const pt = getPoint(i, totalAxes, curRadius);
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.strokeStyle = layer === 4 ? "rgba(78, 159, 61, 0.25)" : "rgba(78, 159, 61, 0.12)";
        ctx.lineWidth = layer === 4 ? 2 : 1;
        ctx.stroke();
    }
    
    // 轴线
    ctx.beginPath();
    for (let i = 0; i < totalAxes; i++) {
        const pt = getPoint(i, totalAxes, radius);
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(pt.x, pt.y);
    }
    ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
    ctx.stroke();
    
    // 标签
    ctx.font = "bold 11px 'Outfit', 'Noto Sans SC', sans-serif";
    ctx.fillStyle = "#3A3F47";
    for (let i = 0; i < totalAxes; i++) {
        const pt = getPoint(i, totalAxes, radius + 16);
        let align = "center";
        if (pt.x < center.x - 20) align = "right";
        else if (pt.x > center.x + 20) align = "left";
        ctx.textAlign = align;
        ctx.fillText(axes[i].label, pt.x, pt.y);
    }
    
    // 数据多边形
    const userPoints = [];
    for (let i = 0; i < totalAxes; i++) {
        const ratio = Math.max(0.15, Math.min(1, axes[i].val / axes[i].max));
        const pt = getPoint(i, totalAxes, radius * ratio);
        userPoints.push(pt);
    }
    
    ctx.beginPath();
    userPoints.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    
    const gradient = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, radius);
    gradient.addColorStop(0, "rgba(213, 238, 187, 0.65)");
    gradient.addColorStop(1, "rgba(78, 159, 61, 0.5)");
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.strokeStyle = "rgba(78, 159, 61, 0.9)";
    ctx.lineWidth = 3;
    ctx.stroke();
    
    userPoints.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(78, 159, 61, 0.8)";
        ctx.fill();
        ctx.shadowBlur = 0; 
    });
}

function shareReport() {
    alert("【暖心治园档案卡片已生成】\n已成功复制卡片分享链接到您的剪贴板！您可以截图本卡片，分享至朋友圈或教研群。");
}

function init() {
    preloadImages();
    const btnStart = document.getElementById("btn-start");
    const btnIntroNext = document.getElementById("btn-intro-next");
    const btnRestart = document.getElementById("btn-restart");
    const btnShare = document.getElementById("btn-share");
    const soundToggle = document.getElementById("sound-toggle");
    
    if (btnStart) btnStart.addEventListener("click", startGame);
    if (btnIntroNext) btnIntroNext.addEventListener("click", startWeek);
    if (btnRestart) btnRestart.addEventListener("click", startWeek);
    if (btnShare) btnShare.addEventListener("click", shareReport);
    if (soundToggle) soundToggle.addEventListener("click", toggleSound);
}

window.addEventListener("DOMContentLoaded", init);
