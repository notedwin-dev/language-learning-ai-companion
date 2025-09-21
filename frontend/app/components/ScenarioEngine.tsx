'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundIcon, MicrophoneIcon } from './Icons';

interface DialogueOption {
  id: string;
  text: string;
  pronunciation?: string;
  translation: string;
  points: number;
  nextScene?: string;
  culturalNote?: string;
}

interface SceneData {
  id: string;
  background: string;
  npcName: string;
  npcEmoji: string;
  npcDialogue: string;
  npcPronunciation?: string;
  npcTranslation: string;
  options: DialogueOption[];
  learningPoints?: string[];
  vocabulary?: Array<{ word: string; pronunciation?: string; meaning: string }>;
}

interface ScenarioEngineProps {
  language: 'mandarin' | 'malay' | 'cantonese';
  scenario: 'restaurant' | 'market' | 'directions';
  onComplete: (score: number) => void;
  onExit: () => void;
}

const ScenarioEngine: React.FC<ScenarioEngineProps> = ({ 
  language, 
  scenario, 
  onComplete, 
  onExit 
}) => {
  const [currentScene, setCurrentScene] = useState<string>("start");
  const [score, setScore] = useState<number>(0);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ speaker: string; text: string; translation: string }>
  >([]);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [completedScenes, setCompletedScenes] = useState<Set<string>>(
    new Set()
  );
  const [autoPlayEnabled, setAutoPlayEnabled] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(
    null
  );
  const [pronunciationFeedback, setPronunciationFeedback] =
    useState<string>("");
  const [isCheckingPronunciation, setIsCheckingPronunciation] =
    useState<boolean>(false);
  const [showPronunciationPanel, setShowPronunciationPanel] =
    useState<boolean>(false);
  const [practiceText, setPracticeText] = useState<{
    text: string;
    pronunciation?: string;
    translation: string;
    source: string;
  } | null>(null);
  const [showLearningMode, setShowLearningMode] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<DialogueOption | null>(
    null
  );
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [isGeneratingExplanation, setIsGeneratingExplanation] =
    useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const lastPlayedSceneRef = useRef<string>("");

  // Get scenario data based on language and scenario type
  const getScenarioData = (): Record<string, SceneData> => {
    if (scenario === "restaurant" && language === "mandarin") {
      return {
        start: {
          id: "start",
          background: "🏮 Sichuan Restaurant Interior",
          npcName: "Host",
          npcEmoji: "👨‍💼",
          npcDialogue: "您好！欢迎光临川菜馆！几位？",
          npcPronunciation: "Nín hǎo! Huānyíng guānglín chuāncài guǎn! Jǐ wèi?",
          npcTranslation:
            "Hello! Welcome to our Sichuan restaurant! How many people?",
          options: [
            {
              id: "two_people",
              text: "两位，谢谢。",
              pronunciation: "Liǎng wèi, xièxie.",
              translation: "Two people, thank you.",
              points: 10,
              nextScene: "seating",
            },
            {
              id: "one_person",
              text: "就我一个人。",
              pronunciation: "Jiù wǒ yī gè rén.",
              translation: "Just me alone.",
              points: 10,
              nextScene: "seating",
            },
            {
              id: "ask_wait",
              text: "需要等位吗？",
              pronunciation: "Xūyào dǒng wèi ma?",
              translation: "Do we need to wait for a table?",
              points: 15,
              nextScene: "seating",
              culturalNote:
                "Asking about wait times shows consideration and is appreciated.",
            },
          ],
          vocabulary: [
            { word: "欢迎", pronunciation: "huānyíng", meaning: "welcome" },
            {
              word: "几位",
              pronunciation: "jǐ wèi",
              meaning: "how many people",
            },
            {
              word: "等位",
              pronunciation: "dǒng wèi",
              meaning: "wait for a table",
            },
          ],
        },
        seating: {
          id: "seating",
          background: "🏮 Being Seated",
          npcName: "Host",
          npcEmoji: "👨‍💼",
          npcDialogue: "好的，请跟我来。您想坐靠窗的位子吗？",
          npcPronunciation:
            "Hǎo de, qǐng gēn wǒ lái. Nín xiǎng zuò kào chuāng de wèizi ma?",
          npcTranslation:
            "Alright, please follow me. Would you like to sit by the window?",
          options: [
            {
              id: "window_yes",
              text: "好的，靠窗很好。",
              pronunciation: "Hǎo de, kào chuāng hěn hǎo.",
              translation: "Yes, by the window is great.",
              points: 10,
              nextScene: "menu",
            },
            {
              id: "window_no",
              text: "不用了，任何位子都可以。",
              pronunciation: "Bù yòng le, rènhé wèizi dōu kěyǐ.",
              translation: "No need, any seat is fine.",
              points: 10,
              nextScene: "menu",
            },
            {
              id: "ask_quiet",
              text: "有安静一点的位子吗？",
              pronunciation: "Yǒu ānjìng yīdiǎn de wèizi ma?",
              translation: "Do you have a quieter spot?",
              points: 15,
              nextScene: "menu",
              culturalNote:
                "Asking for specific seating preferences is perfectly acceptable.",
            },
          ],
        },
        menu: {
          id: "menu",
          background: "📋 Looking at Menu",
          npcName: "Server",
          npcEmoji: "👩‍🍳",
          npcDialogue:
            "您好！我是您的服务员。您想点些什么？我们的麻婆豆腐和宫保鸡丁很有名。",
          npcPronunciation:
            "Nín hǎo! Wǒ shì nín de fúwùyuán. Nín xiǎng diǎn xiē shénme? Wǒmen de mápó dòufu hé gōngbǎo jīdīng hěn yǒumíng.",
          npcTranslation:
            "Hello! I'm your server. What would you like to order? Our Mapo Tofu and Kung Pao Chicken are famous.",
          options: [
            {
              id: "ask_spicy",
              text: "麻婆豆腐很辣吗？",
              pronunciation: "Mápó dòufu hěn là ma?",
              translation: "Is the Mapo Tofu very spicy?",
              points: 15,
              nextScene: "spice_level",
            },
            {
              id: "order_kungpao",
              text: "我要宫保鸡丁。",
              pronunciation: "Wǒ yào gōngbǎo jīdīng.",
              translation: "I'll have the Kung Pao Chicken.",
              points: 10,
              nextScene: "drinks",
            },
            {
              id: "ask_recommend",
              text: "您能推荐一些不太辣的菜吗？",
              pronunciation: "Nín néng tuījiàn yīxiē bù tài là de cài ma?",
              translation:
                "Can you recommend some dishes that aren't too spicy?",
              points: 20,
              nextScene: "recommendations",
              culturalNote:
                "Asking for recommendations shows respect for local expertise.",
            },
          ],
          vocabulary: [
            {
              word: "服务员",
              pronunciation: "fúwùyuán",
              meaning: "server/waiter",
            },
            {
              word: "点菜",
              pronunciation: "diǎn cài",
              meaning: "to order food",
            },
            { word: "推荐", pronunciation: "tuījiàn", meaning: "to recommend" },
            { word: "辣", pronunciation: "là", meaning: "spicy" },
          ],
        },
        spice_level: {
          id: "spice_level",
          background: "🌶️ Discussing Spice Level",
          npcName: "Server",
          npcEmoji: "👩‍🍳",
          npcDialogue:
            "麻婆豆腐确实比较辣。我们可以做得不那么辣，您觉得怎么样？",
          npcPronunciation:
            "Mápó dòufu quèshí bǐjiào là. Wǒmen kěyǐ zuò de bù nàme là, nín juéde zěnmeyàng?",
          npcTranslation:
            "Mapo Tofu is indeed quite spicy. We can make it less spicy, what do you think?",
          options: [
            {
              id: "less_spicy",
              text: "好的，请做得不那么辣。",
              pronunciation: "Hǎo de, qǐng zuò de bù nàme là.",
              translation: "Okay, please make it less spicy.",
              points: 15,
              nextScene: "drinks",
            },
            {
              id: "try_spicy",
              text: "没关系，我想试试正宗的味道。",
              pronunciation: "Méi guānxi, wǒ xiǎng shìshi zhèngzōng de wèidào.",
              translation: "It's okay, I want to try the authentic taste.",
              points: 20,
              nextScene: "drinks",
              culturalNote:
                "Appreciating authentic flavors is highly respected in Chinese culture.",
            },
          ],
        },
        recommendations: {
          id: "recommendations",
          background: "📖 Getting Recommendations",
          npcName: "Server",
          npcEmoji: "👩‍🍳",
          npcDialogue: "当然！我推荐我们的糖醋里脊和白切鸡，都不辣，味道很好。",
          npcPronunciation:
            "Dāngrán! Wǒ tuījiàn wǒmen de tángcù lǐjǐ hé báiqiē jī, dōu bù là, wèidào hěn hǎo.",
          npcTranslation:
            "Of course! I recommend our Sweet and Sour Pork and White Cut Chicken, both are not spicy and taste great.",
          options: [
            {
              id: "order_sweet_sour",
              text: "那我要糖醋里脊。",
              pronunciation: "Nà wǒ yào tángcù lǐjǐ.",
              translation: "Then I'll have the Sweet and Sour Pork.",
              points: 15,
              nextScene: "drinks",
            },
            {
              id: "ask_ingredients",
              text: "白切鸡是怎么做的？",
              pronunciation: "Báiqiē jī shì zěnme zuò de?",
              translation: "How is the White Cut Chicken prepared?",
              points: 20,
              nextScene: "explanation",
            },
          ],
        },
        drinks: {
          id: "drinks",
          background: "🥤 Ordering Drinks",
          npcName: "Server",
          npcEmoji: "👩‍🍳",
          npcDialogue: "好的。您想喝点什么？我们有茶，果汁，还有啤酒。",
          npcPronunciation:
            "Hǎo de. Nín xiǎng hē diǎn shénme? Wǒmen yǒu chá, guǒzhī, hái yǒu píjiǔ.",
          npcTranslation:
            "Alright. What would you like to drink? We have tea, juice, and beer.",
          options: [
            {
              id: "order_tea",
              text: "我要一壶茉莉花茶。",
              pronunciation: "Wǒ yào yī hú mòlì huā chá.",
              translation: "I'll have a pot of jasmine tea.",
              points: 15,
              nextScene: "payment",
              culturalNote:
                "Tea is a traditional and respectful choice with Chinese meals.",
            },
            {
              id: "order_beer",
              text: "给我一瓶青岛啤酒。",
              pronunciation: "Gěi wǒ yī píng qīngdǎo píjiǔ.",
              translation: "Give me a bottle of Tsingtao beer.",
              points: 10,
              nextScene: "payment",
            },
            {
              id: "ask_tea_types",
              text: "你们有什么茶？",
              pronunciation: "Nǐmen yǒu shénme chá?",
              translation: "What kinds of tea do you have?",
              points: 20,
              nextScene: "tea_selection",
            },
          ],
          vocabulary: [
            { word: "茶", pronunciation: "chá", meaning: "tea" },
            { word: "果汁", pronunciation: "guǒzhī", meaning: "juice" },
            { word: "啤酒", pronunciation: "píjiǔ", meaning: "beer" },
            {
              word: "茉莉花茶",
              pronunciation: "mòlì huā chá",
              meaning: "jasmine tea",
            },
          ],
        },
        tea_selection: {
          id: "tea_selection",
          background: "🍵 Tea Varieties",
          npcName: "Server",
          npcEmoji: "👩‍🍳",
          npcDialogue:
            "我们有茉莉花茶，普洱茶，铁观音，还有龙井茶。哪种您比较喜欢？",
          npcPronunciation:
            "Wǒmen yǒu mòlì huā chá, pǔ'ěr chá, tiěguānyīn, hái yǒu lóngjǐng chá. Nǎ zhǒng nín bǐjiào xǐhuān?",
          npcTranslation:
            "We have jasmine tea, pu-erh tea, tieguanyin, and longjing tea. Which one do you prefer?",
          options: [
            {
              id: "choose_longjing",
              text: "龙井茶听起来不错。",
              pronunciation: "Lóngjǐng chá tīng qǐlái bùcuò.",
              translation: "Longjing tea sounds good.",
              points: 20,
              nextScene: "payment",
              culturalNote:
                "Longjing is a famous green tea from Hangzhou, showing good taste.",
            },
            {
              id: "choose_puer",
              text: "普洱茶可以帮助消化吗？",
              pronunciation: "Pǔ'ěr chá kěyǐ bāngzhù xiāohuà ma?",
              translation: "Can pu-erh tea help with digestion?",
              points: 25,
              nextScene: "tea_benefits",
            },
          ],
        },
        tea_benefits: {
          id: "tea_benefits",
          background: "🌱 Tea Benefits",
          npcName: "Server",
          npcEmoji: "👩‍🍳",
          npcDialogue: "对的！普洱茶确实有助于消化，特别是吃了油腻的食物之后。",
          npcPronunciation:
            "Duì de! Pǔ'ěr chá quèshí yǒuzhù yú xiāohuà, tèbié shì chī le yóunì de shíwù zhīhòu.",
          npcTranslation:
            "Yes! Pu-erh tea indeed helps with digestion, especially after eating greasy food.",
          options: [
            {
              id: "order_puer",
              text: "那就普洱茶吧。",
              pronunciation: "Nà jiù pǔ'ěr chá ba.",
              translation: "Then I'll have pu-erh tea.",
              points: 15,
              nextScene: "payment",
            },
          ],
        },
        explanation: {
          id: "explanation",
          background: "👨‍🍳 Chef Explains",
          npcName: "Server",
          npcEmoji: "👩‍🍳",
          npcDialogue:
            "白切鸡是用白水煮熟的鸡肉，然后配上蘸料。非常嫩滑，很健康。",
          npcPronunciation:
            "Báiqiē jī shì yòng bái shuǐ zhǔ shú de jīròu, ránhòu pèi shàng zhàn liào. Fēicháng nèn huá, hěn jiànkāng.",
          npcTranslation:
            "White cut chicken is chicken boiled in plain water, then served with dipping sauce. Very tender and healthy.",
          options: [
            {
              id: "order_white_chicken",
              text: "听起来很好，我要白切鸡。",
              pronunciation: "Tīng qǐlái hěn hǎo, wǒ yào báiqiē jī.",
              translation: "Sounds great, I'll have the white cut chicken.",
              points: 20,
              nextScene: "drinks",
            },
            {
              id: "ask_sauce",
              text: "蘸料是什么？",
              pronunciation: "Zhàn liào shì shénme?",
              translation: "What is the dipping sauce?",
              points: 15,
              nextScene: "sauce_explanation",
            },
          ],
        },
        sauce_explanation: {
          id: "sauce_explanation",
          background: "🥢 Sauce Details",
          npcName: "Server",
          npcEmoji: "👩‍🍳",
          npcDialogue: "蘸料是用生抽，香油，姜丝和葱花调制的。味道很鲜美。",
          npcPronunciation:
            "Zhàn liào shì yòng shēng chōu, xiāng yóu, jiāng sī hé cōng huā tiáozhì de. Wèidào hěn xiānměi.",
          npcTranslation:
            "The dipping sauce is made with light soy sauce, sesame oil, ginger strips and scallions. It's very flavorful.",
          options: [
            {
              id: "sounds_good",
              text: "那我要白切鸡。",
              pronunciation: "Nà wǒ yào báiqiē jī.",
              translation: "Then I'll have the white cut chicken.",
              points: 15,
              nextScene: "drinks",
            },
          ],
        },
        payment: {
          id: "payment",
          background: "💳 Paying the Bill",
          npcName: "Server",
          npcEmoji: "👩‍🍳",
          npcDialogue: "好的，您的菜马上就好。用餐愉快！稍后我会把账单给您。",
          npcPronunciation:
            "Hǎo de, nín de cài mǎshàng jiù hǎo. Yòngcān yúkuài! Shāohòu wǒ huì bǎ zhàngdān gěi nín.",
          npcTranslation:
            "Alright, your food will be ready soon. Enjoy your meal! I'll bring you the bill later.",
          options: [
            {
              id: "thank_you",
              text: "谢谢您的服务！",
              pronunciation: "Xièxie nín de fúwù!",
              translation: "Thank you for your service!",
              points: 15,
              nextScene: "complete",
            },
            {
              id: "ask_payment",
              text: "我可以用信用卡付款吗？",
              pronunciation: "Wǒ kěyǐ yòng xìnyòngkǎ fùkuǎn ma?",
              translation: "Can I pay with a credit card?",
              points: 20,
              nextScene: "complete",
            },
          ],
        },
      };
    }

    // Malay Restaurant Scenario
    if (scenario === "restaurant" && language === "malay") {
      return {
        start: {
          id: "start",
          background: "🏪 Mamak Stall",
          npcName: "Mamak Uncle",
          npcEmoji: "👨‍🍳",
          npcDialogue: "Selamat petang! Apa mau makan hari ini?",
          npcTranslation: "Good afternoon! What do you want to eat today?",
          options: [
            {
              id: "greeting",
              text: "Selamat petang! Saya mau lihat menu dulu.",
              translation: "Good afternoon! I want to look at the menu first.",
              points: 10,
              nextScene: "menu",
            },
            {
              id: "direct_order",
              text: "Saya mau roti canai dan teh tarik.",
              translation: "I want roti canai and teh tarik.",
              points: 15,
              nextScene: "confirmation",
            },
            {
              id: "ask_recommendation",
              text: "Apa yang sedap di sini?",
              translation: "What's delicious here?",
              points: 20,
              nextScene: "recommendations",
              culturalNote:
                "Asking for recommendations shows you value local knowledge.",
            },
          ],
          vocabulary: [
            { word: "selamat petang", meaning: "good afternoon" },
            { word: "makan", meaning: "to eat" },
            { word: "sedap", meaning: "delicious" },
            { word: "menu", meaning: "menu" },
          ],
        },
        menu: {
          id: "menu",
          background: "📋 Looking at Mamak Menu",
          npcName: "Mamak Uncle",
          npcEmoji: "👨‍🍳",
          npcDialogue:
            "Ini menu kita. Nasi lemak, mee goreng, roti canai semua ada. Apa yang awak mau?",
          npcTranslation:
            "Here's our menu. We have nasi lemak, mee goreng, roti canai, everything. What do you want?",
          options: [
            {
              id: "order_nasi_lemak",
              text: "Saya mau nasi lemak dengan ayam goreng.",
              translation: "I want nasi lemak with fried chicken.",
              points: 15,
              nextScene: "drinks",
            },
            {
              id: "order_mee_goreng",
              text: "Mee goreng pedas boleh?",
              translation: "Can I have spicy mee goreng?",
              points: 15,
              nextScene: "spice_level",
            },
            {
              id: "ask_halal",
              text: "Makanan ini halal kan?",
              translation: "This food is halal, right?",
              points: 10,
              nextScene: "halal_confirmation",
              culturalNote:
                "Asking about halal food shows cultural awareness in Malaysia.",
            },
          ],
          vocabulary: [
            { word: "nasi lemak", meaning: "coconut rice dish" },
            { word: "mee goreng", meaning: "fried noodles" },
            { word: "ayam goreng", meaning: "fried chicken" },
            { word: "pedas", meaning: "spicy" },
          ],
        },
        confirmation: {
          id: "confirmation",
          background: "✅ Order Confirmation",
          npcName: "Mamak Uncle",
          npcEmoji: "👨‍🍳",
          npcDialogue: "Roti canai dan teh tarik. Pedas tak nak?",
          npcTranslation: "Roti canai and teh tarik. Do you want it spicy?",
          options: [
            {
              id: "no_spicy",
              text: "Tak pedas, terima kasih.",
              translation: "Not spicy, thank you.",
              points: 10,
              nextScene: "drinks",
            },
            {
              id: "little_spicy",
              text: "Pedas sikit boleh.",
              translation: "A little spicy is okay.",
              points: 15,
              nextScene: "drinks",
            },
          ],
        },
        recommendations: {
          id: "recommendations",
          background: "⭐ Uncle's Recommendations",
          npcName: "Mamak Uncle",
          npcEmoji: "👨‍🍳",
          npcDialogue:
            "Kalau first time datang, mee goreng mamak dan roti pisang memang sedap. Nasi lemak pun boleh tahan.",
          npcTranslation:
            "If it's your first time here, mee goreng mamak and roti pisang are really delicious. Nasi lemak is also quite good.",
          options: [
            {
              id: "order_mee_goreng_mamak",
              text: "Mee goreng mamak macam mana?",
              translation: "What's mee goreng mamak like?",
              points: 15,
              nextScene: "mee_goreng_explanation",
            },
            {
              id: "order_roti_pisang",
              text: "Roti pisang untuk dessert boleh?",
              translation: "Can I have roti pisang for dessert?",
              points: 20,
              nextScene: "dessert_order",
              culturalNote:
                "Ordering dessert shows you understand Malaysian dining culture.",
            },
            {
              id: "trust_recommendation",
              text: "Okay, saya ikut recommendation uncle.",
              translation: "Okay, I'll follow uncle's recommendation.",
              points: 25,
              nextScene: "uncle_choice",
              culturalNote:
                "Trusting the mamak uncle shows respect and often gets you the best food!",
            },
          ],
        },
        mee_goreng_explanation: {
          id: "mee_goreng_explanation",
          background: "🍜 About Mee Goreng",
          npcName: "Mamak Uncle",
          npcEmoji: "👨‍🍳",
          npcDialogue:
            "Mee goreng mamak ada sayur, telur, tauhu, dan sambal kicap. Rasa manis sikit, memang best!",
          npcTranslation:
            "Mee goreng mamak has vegetables, egg, tofu, and sweet soy sauce sambal. It's slightly sweet, really good!",
          options: [
            {
              id: "order_mee_goreng",
              text: "Sounds good! Saya nak mee goreng mamak.",
              translation: "Sounds good! I want mee goreng mamak.",
              points: 20,
              nextScene: "drinks",
            },
          ],
        },
        uncle_choice: {
          id: "uncle_choice",
          background: "👨‍🍳 Uncle's Special Choice",
          npcName: "Mamak Uncle",
          npcEmoji: "👨‍🍳",
          npcDialogue:
            "Bagus! Saya buatkan nasi lemak special dengan ayam rendang dan sambal sotong. Confirm sedap!",
          npcTranslation:
            "Good! I'll make you special nasi lemak with rendang chicken and sambal squid. Guaranteed delicious!",
          options: [
            {
              id: "excited",
              text: "Wah, terima kasih uncle!",
              translation: "Wow, thank you uncle!",
              points: 20,
              nextScene: "drinks",
            },
          ],
        },
        spice_level: {
          id: "spice_level",
          background: "🌶️ Spice Level",
          npcName: "Mamak Uncle",
          npcEmoji: "👨‍🍳",
          npcDialogue: "Pedas macam mana? Biasa, pedas, atau extra pedas?",
          npcTranslation: "How spicy? Normal, spicy, or extra spicy?",
          options: [
            {
              id: "normal_spicy",
              text: "Pedas biasa je.",
              translation: "Just normal spicy.",
              points: 10,
              nextScene: "drinks",
            },
            {
              id: "very_spicy",
              text: "Extra pedas boleh tahan tak?",
              translation: "Can I handle extra spicy?",
              points: 20,
              nextScene: "spice_warning",
            },
          ],
        },
        spice_warning: {
          id: "spice_warning",
          background: "🔥 Spice Warning",
          npcName: "Mamak Uncle",
          npcEmoji: "👨‍🍳",
          npcDialogue:
            "Wah, extra pedas memang panas! Orang Malaysia pun ada yang tak tahan. Sure ka?",
          npcTranslation:
            "Wow, extra spicy is really hot! Even some Malaysians can't handle it. Are you sure?",
          options: [
            {
              id: "challenge_accepted",
              text: "Challenge accepted! Extra pedas!",
              translation: "Challenge accepted! Extra spicy!",
              points: 30,
              nextScene: "drinks",
              culturalNote:
                "Taking on the spice challenge shows courage and adventurous spirit!",
            },
            {
              id: "play_safe",
              text: "Hmm, maybe pedas biasa lebih baik.",
              translation: "Hmm, maybe normal spicy is better.",
              points: 15,
              nextScene: "drinks",
            },
          ],
        },
        drinks: {
          id: "drinks",
          background: "🥤 Ordering Drinks",
          npcName: "Mamak Uncle",
          npcEmoji: "👨‍🍳",
          npcDialogue: "Mau minum apa? Teh tarik, kopi, atau air kosong?",
          npcTranslation:
            "What do you want to drink? Teh tarik, coffee, or plain water?",
          options: [
            {
              id: "teh_tarik",
              text: "Teh tarik kurang manis, terima kasih.",
              translation: "Teh tarik less sweet, thank you.",
              points: 20,
              nextScene: "payment",
              culturalNote:
                "Specifying sweetness level shows you know local preferences.",
            },
            {
              id: "kopi",
              text: "Kopi O panas satu.",
              translation: "One hot black coffee.",
              points: 15,
              nextScene: "payment",
            },
            {
              id: "air_kosong",
              text: "Air kosong sejuk.",
              translation: "Cold plain water.",
              points: 10,
              nextScene: "payment",
            },
            {
              id: "ask_drinks",
              text: "Apa drinks yang popular di sini?",
              translation: "What drinks are popular here?",
              points: 15,
              nextScene: "drinks_recommendation",
            },
          ],
          vocabulary: [
            { word: "teh tarik", meaning: "pulled tea (milk tea)" },
            { word: "kopi", meaning: "coffee" },
            { word: "kurang manis", meaning: "less sweet" },
            { word: "air kosong", meaning: "plain water" },
          ],
        },
        drinks_recommendation: {
          id: "drinks_recommendation",
          background: "🧊 Popular Drinks",
          npcName: "Mamak Uncle",
          npcEmoji: "👨‍🍳",
          npcDialogue:
            "Teh tarik memang signature drink kita. Kalau nak yang sejuk, try teh o ais limau. Very refreshing!",
          npcPronunciation:
            "Teh tarik is definitely our signature drink. If you want something cold, try teh o ais limau. Very refreshing!",
          npcTranslation:
            "Teh tarik is our signature drink. For something cold, try teh o ais limau—it’s very refreshing!",
          options: [
            {
              id: "order_signature",
              text: "Okay, teh tarik satu.",
              translation: "Okay, one teh tarik.",
              points: 15,
              nextScene: "payment",
            },
            {
              id: "try_ais_limau",
              text: "Teh o ais limau sounds interesting.",
              translation: "Teh o ais limau sounds interesting.",
              points: 20,
              nextScene: "payment",
              culturalNote:
                "Trying local specialties shows cultural curiosity!",
            },
          ],
        },
        payment: {
          id: "payment",
          background: "💰 Paying at Mamak",
          npcName: "Mamak Uncle",
          npcEmoji: "👨‍🍳",
          npcDialogue: "Semua sekali RM 12.50. Bayar cash atau card?",
          npcTranslation: "All together RM 12.50. Pay cash or card?",
          options: [
            {
              id: "pay_cash",
              text: "Cash. Ini RM 15, baki untuk awak.",
              translation: "Cash. Here's RM 15, keep the change.",
              points: 20,
              nextScene: "complete",
              culturalNote:
                "Small tips are appreciated but not expected at mamak stalls.",
            },
            {
              id: "pay_card",
              text: "Boleh guna kad kredit?",
              translation: "Can I use credit card?",
              points: 10,
              nextScene: "complete",
            },
          ],
        },
      };
    }

    // Cantonese Restaurant Scenario
    if (scenario === "restaurant" && language === "cantonese") {
      return {
        start: {
          id: "start",
          background: "🏮 Dim Sum Restaurant",
          npcName: "Waiter",
          npcEmoji: "👨‍💼",
          npcDialogue: "歡迎光臨！幾多位？",
          npcPronunciation: "fūn yìhng gwōng làhm! géi dō wái?",
          npcTranslation: "Welcome! How many people?",
          options: [
            {
              id: "two_people",
              text: "兩個人，唔該。",
              pronunciation: "léuhng go yàhn, m̀h gōi.",
              translation: "Two people, please.",
              points: 10,
              nextScene: "seating",
            },
            {
              id: "one_person",
              text: "得我一個。",
              pronunciation: "dāk ngóh yāt go.",
              translation: "Just me alone.",
              points: 10,
              nextScene: "seating",
            },
            {
              id: "ask_wait",
              text: "要等位嗎？",
              pronunciation: "yiu dáng wái mā?",
              translation: "Do we need to wait for a table?",
              points: 15,
              nextScene: "seating",
            },
          ],
          vocabulary: [
            { word: "歡迎", pronunciation: "fūn yìhng", meaning: "welcome" },
            {
              word: "幾多位",
              pronunciation: "géi dō wái",
              meaning: "how many people",
            },
            {
              word: "等位",
              pronunciation: "dáng wái",
              meaning: "wait for table",
            },
          ],
        },
        seating: {
          id: "seating",
          background: "🪑 Getting Seated",
          npcName: "Waiter",
          npcEmoji: "👨‍💼",
          npcDialogue: "好，請跟我嚟。你想坐邊度？窗邊定係入面？",
          npcPronunciation:
            "hóu, chéng gān ngóh làih. néih séung chóh bīn douh? chēung bīn dihng haih yahp mihn?",
          npcTranslation:
            "Alright, please follow me. Where would you like to sit? By the window or inside?",
          options: [
            {
              id: "window_seat",
              text: "窗邊好啲，可以睇風景。",
              pronunciation: "chēung bīn hóu dī, hó yíh tái fūng géng.",
              translation: "Window side is better, can see the scenery.",
              points: 15,
              nextScene: "menu",
            },
            {
              id: "inside_seat",
              text: "入面啦，安靜啲。",
              pronunciation: "yahp mihn laa, ōn jihng dī.",
              translation: "Inside please, it's quieter.",
              points: 10,
              nextScene: "menu",
            },
          ],
        },
        menu: {
          id: "menu",
          background: "🥟 Dim Sum Selection",
          npcName: "Server",
          npcEmoji: "👩‍🍳",
          npcDialogue: "想食啲咩點心？我哋嘅燒賣同埋蝦餃好出名㗎。",
          npcPronunciation:
            "séung sihk dī mē dím sām? ngóh deih ge sīu máai tùhng màaih hā gáau hóu chēut mìhng gaa.",
          npcTranslation:
            "What dim sum would you like? Our siu mai and har gow are very famous.",
          options: [
            {
              id: "order_classics",
              text: "我要燒賣同埋蝦餃。",
              pronunciation: "ngóh yiu sīu máai tùhng màaih hā gáau.",
              translation: "I want siu mai and har gow.",
              points: 15,
              nextScene: "tea",
            },
            {
              id: "ask_recommendation",
              text: "有咩好介紹？",
              pronunciation: "yáuh mē hóu gaai siuh?",
              translation: "What do you recommend?",
              points: 20,
              nextScene: "recommendations",
            },
            {
              id: "vegetarian",
              text: "有素食嘅點心嗎？",
              pronunciation: "yáuh sou sihk ge dím sām mā?",
              translation: "Do you have vegetarian dim sum?",
              points: 20,
              nextScene: "vegetarian_options",
            },
          ],
          vocabulary: [
            { word: "點心", pronunciation: "dím sām", meaning: "dim sum" },
            { word: "燒賣", pronunciation: "sīu máai", meaning: "siu mai" },
            { word: "蝦餃", pronunciation: "hā gáau", meaning: "har gow" },
            { word: "介紹", pronunciation: "gaai siuh", meaning: "recommend" },
          ],
        },
        recommendations: {
          id: "recommendations",
          background: "🥟 Waiter's Suggestions",
          npcName: "Server",
          npcEmoji: "👩‍🍳",
          npcDialogue: "好！今日我哋有好正嘅燒賣同埋叉燒包。你想試下嗎？",
          npcPronunciation:
            "hóu! gām yaht ngóh deih yáuh hóu jeng ge sīu máaih tùhng màaih chā sīu bāau. néih séung si hah mā?",
          npcTranslation:
            "Great! Today we have excellent siu mai and char siu bao. Would you like to try?",
          options: [
            {
              id: "accept_suggestion",
              text: "好呀！要兩籠燒賣。",
              pronunciation: "hóu aa! yiu léuhng lúhng sīu máaih.",
              translation: "Yes! I want two baskets of siu mai.",
              points: 15,
              nextScene: "tea",
            },
            {
              id: "ask_ingredients",
              text: "燒賣入面有咩餡？",
              pronunciation: "sīu máaih yahp mihn yáuh mē haahm?",
              translation: "What filling is in the siu mai?",
              points: 20,
              nextScene: "tea",
            },
            {
              id: "different_choice",
              text: "我想睇下其他嘢。",
              pronunciation: "ngóh séung tái hah kèih tā yéh.",
              translation: "I want to look at other things.",
              points: 10,
              nextScene: "tea",
            },
          ],
          vocabulary: [
            {
              word: "燒賣",
              pronunciation: "sīu máaih",
              meaning: "siu mai (pork dumpling)",
            },
            {
              word: "叉燒包",
              pronunciation: "chā sīu bāau",
              meaning: "char siu bao (BBQ pork bun)",
            },
            {
              word: "籠",
              pronunciation: "lúhng",
              meaning: "basket (for dim sum)",
            },
            { word: "餡", pronunciation: "haahm", meaning: "filling" },
          ],
        },
        vegetarian_options: {
          id: "vegetarian_options",
          background: "🥬 Vegetarian Options",
          npcName: "Server",
          npcEmoji: "👩‍🍳",
          npcDialogue: "你食唔食肉？如果唔食肉，我哋有素菜餃子同埋蘿蔔糕。",
          npcPronunciation:
            "néih sihk m̀h sihk yuhk? yùh gwó m̀h sihk yuhk, ngóh deih yáuh sou choi gáau jí tùhng màaih lòh baahk gōu.",
          npcTranslation:
            "Do you eat meat? If you don't eat meat, we have vegetable dumplings and radish cake.",
          options: [
            {
              id: "vegetarian",
              text: "我係素食者，要素菜餃子。",
              pronunciation: "ngóh haih sou sihk jé, yiu sou choi gáau jí.",
              translation: "I'm vegetarian, I want vegetable dumplings.",
              points: 20,
              nextScene: "tea",
            },
            {
              id: "eat_meat",
              text: "我食肉，燒賣好呀。",
              pronunciation: "ngóh sihk yuhk, sīu máaih hóu aa.",
              translation: "I eat meat, siu mai is good.",
              points: 15,
              nextScene: "tea",
            },
            {
              id: "radish_cake",
              text: "蘿蔔糕係點樣嘅？",
              pronunciation: "lòh baahk gōu haih dím yéung ge?",
              translation: "What is radish cake like?",
              points: 25,
              nextScene: "tea",
            },
          ],
          vocabulary: [
            {
              word: "素食者",
              pronunciation: "sou sihk jé",
              meaning: "vegetarian",
            },
            {
              word: "素菜餃子",
              pronunciation: "sou choi gáau jí",
              meaning: "vegetable dumplings",
            },
            {
              word: "蘿蔔糕",
              pronunciation: "lòh baahk gōu",
              meaning: "radish cake",
            },
            {
              word: "點樣",
              pronunciation: "dím yéung",
              meaning: "how/what like",
            },
          ],
        },
        tea: {
          id: "tea",
          background: "🍵 Tea Selection",
          npcName: "Server",
          npcEmoji: "👩‍🍳",
          npcDialogue: "飲咩茶好？普洱、鐵觀音定係茉莉花茶？",
          npcPronunciation:
            "yám mē chàh hóu? póu léi, tit gun yām dihng haih muht leih fā chàh?",
          npcTranslation:
            "What tea would you like? Pu-erh, tieguanyin, or jasmine tea?",
          options: [
            {
              id: "pu_erh",
              text: "普洱茶，唔該。",
              pronunciation: "póu léi chàh, m̀h gōi.",
              translation: "Pu-erh tea, please.",
              points: 15,
              nextScene: "payment",
              culturalNote:
                "Pu-erh is traditional with dim sum as it aids digestion.",
            },
            {
              id: "jasmine",
              text: "茉莉花茶好啲。",
              pronunciation: "muht leih fā chàh hóu dī.",
              translation: "Jasmine tea is better.",
              points: 10,
              nextScene: "payment",
            },
          ],
        },
        payment: {
          id: "payment",
          background: "💳 Paying the Bill",
          npcName: "Server",
          npcEmoji: "👩‍🍳",
          npcDialogue: "埋單，一共八十蚊。",
          npcPronunciation: "màaih dāan, yāt guhng baat sahp mān.",
          npcTranslation: "Bill please, eighty dollars in total.",
          options: [
            {
              id: "pay_card",
              text: "可唔可以碌卡？",
              pronunciation: "hó m̀h hó yíh lūk kāat?",
              translation: "Can I pay by card?",
              points: 15,
              nextScene: "complete",
            },
            {
              id: "pay_cash",
              text: "現金畀。",
              pronunciation: "yihn gām béi.",
              translation: "Pay with cash.",
              points: 10,
              nextScene: "complete",
            },
          ],
        },
      };
    }

    return {};
  };

  const scenarioData = getScenarioData();
  const currentSceneData = scenarioData[currentScene];

  const handleOptionSelect = (option: DialogueOption) => {
    if (!currentSceneData) return;

    // Stop any currently playing audio
    stopAudio();

    // Set up learning mode for this option
    setSelectedOption(option);
    setShowLearningMode(true);
    setAiExplanation('');
    
    // Reset pronunciation state
    setPronunciationScore(null);
    setPronunciationFeedback('');
    setRecordedAudio(null);
    setCountdown(null);
    
    generateAIExplanation(option);
  };

  const proceedToNextScene = () => {
    if (!selectedOption || !currentSceneData) return;

    // Add to conversation history
    setConversationHistory((prev) => [
      ...prev,
      {
        speaker: "You",
        text: selectedOption.text,
        translation: selectedOption.translation,
      },
    ]);

    // Update score
    setScore((prev) => prev + selectedOption.points);

    // Mark scene as completed
    setCompletedScenes((prev) => new Set([...prev, currentScene]));

    // Hide learning mode
    setShowLearningMode(false);
    setSelectedOption(null);

    // Move to next scene or complete
    if (selectedOption.nextScene === "complete" || !selectedOption.nextScene) {
      setTimeout(() => onComplete(score + selectedOption.points), 1000);
    } else if (selectedOption.nextScene && scenarioData[selectedOption.nextScene]) {
      setTimeout(() => {
        setCurrentScene(selectedOption.nextScene!);
        // Add NPC response to history
        const nextScene = scenarioData[selectedOption.nextScene!];
        setConversationHistory((prev) => [
          ...prev,
          {
            speaker: nextScene.npcName,
            text: nextScene.npcDialogue,
            translation: nextScene.npcTranslation,
          },
        ]);
      }, 1000);
    }
  };

  const generateAIExplanation = async (option: DialogueOption) => {
    setIsGeneratingExplanation(true);
    
    try {
      // Create a contextual explanation request
      const explanationPrompt = {
        language: language,
        sentence: option.text,
        pronunciation: option.pronunciation,
        translation: option.translation,
        culturalNote: option.culturalNote,
        context: currentSceneData?.background,
        npcDialogue: currentSceneData?.npcDialogue,
        scenario: scenario
      };

      const response = await fetch('http://localhost:5000/api/generate-explanation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(explanationPrompt),
      });

      if (!response.ok) {
        throw new Error(`Explanation generation failed: ${response.status}`);
      }

      const result = await response.json();
      setAiExplanation(result.explanation || 'Explanation generated successfully.');
      
    } catch (error) {
      console.error('Error generating explanation:', error);
      setAiExplanation('Unable to generate explanation at this time. Please try again.');
    } finally {
      setIsGeneratingExplanation(false);
    }
  };

  const playAudio = async (text: string, autoPlay: boolean = false) => {
    // Prevent playing if already playing (unless it's a manual override)
    if (isPlaying && autoPlay) {
      console.log("Audio already playing, skipping autoplay");
      return;
    }

    // Stop any currently playing speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    setIsPlaying(true);

    try {
      // Try AWS Polly first for higher quality
      const response = await fetch("http://localhost:5000/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voiceId: getVoiceIdForLanguage(language),
          engine: "neural",
        }),
      });

      if (
        response.ok &&
        response.headers.get("content-type")?.includes("audio")
      ) {
        // AWS Polly succeeded - play the audio
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onloadeddata = () => {
          console.log(
            "🔊 AWS Polly speech started:",
            text.substring(0, 20) + "..."
          );
        };

        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
          console.log("✅ AWS Polly speech completed");
        };

        audio.onerror = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
          console.error("Audio playback error, falling back to browser TTS");
          fallbackToWebSpeech(text);
        };

        await audio.play();
      } else {
        // Fallback to browser speech synthesis
        console.log("AWS Polly not available, using browser TTS");
        fallbackToWebSpeech(text);
      }
    } catch (error) {
      console.error(
        "Error with AWS Polly, falling back to browser TTS:",
        error
      );
      fallbackToWebSpeech(text);
    }
  };

  const getVoiceIdForLanguage = (lang: string): string => {
    switch (lang) {
      case "mandarin":
        return "Zhiyu"; // Chinese Mandarin
      case "cantonese":
        return "Hiujin"; // Cantonese (if available, otherwise use Mandarin)
      case "malay":
        return "Raveena"; // Malay
      default:
        return "Joanna"; // English fallback
    }
  };

  const fallbackToWebSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang =
        language === "mandarin"
          ? "zh-CN"
          : language === "malay"
          ? "ms-MY"
          : "zh-HK";
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        console.log(
          "🔊 Browser TTS speech started:",
          text.substring(0, 20) + "..."
        );
      };

      utterance.onend = () => {
        setIsPlaying(false);
        console.log("✅ Browser TTS speech completed");
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsPlaying(false);
      };

      setTimeout(() => {
        if (!speechSynthesis.speaking) {
          speechSynthesis.speak(utterance);
        }
      }, 100);
    } else {
      console.warn("Speech synthesis not supported in this browser");
      setIsPlaying(false);
    }
  };

  // Auto-play NPC dialogue when scene changes
  useEffect(() => {
    const currentSceneData = scenarioData[currentScene];

    if (
      autoPlayEnabled &&
      currentSceneData &&
      currentSceneData.npcDialogue &&
      lastPlayedSceneRef.current !== currentScene &&
      !isPlaying
    ) {
      // Mark this scene as being played
      lastPlayedSceneRef.current = currentScene;

      // Delay autoplay slightly to ensure scene transition is complete
      const timer = setTimeout(() => {
        console.log(`🔊 Auto-playing: "${currentSceneData.npcDialogue}"`);
        playAudio(currentSceneData.npcDialogue, true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentScene, autoPlayEnabled]);

  // Reset last played scene when autoplay is toggled off and on
  // Use a ref to track if this is the first time autoPlayEnabled becomes true
  const isFirstAutoPlayRef = useRef(true);

  useEffect(() => {
    if (autoPlayEnabled) {
      // Skip the first time this effect runs (on initial mount)
      if (isFirstAutoPlayRef.current) {
        isFirstAutoPlayRef.current = false;
        return;
      }

      // Reset so current scene can be played again when autoplay is re-enabled
      lastPlayedSceneRef.current = "";

      // Immediately play current scene when autoplay is turned on
      const currentSceneData = scenarioData[currentScene];
      if (currentSceneData && currentSceneData.npcDialogue && !isPlaying) {
        setTimeout(() => {
          playAudio(currentSceneData.npcDialogue, true);
          lastPlayedSceneRef.current = currentScene;
        }, 200);
      }
    }
  }, [autoPlayEnabled]);

  // Set default practice text when scene changes
  useEffect(() => {
    if (currentSceneData && showPronunciationPanel) {
      setPracticeText({
        text: currentSceneData.npcDialogue,
        pronunciation: currentSceneData.npcPronunciation,
        translation: currentSceneData.npcTranslation,
        source: `${currentSceneData.npcName} (NPC)`,
      });
    }
  }, [currentScene, showPronunciationPanel]);

  // Auto-proceed when pronunciation score is good enough
  useEffect(() => {
    if (showLearningMode && pronunciationScore !== null && pronunciationScore >= 0.6) {
      // Start countdown from 3
      setCountdown(3);
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            proceedToNextScene();
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(countdownInterval);
        setCountdown(null);
      };
    } else {
      setCountdown(null);
    }
  }, [pronunciationScore, showLearningMode]);

  const stopAudio = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        setRecordedAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setPronunciationScore(null);
      setPronunciationFeedback("");
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const checkPronunciation = async (expectedText: any, recordedBlob: Blob) => {
    setIsCheckingPronunciation(true);

    try {
      // First, transcribe the audio using AWS Transcribe
      const formData = new FormData();
      formData.append("audio", recordedBlob, "recording.webm");
      formData.append("languageCode", getLanguageCodeForTranscribe(language));

      const transcribeResponse = await fetch(
        "http://localhost:5000/api/speech-to-text",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!transcribeResponse.ok) {
        throw new Error(
          `Transcription request failed: ${transcribeResponse.status}`
        );
      }

      const transcribeResult = await transcribeResponse.json();
      console.log("Transcription started:", transcribeResult);

      // Poll for transcription completion
      const jobName = transcribeResult.jobName;
      const isMock = transcribeResult.isMock || false;
      let transcriptionText = "";

      if (isMock) {
        console.log("Using mock transcription mode");
        transcriptionText = await pollTranscriptionJob(jobName, true);
      } else {
        console.log("Using AWS Transcribe");
        transcriptionText = await pollTranscriptionJob(jobName, false);
      }

      console.log("Transcribed text:", transcriptionText);

      // Fetch transcription text from the backend
      const transcriptionResponse = await fetch(
        `http://localhost:5000/api/speech-to-text/job/${jobName}/signed-url`
      );

      if (!transcriptionResponse.ok) {
        throw new Error(
          `Failed to fetch transcription text: ${transcriptionResponse.status}`
        );
      }

      const transcriptionResult = await transcriptionResponse.json();

      // Now check pronunciation accuracy
      const pronunciationResponse = await fetch(
        "http://localhost:5000/api/check-pronunciation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            expected: expectedText,
            actual: transcriptionResult?.results.transcripts,
            language: language,
            detectedLanguage:
              transcriptionResult?.detectedLanguage ||
              transcriptionResult?.results?.detectedLanguage,
          }),
        }
      );

      if (!pronunciationResponse.ok) {
        throw new Error(
          `Pronunciation check failed: ${pronunciationResponse.status}`
        );
      }

      const pronunciationResult = await pronunciationResponse.json();
      console.log("Pronunciation assessment:", pronunciationResult);

      setPronunciationScore(pronunciationResult.score || 0);
      setPronunciationFeedback(
        pronunciationResult.feedback || "Assessment completed"
      );
      setShowPronunciationPanel(true);
    } catch (error) {
      console.error("Error checking pronunciation:", error);
      setPronunciationScore(0.5); // Give a neutral score on error
      setPronunciationFeedback(
        `Error: ${error.message}. Please try recording again.`
      );
      setShowPronunciationPanel(true);
    } finally {
      setIsCheckingPronunciation(false);
    }
  };

  const getLanguageCodeForTranscribe = (lang: string): string => {
    switch (lang) {
      case "mandarin":
        return "zh-CN";
      case "cantonese":
        return "zh-HK";
      case "malay":
        return "ms-MY";
      default:
        return "en-US";
    }
  };

  const pollTranscriptionJob = async (
    jobName: string,
    isMock: boolean = false
  ): Promise<string> => {
    const maxAttempts = isMock ? 3 : 30; // Shorter wait for mock jobs
    const delay = isMock ? 1000 : 2000; // 1s for mock, 2s for real jobs

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const url = isMock
          ? `http://localhost:5000/api/speech-to-text/job/${jobName}?isMock=true`
          : `http://localhost:5000/api/speech-to-text/job/${jobName}`;

        const response = await fetch(url);
        const result = await response.json();

        console.log(`Transcription attempt ${attempt + 1}:`, result);

        if (result.TranscriptionJob.TranscriptionJobStatus === "COMPLETED") {
          const transcript =
            result.TranscriptionJob.Transcript.results?.transcripts?.[0]
              ?.transcript;
          return transcript || "No transcription available";
        } else if (
          result.TranscriptionJob.TranscriptionJobStatus === "FAILED"
        ) {
          console.error(
            "Transcription job failed:",
            result.TranscriptionJob.FailureReason
          );
          return "Transcription failed";
        }

        // Wait before next attempt
        if (attempt < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(
          `Transcription polling attempt ${attempt + 1} failed:`,
          error
        );
        if (attempt === maxAttempts - 1) {
          return "Error checking transcription status";
        }
      }
    }

    return "Transcription timeout - please try again";
  };

  if (!currentSceneData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-orange-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Scenario not found</h2>
          <button
            onClick={onExit}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg">
            Return to Main Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={onExit}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm">
            Exit
          </button>
          <div className="text-lg font-bold">Score: {score}</div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              autoPlayEnabled
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-600 hover:bg-gray-700"
            }`}>
            🔊 Auto-play: {autoPlayEnabled ? "ON" : "OFF"}
          </button>
          <button
            onClick={() => setShowPronunciationPanel(!showPronunciationPanel)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              showPronunciationPanel
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-600 hover:bg-gray-700"
            }`}>
            🎤 Practice: {showPronunciationPanel ? "ON" : "OFF"}
          </button>
          {isPlaying && (
            <button
              onClick={stopAudio}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm">
              🛑 Stop Audio
            </button>
          )}
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
            {showTranslation ? "Hide" : "Show"} Translations
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          {/* Scene Area */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 mb-6">
              {/* Scene Background */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">
                  {currentSceneData.background}
                </div>
                <h2 className="text-2xl font-bold text-yellow-400">
                  {currentSceneData.npcName} {currentSceneData.npcEmoji}
                </h2>
              </div>

              {/* NPC Dialogue */}
              <div className="bg-gray-700/50 rounded-lg p-4 mb-6 relative">
                {isPlaying && (
                  <div className="absolute top-2 right-2 flex items-center space-x-1 text-green-400 text-xs">
                    <span className="animate-pulse">🔊 Speaking...</span>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{currentSceneData.npcEmoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-bold text-blue-300">
                        {currentSceneData.npcName}:
                      </span>
                      <button
                        onClick={() => playAudio(currentSceneData.npcDialogue)}
                        className={`transition-colors ${
                          isPlaying
                            ? "text-green-400 hover:text-green-300"
                            : "text-blue-400 hover:text-blue-300"
                        }`}
                        title={
                          isPlaying ? "Playing..." : "Play audio"
                        }></button>
                    </div>
                    <p className="text-lg mb-1">
                      {currentSceneData.npcDialogue}
                    </p>
                    {currentSceneData.npcPronunciation && (
                      <p className="text-gray-400 italic text-sm mb-1">
                        {currentSceneData.npcPronunciation}
                      </p>
                    )}
                    {showTranslation && (
                      <p className="text-gray-300 text-sm">
                        "{currentSceneData.npcTranslation}"
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Response Options */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-purple-300 mb-3">
                  Choose your response:
                </h3>
                {currentSceneData.options.map((option, index) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleOptionSelect(option)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 p-4 rounded-lg text-left transition-all hover:scale-[1.02] hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-lg mb-1">
                          {option.text}
                        </p>
                        {option.pronunciation && (
                          <p className="text-gray-300 italic text-sm mb-1">
                            {option.pronunciation}
                          </p>
                        )}
                        {showTranslation && (
                          <p className="text-gray-200 text-sm">
                            "{option.translation}"
                          </p>
                        )}
                        {option.culturalNote && (
                          <p className="text-yellow-300 text-xs mt-2 italic">
                            💡 {option.culturalNote}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-yellow-400 font-bold mb-1">
                          +{option.points}
                        </div>
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playAudio(option.text);
                            }}
                            className="text-blue-400 hover:text-blue-300"
                            title="Play audio">
                            <SoundIcon className="w-4 h-4" />
                          </button>
                          {showPronunciationPanel && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Auto-fill practice panel with this option
                                setShowPronunciationPanel(true);
                                // You can add logic here to switch practice text
                              }}
                              className="text-purple-400 hover:text-purple-300"
                              title="Practice this phrase">
                              <MicrophoneIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Learning Mode Overlay */}
            {showLearningMode && selectedOption && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-yellow-400 mb-2">
                      🎯 Learn This Response
                    </h2>
                    <p className="text-gray-300">Practice and understand what you're saying</p>
                  </div>

                  {/* Selected Option Display */}
                  <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-bold text-purple-300 mb-3">Your Response:</h3>
                    <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-lg p-4">
                      <p className="text-xl font-medium mb-2">{selectedOption.text}</p>
                      {selectedOption.pronunciation && (
                        <p className="text-gray-300 italic text-sm mb-2">{selectedOption.pronunciation}</p>
                      )}
                      <p className="text-gray-200 text-sm mb-3">"{selectedOption.translation}"</p>
                      
                      {/* Pronunciation Practice */}
                      <div className="flex items-center space-x-3 mb-4">
                        <button
                          onClick={() => playAudio(selectedOption.text)}
                          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2"
                          disabled={isPlaying}
                        >
                          <SoundIcon className="w-4 h-4" />
                          <span>{isPlaying ? 'Playing...' : 'Listen'}</span>
                        </button>
                        
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                            isRecording 
                              ? 'bg-red-700 hover:bg-red-800 animate-pulse' 
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                        >
                          <MicrophoneIcon className="w-4 h-4" />
                          <span>{isRecording ? 'Stop Recording' : 'Record Yourself'}</span>
                        </button>

                        {recordedAudio && (
                          <button
                            onClick={() => checkPronunciation({
                              chinese: selectedOption.text,
                              cantonese: selectedOption.pronunciation,
                              english: selectedOption.translation,
                            }, recordedAudio)}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                            disabled={isCheckingPronunciation}
                          >
                            {isCheckingPronunciation ? 'Checking...' : 'Check Pronunciation'}
                          </button>
                        )}
                      </div>

                      {/* Pronunciation Results */}
                      {pronunciationScore !== null && (
                        <div className="bg-gray-600/50 rounded p-3 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Pronunciation Score:</span>
                            <span className={`font-bold ${
                              pronunciationScore >= 0.8 ? 'text-green-400' : 
                              pronunciationScore >= 0.6 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {Math.round(pronunciationScore * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                pronunciationScore >= 0.8 ? 'bg-green-400' : 
                                pronunciationScore >= 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${pronunciationScore * 100}%` }}
                            ></div>
                          </div>
                          {pronunciationFeedback && (
                            <p className="text-sm text-gray-300 mb-2">{pronunciationFeedback}</p>
                          )}
                          
                          {/* Success/Failure Message */}
                          {pronunciationScore >= 0.6 ? (
                            <div className="bg-green-900/30 border border-green-600/50 rounded p-2 mb-2">
                              <p className="text-green-300 text-sm font-medium">
                                ✅ Great pronunciation! {countdown !== null ? `Proceeding in ${countdown}s...` : 'Proceeding to next scene...'}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-red-900/30 border border-red-600/50 rounded p-2 mb-2">
                              <p className="text-red-300 text-sm font-medium">
                                🔄 Try again! Practice the pronunciation and record again to improve your score.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedOption.culturalNote && (
                        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3">
                          <p className="text-yellow-300 text-sm">
                            💡 <strong>Cultural Note:</strong> {selectedOption.culturalNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Explanation */}
                  <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-green-400">🤖 AI Explanation</h3>
                      {aiExplanation && (
                        <button
                          onClick={() => playAudio(aiExplanation)}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm flex items-center space-x-1"
                          disabled={isPlaying}
                        >
                          <SoundIcon className="w-3 h-3" />
                          <span>Listen to Explanation</span>
                        </button>
                      )}
                    </div>
                    
                    {isGeneratingExplanation ? (
                      <div className="flex items-center space-x-2 text-gray-400">
                        <div className="animate-spin w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"></div>
                        <span>Generating explanation...</span>
                      </div>
                    ) : aiExplanation ? (
                      <div className="bg-gray-600/30 rounded p-3">
                        <p className="text-gray-200 leading-relaxed">{aiExplanation}</p>
                      </div>
                    ) : (
                      <div className="text-gray-400 italic">
                        Explanation will appear here...
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between space-x-4">
                    <button
                      onClick={() => {
                        setShowLearningMode(false);
                        setSelectedOption(null);
                        setCountdown(0);
                      }}
                      className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg text-white font-medium"
                    >
                      Cancel
                    </button>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => generateAIExplanation(selectedOption)}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg text-white font-medium"
                        disabled={isGeneratingExplanation}
                      >
                        {isGeneratingExplanation ? 'Generating...' : 'Regenerate Explanation'}
                      </button>
                      
                      <button
                        onClick={proceedToNextScene}
                        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-white font-medium"
                      >
                        Skip Practice →
                      </button>
                      
                      <button
                        onClick={proceedToNextScene}
                        className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white font-medium"
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pronunciation Practice Panel */}
            {showPronunciationPanel && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-lg font-bold text-purple-400 mb-3">
                  🎤 Pronunciation Practice
                </h3>

                {/* Pronunciation Practice Panel */}
                <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-300 mb-3">
                    Choose what to practice:
                  </p>

                  {/* Practice Text Selection */}
                  <div className="space-y-2 mb-4">
                    {/* NPC Dialogue Option */}
                    <button
                      onClick={() =>
                        setPracticeText({
                          text: currentSceneData.npcDialogue,
                          pronunciation: currentSceneData.npcPronunciation,
                          translation: currentSceneData.npcTranslation,
                          source: `${currentSceneData.npcName} (NPC)`,
                        })
                      }
                      className={`w-full text-left p-2 rounded transition-colors ${
                        practiceText?.text === currentSceneData.npcDialogue
                          ? "bg-purple-600/50 border border-purple-400"
                          : "bg-gray-600/30 hover:bg-gray-600/50"
                      }`}>
                      <div className="text-sm text-purple-300 font-medium">
                        {currentSceneData.npcName}:
                      </div>
                      <div className="text-sm">
                        {currentSceneData.npcDialogue}
                      </div>
                      {showTranslation && (
                        <div className="text-xs text-gray-400 italic">
                          "{currentSceneData.npcTranslation}"
                        </div>
                      )}
                    </button>

                    {/* Player Response Options */}
                    {currentSceneData.options.map((option, index) => (
                      <button
                        key={option.id}
                        onClick={() =>
                          setPracticeText({
                            text: option.text,
                            pronunciation: option.pronunciation,
                            translation: option.translation,
                            source: `Option ${index + 1}`,
                          })
                        }
                        className={`w-full text-left p-2 rounded transition-colors ${
                          practiceText?.text === option.text
                            ? "bg-blue-600/50 border border-blue-400"
                            : "bg-gray-600/30 hover:bg-gray-600/50"
                        }`}>
                        <div className="text-sm text-blue-300 font-medium">
                          You (Option {index + 1}):
                        </div>
                        <div className="text-sm">{option.text}</div>
                        {showTranslation && (
                          <div className="text-xs text-gray-400 italic">
                            "{option.translation}"
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Selected Practice Text Display */}
                  {practiceText && (
                    <div className="bg-gray-600/50 rounded p-3 mb-4">
                      <div className="text-sm text-purple-300 mb-1">
                        Practicing: {practiceText.source}
                      </div>
                      <p className="font-medium text-lg mb-1">
                        {practiceText.text}
                      </p>
                      {practiceText.pronunciation && (
                        <p className="text-gray-400 text-sm italic mb-2">
                          {practiceText.pronunciation}
                        </p>
                      )}
                      {showTranslation && (
                        <p className="text-gray-300 text-sm mb-3">
                          "{practiceText.translation}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Recording Controls */}
                  <div className="flex items-center space-x-2 mb-3">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm flex items-center space-x-1"
                        disabled={isCheckingPronunciation || !practiceText}>
                        <MicrophoneIcon className="w-4 h-4" />
                        <span>Start Recording</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="bg-red-800 hover:bg-red-900 px-3 py-2 rounded text-sm flex items-center space-x-1 animate-pulse">
                        <MicrophoneIcon className="w-4 h-4" />
                        <span>Recording... (Click to Stop)</span>
                      </button>
                    )}

                    {recordedAudio && practiceText && (
                      <button
                        onClick={() =>
                          checkPronunciation(
                            {
                              chinese: practiceText.text,
                              cantonese: practiceText.pronunciation,
                              english: practiceText.translation,
                            },
                            recordedAudio
                          )
                        }
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
                        disabled={isCheckingPronunciation}>
                        {isCheckingPronunciation
                          ? "Checking..."
                          : "Check Pronunciation"}
                      </button>
                    )}

                    {practiceText && (
                      <button
                        onClick={() => playAudio(practiceText.text)}
                        className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm flex items-center space-x-1"
                        disabled={isPlaying}>
                        <SoundIcon className="w-4 h-4" />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>

                  {!practiceText && (
                    <div className="text-sm text-gray-400 italic text-center py-2">
                      Select a sentence above to start practicing
                    </div>
                  )}

                  {/* Pronunciation Results */}
                  {pronunciationScore !== null && (
                    <div className="bg-gray-600/50 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Pronunciation Score:
                        </span>
                        <span
                          className={`font-bold ${
                            pronunciationScore >= 0.8
                              ? "text-green-400"
                              : pronunciationScore >= 0.6
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}>
                          {Math.round(pronunciationScore * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            pronunciationScore >= 0.8
                              ? "bg-green-400"
                              : pronunciationScore >= 0.6
                              ? "bg-yellow-400"
                              : "bg-red-400"
                          }`}
                          style={{
                            width: `${pronunciationScore * 100}%`,
                          }}></div>
                      </div>
                      {pronunciationFeedback && (
                        <p className="text-sm text-gray-300">
                          {pronunciationFeedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Vocabulary */}
            {currentSceneData.vocabulary && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-lg font-bold text-green-400 mb-3">
                  📚 Key Vocabulary
                </h3>
                <div className="space-y-2">
                  {currentSceneData.vocabulary.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.word}</p>
                          {item.pronunciation && (
                            <p className="text-gray-400 text-sm italic">
                              {item.pronunciation}
                            </p>
                          )}
                          <p className="text-gray-300 text-sm">
                            {item.meaning}
                          </p>
                        </div>
                        <button
                          onClick={() => playAudio(item.word)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Play pronunciation">
                          <SoundIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4">
              <h3 className="text-lg font-bold text-purple-400 mb-3">
                📈 Progress
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Current Score:</span>
                  <span className="text-yellow-400 font-bold">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span>Scenes Completed:</span>
                  <span className="text-green-400">{completedScenes.size}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        (completedScenes.size /
                          Object.keys(scenarioData).length) *
                        100
                      }%`,
                    }}></div>
                </div>
              </div>
            </motion.div>

            {/* Conversation History */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-bold text-blue-400 mb-3">
                💬 Conversation
              </h3>
              <div className="space-y-3">
                {conversationHistory.map((entry, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      entry.speaker === "You"
                        ? "bg-blue-600/30 ml-4"
                        : "bg-gray-700/50 mr-4"
                    }`}>
                    <p className="font-medium text-sm text-gray-300">
                      {entry.speaker}:
                    </p>
                    <p className="text-sm">{entry.text}</p>
                    {showTranslation && (
                      <p className="text-xs text-gray-400 italic mt-1">
                        "{entry.translation}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioEngine;