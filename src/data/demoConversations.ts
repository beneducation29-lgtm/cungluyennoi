import { FollowUpQuestion, SentenceCorrection, SuggestedReply, VocabularyItem } from "../types";

export interface DemoStepResponse {
  reply: string;
  pinyin: string;
  translation: string;
  correction?: SentenceCorrection;
  vocabulary: VocabularyItem[];
  followUpQuestion: FollowUpQuestion;
  suggestions: SuggestedReply[];
  difficultyFeedback?: string;
}

export const DEMO_SCENARIO_DATA: Record<string, DemoStepResponse[]> = {
  "ordering-food": [
    {
      reply: "好的！请这边坐。这是我们的菜单。今天我们有新鲜的北京烤鸭和麻婆豆腐。请问您想喝点什么茶或饮料吗？",
      pinyin: "Hǎo de! Qǐng zhèbiān zuò. Zhè shì wǒmen de càidān. Jīntiān wǒmen yǒu xīnxiān de Běijīng kǎoyā hé mápó dòufu. Qǐngwèn nín xiǎng hē diǎn shénme chá huò yǐnliào ma?",
      translation: "Được chứ! Mời quý khách ngồi bên này. Đây là thực đơn của quán. Hôm nay có vịt quay Bắc Kinh và đậu phụ Ma Bà tươi ngon. Quý khách muốn dùng trà hay thức uống gì ạ?",
      followUpQuestion: {
        zh: "你想喝热乌龙茶还是冰绿茶？",
        py: "Nǐ xiǎng hē rè wūlóngchá háishi bīng lǜchá?",
        vi: "Bạn muốn uống trà ô long nóng hay trà xanh đá?",
      },
      suggestions: [
        {
          zh: "我要一杯热乌龙茶。",
          py: "Wǒ yào yì bēi rè wūlóngchá.",
          vi: "Cho tôi một ly trà ô long nóng.",
          type: "simple",
        },
        {
          zh: "请问有不甜的无糖茶或者温水吗？",
          py: "Qǐngwèn yǒu bù tián de wútáng chá huòzhě wēnshuǐ ma?",
          vi: "Cho hỏi có trà không đường không ngọt hoặc nước ấm không?",
          type: "detailed",
        },
        {
          zh: "今天有什么招牌饮品推荐吗？",
          py: "Jīntiān yǒu shénme zhāopái yǐnpǐn tuījiàn ma?",
          vi: "Hôm nay quán có đồ uống đặc trưng nào giới thiệu không?",
          type: "question",
        },
      ],
      vocabulary: [
        { id: "v1", word: "菜单", pinyin: "càidān", meaning: "thực đơn", saved: false, hskLevel: "HSK 2" },
        { id: "v2", word: "点菜", pinyin: "diǎn cài", meaning: "gọi món", saved: false, hskLevel: "HSK 2" },
        { id: "v3", word: "推荐", pinyin: "tuījiàn", meaning: "đề xuất, giới thiệu", saved: false, hskLevel: "HSK 3" },
      ],
      difficultyFeedback: "Rất tốt! Bạn đang bắt đầu giao tiếp tự nhiên trong ngữ cảnh nhà hàng.",
    },
    {
      reply: "没问题！两杯热乌龙茶。那菜品方面，麻婆豆腐需要微辣还是正常辣度呢？另外要不要配两碗米饭？",
      pinyin: "Méi wèntí! Liǎng bēi rè wūlóngchá. Nà càipǐn fāngmiàn, mápó dòufu xūyào wēilà háishi zhèngcháng làdù ne? Lìngwài yào bu yào pèi liǎng wǎn mǐfàn?",
      translation: "Không có vấn đề gì! Hai ly trà ô long nóng. Về phần món ăn, đậu phụ Ma Bà quý khách muốn cay nhẹ hay độ cay bình thường? Có cần thêm hai bát cơm trắng không ạ?",
      correction: {
        id: "c1",
        original: "我要两个乌龙茶。",
        corrected: "我要两杯乌龙茶。",
        pinyin: "Wǒ yào liǎng bēi wūlóngchá.",
        explanation: "Khi gọi trà hoặc nước uống trong ly/tách, tiếng Trung dùng lượng từ “杯” (bēi - ly/cốc) thay vì dùng “个” (gè).",
        errorType: "Lượng từ (Measure Word)",
        hskTip: "Lượng từ đồ uống: 一杯茶 (1 ly trà), 一瓶水 (1 chai nước).",
        timestamp: Date.now(),
      },
      followUpQuestion: {
        zh: "你平时吃辣的习惯怎么样？能吃麻辣吗？",
        py: "Nǐ píngshí chī là de xíguàn zěnmeyàng? Néng chī málà ma?",
        vi: "Thường ngày thói quen ăn cay của bạn thế nào? Ăn được tê cay không?",
      },
      suggestions: [
        {
          zh: "我们要微辣，加两碗米饭。",
          py: "Wǒmen yào wēilà, jiā liǎng wǎn mǐfàn.",
          vi: "Chúng tôi lấy cay the nhẹ, thêm 2 bát cơm trắng.",
          type: "simple",
        },
        {
          zh: "我不太能吃辣，请少放辣椒和花椒。",
          py: "Wǒ bú tài néng chī là, qǐng shǎo fàng làjiāo hé huājiāo.",
          vi: "Tôi không ăn được cay lắm, xin cho ít ớt và tiêu hoa tiêu thôi.",
          type: "detailed",
        },
        {
          zh: "麻婆豆腐大概需要等多久呢？",
          py: "Mápó dòufu dàgài xūyào děng duōjiǔ ne?",
          vi: "Đậu phụ Ma Bà khoảng bao lâu thì có ạ?",
          type: "question",
        },
      ],
      vocabulary: [
        { id: "v4", word: "微辣", pinyin: "wēilà", meaning: "cay nhẹ, cay the", saved: false, hskLevel: "HSK 2" },
        { id: "v5", word: "米饭", pinyin: "mǐfàn", meaning: "cơm trắng", saved: false, hskLevel: "HSK 1" },
        { id: "v6", word: "辣度", pinyin: "làdù", meaning: "độ cay", saved: false, hskLevel: "HSK 3" },
      ],
      difficultyFeedback: "Lưu ý sử dụng đúng lượng từ '杯' cho thức uống sẽ giúp câu nói tự nhiên như người bản xứ.",
    },
    {
      reply: "记下来了，少辣！菜马上为您准备，大概十分钟左右上齐。需要买单的时候随时叫我，支持微信或支付宝扫码支付哦。",
      pinyin: "Jì xiàlái le, shǎo là! Cài mǎshàng wèi nín zhǔnbèi, dàgài shí fēnzhōng zuǒyòu shàng qí. Xūyào mǎidān de shíhou suíshí jiào wǒ, zhīchí Wēixìn huò Zhīfùbǎo sǎomǎ zhīfù o.",
      translation: "Tôi ghi lại rồi, ít cay! Món ăn sẽ được chuẩn bị ngay, tầm 10 phút là lên đủ. Khi cần tính tiền xin cứ gọi tôi, quán có nhận quét mã WeChat hoặc Alipay ạ.",
      followUpQuestion: {
        zh: "请问您结账时需要开发票吗？",
        py: "Qǐngwèn nín jiézhàng shí xūyào kāi fāpiào ma?",
        vi: "Xin hỏi khi thanh toán bạn có cần xuất hóa đơn không?",
      },
      suggestions: [
        {
          zh: "好的，非常感谢！",
          py: "Hǎo de, fēicháng gǎnxiè!",
          vi: "Vâng, cảm ơn bạn rất nhiều!",
          type: "simple",
        },
        {
          zh: "不需要发票，一会儿我用微信扫码买单。",
          py: "Bù xūyào fāpiào, yíhuìr wǒ yòng Wēixìn sǎomǎ mǎidān.",
          vi: "Không cần hóa đơn đâu, lát nữa tôi quét mã WeChat thanh toán.",
          type: "detailed",
        },
        {
          zh: "请问店里的 Wi-Fi 密码是多少？",
          py: "Qǐngwèn diàn lǐ de Wi-Fi mìmǎ shì duōshao?",
          vi: "Cho hỏi mật khẩu Wi-Fi của quán là bao nhiêu?",
          type: "question",
        },
      ],
      vocabulary: [
        { id: "v7", word: "买单", pinyin: "mǎidān", meaning: "thanh toán, tính tiền", saved: false, hskLevel: "HSK 2" },
        { id: "v8", word: "发票", pinyin: "fāpiào", meaning: "hóa đơn", saved: false, hskLevel: "HSK 3" },
        { id: "v9", word: "扫码", pinyin: "sǎomǎ", meaning: "quét mã QR", saved: false, hskLevel: "HSK 3" },
      ],
      difficultyFeedback: "Hoàn thành xuất sắc vòng đối thoại gọi món ăn tại nhà hàng!",
    },
  ],
  "shopping": [
    {
      reply: "这件羊毛大衣原价五百元，今天店里搞周年庆活动，八折优惠只要四百元！面料非常舒服，你要不要试穿一下？",
      pinyin: "Zhè jiàn yángmáo dàyī yuánjià wǔbǎi yuán, jīntiān diànlǐ gǎo zhōunián qìng huódòng, bā zhé yōuhuì zhǐ yào sìbǎi yuán! Miànliào fēicháng shūfu, nǐ yào bu yào shìchuān yíxià?",
      translation: "Chiếc áo khoác dạ này giá gốc 500 tệ, hôm nay cửa hàng có sinh nhật giảm 20% còn 400 tệ thôi! Chất vải cực kỳ êm ái, bạn có muốn thử một chút không?",
      correction: {
        id: "c2",
        original: "我昨天买了一个衣服。",
        corrected: "我昨天买了一件衣服。",
        pinyin: "Wǒ zuótiān mǎi le yí jiàn yīfu.",
        explanation: "Quần áo thường sử dụng lượng từ “件” (jiàn), không dùng “个”. Ví dụ: 一件大衣 (một chiếc áo khoác), 一件衬衫 (một chiếc sơ mi).",
        errorType: "Lượng từ (Measure Word)",
        timestamp: Date.now(),
      },
      followUpQuestion: {
        zh: "你平时喜欢穿什么尺码？需要中号还是大号？",
        py: "Nǐ píngshí xǐhuan chuān shénme chǐmǎ? Xūyào zhōnghào háishi dàhào?",
        vi: "Bình thường bạn hay mặc size gì? Cần size vừa (M) hay size lớn (L)?",
      },
      suggestions: [
        {
          zh: "我想试穿一下中号。",
          py: "Wǒ xiǎng shìchuān yíxià zhōnghào.",
          vi: "Tôi muốn thử một chút size M.",
          type: "simple",
        },
        {
          zh: "四百块有点贵，三百五十块可以卖给我吗？",
          py: "Sìbǎi kuài yǒudiǎn guì, sānbǎi wǔshí kuài kěyǐ mài gěi wǒ ma?",
          vi: "400 tệ hơi đắt một chút, 350 tệ bạn có thể để lại cho tôi không?",
          type: "detailed",
        },
        {
          zh: "这件大衣还有别的颜色吗？比如米色或者黑色？",
          py: "Zhè jiàn dàyī hái yǒu bié de yánsè ma? Bǐrú mǐsè huòzhě hēisè?",
          vi: "Chiếc áo khoác này còn màu khác không? Ví dụ màu be hoặc đen?",
          type: "question",
        },
      ],
      vocabulary: [
        { id: "v10", word: "打折", pinyin: "dǎzhé", meaning: "giảm giá, chiết khấu", saved: false, hskLevel: "HSK 2" },
        { id: "v11", word: "试穿", pinyin: "shìchuān", meaning: "mặc thử", saved: false, hskLevel: "HSK 3" },
        { id: "v12", word: "尺码", pinyin: "chǐmǎ", meaning: "kích cỡ, size", saved: false, hskLevel: "HSK 3" },
      ],
      difficultyFeedback: "Tuyệt vời, bạn đã áp dụng mặc cả và hỏi kích cỡ rất thực tế!",
    },
    {
      reply: "三百五十元的话... 哎呀，老板今天心情好，就交你这个朋友，三百五十拿走吧！包装要袋子还是礼盒？",
      pinyin: "Sānbǎi wǔshí yuán de huà... Āiyā, lǎobǎn jīntiān xīnqíng hǎo, jiù jiāo nǐ zhè ge péngyou, sānbǎi wǔshí názǒu ba! Bāozhuāng yào dàizi háishi lǐhé?",
      translation: "350 tệ à... Ây chà, hôm nay ông chủ vui vẻ, coi như kết bạn với bạn, 350 tệ lấy luôn nhé! Bạn cần đóng túi xách hay hộp quà?",
      followUpQuestion: {
        zh: "你打算自己穿还是买来送给朋友？",
        py: "Nǐ dǎsuàn zìjǐ chuān háishi mǎi lái sòng gěi péngyou?",
        vi: "Bạn dự định mua mặc hay mua tặng bạn bè?",
      },
      suggestions: [
        {
          zh: "我自己穿，拿普通纸袋就可以了。",
          py: "Wǒ zìjǐ chuān, ná pǔtōng zhǐdài jiù kěyǐ le.",
          vi: "Tôi tự mặc, lấy túi giấy bình thường là được rồi.",
          type: "simple",
        },
        {
          zh: "太感谢老板了！能帮我用礼盒包装一下吗？",
          py: "Tài gǎnxiè lǎobǎn le! Néng bāng wǒ yòng lǐhé bāozhuāng yíxià ma?",
          vi: "Cảm ơn ông chủ nhiều nhé! Có thể giúp tôi đóng hộp quà được không?",
          type: "detailed",
        },
        {
          zh: "请问如果尺码不合适，几天之内可以调换？",
          py: "Qǐngwèn rúguǒ chǐmǎ bù héshì, jǐ tiān zhīnèi kěyǐ tiáohuàn?",
          vi: "Cho hỏi nếu size không vừa thì trong vòng mấy ngày được đổi?",
          type: "question",
        },
      ],
      vocabulary: [
        { id: "v13", word: "包装", pinyin: "bāozhuāng", meaning: "đóng gói", saved: false, hskLevel: "HSK 3" },
        { id: "v14", word: "礼盒", pinyin: "lǐhé", meaning: "hộp quà tặng", saved: false, hskLevel: "HSK 3" },
        { id: "v15", word: "调换", pinyin: "tiáohuàn", meaning: "đổi (hàng)", saved: false, hskLevel: "HSK 4" },
      ],
    },
  ],
  "introduce-yourself": [
    {
      reply: "很高兴认识你！河内是一个非常美丽且充满历史气息的城市，那里的越南米粉在世界上也很有名。你学习中文多长时间了？",
      pinyin: "Hěn gāoxìng rènshi nǐ! Hénèi shì yí gè fēicháng měilì qiě chōngmǎn lìshǐ qìxī de chéngshì, nàlǐ de Yuènán mǐfěn zài shìjiè shang yě hěn yǒumíng. Nǐ xuéxí Zhōngwén duō cháng shíjiān le?",
      translation: "Rất vui được quen biết bạn! Hà Nội là một thành phố rất đẹp và đậm đà dấu ấn lịch sử, món phở Việt Nam ở đó rất nổi tiếng trên thế giới. Bạn đã học tiếng Trung được bao lâu rồi?",
      correction: {
        id: "c3",
        original: "我学中文六个月。",
        corrected: "我学了六个月的中文了。",
        pinyin: "Wǒ xué le liù gè yuè de Zhōngwén le.",
        explanation: "Khi diễn tả một hành động kéo dài liên tục từ quá khứ đến hiện tại và còn tiếp diễn, dùng cấu trúc: 'Động từ + 了 + Thời lượng + (的) + Tân ngữ + 了'.",
        errorType: "Ngữ pháp (Grammar)",
        timestamp: Date.now(),
      },
      followUpQuestion: {
        zh: "你学习中文是为了工作、去中国旅游，还是个人兴趣？",
        py: "Nǐ xuéxí Zhōngwén shì wèile gōngzuò, qù Zhōngguó lǚyóu, háishi gèrén xìngqù?",
        vi: "Bạn học tiếng Trung là vì công việc, du lịch Trung Quốc, hay sở thích cá nhân?",
      },
      suggestions: [
        {
          zh: "我学中文是因为工作需要。",
          py: "Wǒ xué Zhōngwén shì yīnwèi gōngzuò xūyào.",
          vi: "Tôi học tiếng Trung vì nhu cầu công việc.",
          type: "simple",
        },
        {
          zh: "我对中国文化和美食很感兴趣，以后想去北京旅游。",
          py: "Wǒ duì Zhōngguó wénhuà hé měishí hěn gǎn xìngqù, yǐhòu xiǎng qù Běijīng lǚyóu.",
          vi: "Tôi rất thích văn hóa và ẩm thực Trung Hoa, sau này muốn đi du lịch Bắc Kinh.",
          type: "detailed",
        },
        {
          zh: "老师，你觉得对我来说提高口语最好的方法是什么？",
          py: "Lǎoshī, nǐ juéde duì wǒ lái shuō tígāo kǒuyǔ zuì hǎo de fāngfǎ shì shénme?",
          vi: "Thưa cô, theo cô phương pháp tốt nhất để nâng cao khẩu ngữ cho em là gì?",
          type: "question",
        },
      ],
      vocabulary: [
        { id: "v16", word: "认识", pinyin: "rènshi", meaning: "quen biết, nhận biết", saved: false, hskLevel: "HSK 1" },
        { id: "v17", word: "时间", pinyin: "shíjiān", meaning: "thời gian", saved: false, hskLevel: "HSK 2" },
        { id: "v18", word: "兴趣", pinyin: "xìngqù", meaning: "hứng thú, sở thích", saved: false, hskLevel: "HSK 3" },
      ],
      difficultyFeedback: "Cách bạn giới thiệu bản thân rất trôi chảy, phản xạ nhanh và âm chuẩn.",
    },
  ],
};

export const GENERAL_DEMO_RESPONSES: DemoStepResponse[] = [
  {
    reply: "你的中文发音非常清晰！请继续跟我分享你的想法，不用担心语法错误，多说多练是提高口语最快的方法。",
    pinyin: "Nǐ de Zhōngwén fāyīn fēicháng qīngxī! Qǐng jìxù gēn wǒ fēnxiǎng nǐ de xiǎngfǎ, bú yòng dānxīn yǔfǎ cuòwù, duō shuō duō liàn shì tígāo kǒuyǔ zuì kuài de fāngfǎ.",
    translation: "Phát âm tiếng Trung của bạn rất rõ ràng! Hãy tiếp tục chia sẻ suy nghĩ nhé, đừng ngại ngữ pháp sai, nói nhiều luyện nhiều là bí quyết tiến bộ khẩu ngữ nhanh nhất.",
    followUpQuestion: {
      zh: "你平时一般在什么时间练习中文听力和口语？",
      py: "Nǐ píngshí yībān zài shénme shíjiān liànxí Zhōngwén tīnglì hé kǒuyǔ?",
      vi: "Bình thường bạn hay luyện nghe và nói tiếng Trung vào thời gian nào?",
    },
    suggestions: [
      {
        zh: "我每天晚上练习半个小时。",
        py: "Wǒ měitiān wǎnshang liànxí bàn gè xiǎoshí.",
        vi: "Mỗi tối tôi luyện tập nửa tiếng.",
        type: "simple",
      },
      {
        zh: "我经常在上下班坐车的时候听中文播客。",
        py: "Wǒ jīngcháng zài shàng-xià bān zuòchē de shíhou tīng Zhōngwén bōkè.",
        vi: "Tôi thường nghe podcast tiếng Trung khi đi xe buýt đi làm.",
        type: "detailed",
      },
      {
        zh: "老师，您有什么好听的中文播客推荐吗？",
        py: "Lǎoshī, nín yǒu shénme hǎotīng de Zhōngwén bōkè tuījiàn ma?",
        vi: "Thưa cô, cô có kênh podcast tiếng Trung nào hay để giới thiệu không?",
        type: "question",
      },
    ],
    vocabulary: [
      { id: "v_gen1", word: "发音", pinyin: "fāyīn", meaning: "phát âm", saved: false, hskLevel: "HSK 2" },
      { id: "v_gen2", word: "流利", pinyin: "liúlì", meaning: "lưu loát, trôi chảy", saved: false, hskLevel: "HSK 3" },
      { id: "v_gen3", word: "提高", pinyin: "tígāo", meaning: "nâng cao, tiến bộ", saved: false, hskLevel: "HSK 3" },
    ],
  },
  {
    reply: "这个回答很有深度！我注意到了你用词很准确。如果你能结合日常生活举一个小例子，表达会更加生动自然。",
    pinyin: "Zhè ge huídá hěn yǒu shēndù! Wǒ zhùyì dào le nǐ yòngcí hěn zhǔnquè. Rúguǒ nǐ néng jiéhé rìcháng shēnghuó jǔ yí gè xiǎo lìzi, biǎodá huì gèngjiā shēngdòng zìrán.",
    translation: "Câu trả lời này rất sâu sắc! Cô nhận thấy bạn dùng từ rất chính xác. Nếu kết hợp thêm ví dụ nhỏ trong đời sống thường ngày thì cách diễn đạt sẽ càng thêm sinh động và tự nhiên.",
    followUpQuestion: {
      zh: "你能结合你自己的一件生活小事举个例子吗？",
      py: "Nǐ néng jiéhé nǐ zìjǐ de yí jiàn shēnghuó xiǎoshì jǔ gè lìzi ma?",
      vi: "Bạn có thể kết hợp kể một chuyện nhỏ trong đời sống của mình để làm ví dụ không?",
    },
    suggestions: [
      {
        zh: "比如，我上周去超市买菜的时候...",
        py: "Bǐrú, wǒ shàng zhōu qù chāoshì mǎi cài de shíhou...",
        vi: "Ví dụ như tuần trước khi tôi đi siêu thị mua thức ăn...",
        type: "simple",
      },
      {
        zh: "我记得有一次我和中国同事交流，遇到过类似的情况。",
        py: "Wǒ jìde yǒu yí cì wǒ hé Zhōngguó tóngshì jiāoliú, yùdào guò lèisì de qíngkuàng.",
        vi: "Tôi nhớ có một lần giao lưu với đồng nghiệp người Trung Quốc, từng gặp tình huống tương tự.",
        type: "detailed",
      },
      {
        zh: "请问在这句话里，用“举例子”还是“打个比方”更地道？",
        py: "Qǐngwèn zài zhè jù huà lǐ, yòng 'jǔ lìzi' háishi 'dǎ gè bǐfang' gèng dìdao?",
        vi: "Cho hỏi trong câu này dùng 'jǔ lìzi' hay 'dǎ gè bǐfang' thì chuẩn tự nhiên hơn?",
        type: "question",
      },
    ],
    vocabulary: [
      { id: "v_gen4", word: "准确", pinyin: "zhǔnquè", meaning: "chuẩn xác, chính xác", saved: false, hskLevel: "HSK 4" },
      { id: "v_gen5", word: "生动", pinyin: "shēngdòng", meaning: "sinh động", saved: false, hskLevel: "HSK 4" },
      { id: "v_gen6", word: "地道", pinyin: "dìdao", meaning: "chuẩn bản ngữ, thuần chất", saved: false, hskLevel: "HSK 4" },
    ],
  },
];
