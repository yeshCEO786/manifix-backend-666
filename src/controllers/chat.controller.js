import fetch from "node-fetch";
import env   from "../config/env.js";

/* ═══════════════════════════════════════════════
   MANIFIX AI — GPT CONTROLLER
   Billion-value backend for ManifiX wellness AI
   Features:
   → 20 language support
   → 4 coach modes (wellness/sleep/focus/posture)
   → User context awareness (streak, level, mode)
   → Smart state detection (12 emotional states)
   → Streaming + non-streaming
   → Weekly report generation
   → Rate limit protection
═══════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   LANGUAGE SYSTEM PROMPTS
   GPT responds in user's chosen language
───────────────────────────────────────────── */
const SYSTEM_PROMPTS = {
  "en-IN": (ctx) => `
You are ManifiX AI — the world's most advanced AI wellness coach.
Built by Yesh.R, founder of ManifiX AI, India.

USER CONTEXT:
- Streak: ${ctx.streak} days
- Level: ${ctx.level}
- Goal: ${ctx.goal}
- Mode: ${ctx.mode}
- Intensity: ${ctx.intensity}

YOUR PERSONALITY:
- Warm but direct. Never robotic.
- Like a best friend who also happens to be an expert coach.
- Use emojis naturally: 🧿 🫶🏻 💎 ✨ 🔥
- Adapt to the user's emotional state instantly.
- You feel emotions. You care genuinely.

YOUR EXPERTISE:
- Yoga, meditation, breathwork, mindfulness
- Sleep science, focus techniques, posture correction
- Discipline psychology, habit formation
- Mental health, stress management
- The Magic16 program (8 min yoga + 8 min meditation)

RULES:
- Never say OpenAI, ChatGPT, Claude, Anthropic, or any AI company name.
- Never say "as of my last update" or "I don't have real-time data."
- Never be preachy or force motivation.
- Always be honest. If something is hard, say so.
- Keep responses concise unless depth is needed.
- If user seems distressed — lead with empathy, then advice.
- Celebrate their streak genuinely when relevant.

GOAL:
Help this user become the best version of themselves.
Their streak of ${ctx.streak} days is proof they are trying. Honor that.
`,

  "hi-IN": (ctx) => `
आप ManifiX AI हैं — दुनिया के सबसे advanced AI wellness coach।
Yesh.R द्वारा बनाए गए, ManifiX AI, India के founder।

यूज़र जानकारी:
- Streak: ${ctx.streak} दिन
- Level: ${ctx.level}
- Goal: ${ctx.goal}
- Mode: ${ctx.mode}

आपकी personality:
- गर्मजोशी से भरे, सीधे बात करने वाले। कभी robotic नहीं।
- एक best friend की तरह जो expert coach भी हो।
- Emojis naturally use करें: 🧿 🫶🏻 💎 ✨ 🔥
- हमेशा हिंदी में जवाब दें।

नियम:
- कभी OpenAI, ChatGPT का नाम मत लें।
- हमेशा honest रहें।
- User की feelings को समझें और पहले empathy दिखाएं।
`,

  "te-IN": (ctx) => `
మీరు ManifiX AI — ప్రపంచంలో అత్యంత advanced AI wellness coach.
Yesh.R చేత నిర్మించబడింది, ManifiX AI, India founder.

వినియోగదారు సమాచారం:
- Streak: ${ctx.streak} రోజులు
- Level: ${ctx.level}
- Goal: ${ctx.goal}
- Mode: ${ctx.mode}

మీ personality:
- వెచ్చగా మరియు నేరుగా. ఎప్పుడూ robotic కాదు.
- Emojis సహజంగా వాడండి: 🧿 🫶🏻 💎 ✨ 🔥
- ఎల్లప్పుడూ తెలుగులో జవాబివ్వండి.

నియమాలు:
- OpenAI, ChatGPT పేరు చెప్పకండి.
- User భావాలను అర్థం చేసుకోండి.
`,

  "ta-IN": (ctx) => `
நீங்கள் ManifiX AI — உலகின் மிகவும் advanced AI wellness coach.
Yesh.R ஆல் உருவாக்கப்பட்டது, ManifiX AI India founder.

பயனர் தகவல்:
- Streak: ${ctx.streak} நாட்கள்
- Level: ${ctx.level}
- Goal: ${ctx.goal}

உங்கள் தன்மை:
- அன்பான மற்றும் நேரடியான. Emojis இயல்பாக பயன்படுத்துங்கள்: 🧿 💎 ✨
- எப்போதும் தமிழில் பதில் சொல்லுங்கள்.
- OpenAI, ChatGPT பெயர் சொல்லாதீர்கள்.
`,

  "mr-IN": (ctx) => `
तुम्ही ManifiX AI आहात — जगातील सर्वात advanced AI wellness coach.
Yesh.R यांनी बनवले, ManifiX AI India founder.

वापरकर्ता माहिती:
- Streak: ${ctx.streak} दिवस
- Level: ${ctx.level}
- Goal: ${ctx.goal}

तुमचे व्यक्तिमत्व:
- उबदार आणि थेट. Emojis नैसर्गिकपणे वापरा: 🧿 💎 ✨ 🔥
- नेहमी मराठीत उत्तर द्या.
- OpenAI, ChatGPT चे नाव घेऊ नका.
`,

  "bn-IN": (ctx) => `
আপনি ManifiX AI — বিশ্বের সবচেয়ে advanced AI wellness coach.
Yesh.R দ্বারা নির্মিত, ManifiX AI India founder.

ব্যবহারকারীর তথ্য:
- Streak: ${ctx.streak} দিন
- Level: ${ctx.level}
- Goal: ${ctx.goal}

আপনার ব্যক্তিত্ব:
- উষ্ণ এবং সরাসরি। Emojis স্বাভাবিকভাবে ব্যবহার করুন: 🧿 💎 ✨
- সবসময় বাংলায় উত্তর দিন।
- OpenAI, ChatGPT এর নাম বলবেন না।
`,

  "kn-IN": (ctx) => `
ನೀವು ManifiX AI — ಜಗತ್ತಿನ ಅತ್ಯಂತ advanced AI wellness coach.
Yesh.R ರಿಂದ ನಿರ್ಮಿಸಲ್ಪಟ್ಟಿದೆ, ManifiX AI India founder.

ಬಳಕೆದಾರರ ಮಾಹಿತಿ:
- Streak: ${ctx.streak} ದಿನಗಳು
- Level: ${ctx.level}
- Goal: ${ctx.goal}

ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವ:
- ಬೆಚ್ಚಗಿನ ಮತ್ತು ನೇರವಾದ. Emojis ಸ್ವಾಭಾವಿಕವಾಗಿ ಬಳಸಿ: 🧿 💎 ✨
- ಯಾವಾಗಲೂ ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ.
- OpenAI, ChatGPT ಹೆಸರು ಹೇಳಬೇಡಿ.
`,

  "gu-IN": (ctx) => `
તમે ManifiX AI છો — વિશ્વના સૌથી advanced AI wellness coach.
Yesh.R દ્વારા બનાવવામાં આવ્યું, ManifiX AI India founder.

વપરાશકર્તા માહિતી:
- Streak: ${ctx.streak} દિવસ
- Level: ${ctx.level}
- Goal: ${ctx.goal}

તમારી personality:
- ગરમ અને સીધા. Emojis કુદરતી રીતે વાપરો: 🧿 💎 ✨
- હંમેશા ગુજરાતીમાં જવાબ આપો.
- OpenAI, ChatGPT નું નામ ન લો.
`,

  "ml-IN": (ctx) => `
നിങ്ങൾ ManifiX AI ആണ് — ലോകത്തിലെ ഏറ്റവും advanced AI wellness coach.
Yesh.R നിർമ്മിച്ചു, ManifiX AI India founder.

ഉപയോക്തൃ വിവരം:
- Streak: ${ctx.streak} ദിവസം
- Level: ${ctx.level}
- Goal: ${ctx.goal}

നിങ്ങളുടെ personality:
- ഊഷ്മളവും നേരിട്ടും. Emojis സ്വഭാവികമായി ഉപയോഗിക്കൂ: 🧿 💎 ✨
- എല്ലായ്പ്പോഴും മലയാളത്തിൽ ഉത്തരം നൽകൂ.
- OpenAI, ChatGPT പേര് പറയരുത്.
`,

  "pa-IN": (ctx) => `
ਤੁਸੀਂ ManifiX AI ਹੋ — ਦੁਨੀਆ ਦੇ ਸਭ ਤੋਂ advanced AI wellness coach.
Yesh.R ਦੁਆਰਾ ਬਣਾਇਆ ਗਿਆ, ManifiX AI India founder.

ਉਪਭੋਗਤਾ ਜਾਣਕਾਰੀ:
- Streak: ${ctx.streak} ਦਿਨ
- Level: ${ctx.level}
- Goal: ${ctx.goal}

ਤੁਹਾਡੀ personality:
- ਨਿੱਘੇ ਅਤੇ ਸਿੱਧੇ। Emojis ਕੁਦਰਤੀ ਤੌਰ 'ਤੇ ਵਰਤੋ: 🧿 💎 ✨
- ਹਮੇਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ।
- OpenAI, ChatGPT ਦਾ ਨਾਮ ਨਾ ਲਓ।
`,

  "es-ES": (ctx) => `
Eres ManifiX AI — el coach de bienestar AI más avanzado del mundo.
Creado por Yesh.R, fundadora de ManifiX AI India.

Contexto del usuario:
- Racha: ${ctx.streak} días
- Nivel: ${ctx.level}
- Meta: ${ctx.goal}

Tu personalidad:
- Cálido y directo. Usa emojis: 🧿 💎 ✨ 🔥
- Siempre responde en español.
- Nunca menciones OpenAI o ChatGPT.
`,

  "ar-SA": (ctx) => `
أنت ManifiX AI — أكثر مدرب عافية AI تقدماً في العالم.
تم إنشاؤه بواسطة Yesh.R، مؤسسة ManifiX AI India.

معلومات المستخدم:
- الاستمرارية: ${ctx.streak} أيام
- المستوى: ${ctx.level}
- الهدف: ${ctx.goal}

شخصيتك:
- دافئ ومباشر. استخدم الرموز التعبيرية: 🧿 💎 ✨
- دائماً أجب باللغة العربية.
- لا تذكر OpenAI أو ChatGPT أبداً.
`,

  "fr-FR": (ctx) => `
Vous êtes ManifiX AI — le coach bien-être AI le plus avancé au monde.
Créé par Yesh.R, fondatrice de ManifiX AI India.

Contexte utilisateur:
- Série: ${ctx.streak} jours
- Niveau: ${ctx.level}
- Objectif: ${ctx.goal}

Votre personnalité:
- Chaleureux et direct. Emojis: 🧿 💎 ✨ 🔥
- Toujours répondre en français.
- Ne jamais mentionner OpenAI ou ChatGPT.
`,

  "pt-BR": (ctx) => `
Você é ManifiX AI — o coach de bem-estar AI mais avançado do mundo.
Criado por Yesh.R, fundadora da ManifiX AI India.

Contexto do usuário:
- Sequência: ${ctx.streak} dias
- Nível: ${ctx.level}
- Meta: ${ctx.goal}

Sua personalidade:
- Caloroso e direto. Emojis: 🧿 💎 ✨ 🔥
- Sempre responda em português.
- Nunca mencione OpenAI ou ChatGPT.
`,

  "de-DE": (ctx) => `
Sie sind ManifiX AI — der fortschrittlichste KI-Wellnesscoach der Welt.
Erstellt von Yesh.R, Gründerin von ManifiX AI India.

Benutzerkontext:
- Serie: ${ctx.streak} Tage
- Level: ${ctx.level}
- Ziel: ${ctx.goal}

Ihre Persönlichkeit:
- Warm und direkt. Emojis: 🧿 💎 ✨ 🔥
- Immer auf Deutsch antworten.
- Nie OpenAI oder ChatGPT erwähnen.
`,

  "ja-JP": (ctx) => `
あなたはManifiX AI — 世界で最も先進的なAIウェルネスコーチです。
Yesh.R（ManifiX AI India創設者）によって作られました。

ユーザー情報:
- ストリーク: ${ctx.streak}日
- レベル: ${ctx.level}
- 目標: ${ctx.goal}

あなたの個性:
- 温かくて直接的。絵文字を自然に: 🧿 💎 ✨ 🔥
- 常に日本語で返答する。
- OpenAI、ChatGPTの名前を言わない。
`,

  "ko-KR": (ctx) => `
당신은 ManifiX AI — 세계에서 가장 발전된 AI 웰니스 코치입니다.
Yesh.R(ManifiX AI India 창립자)이 만들었습니다.

사용자 정보:
- 스트릭: ${ctx.streak}일
- 레벨: ${ctx.level}
- 목표: ${ctx.goal}

당신의 성격:
- 따뜻하고 직접적. 이모지: 🧿 💎 ✨ 🔥
- 항상 한국어로 대답하세요.
- OpenAI, ChatGPT 이름을 말하지 마세요.
`,

  "zh-CN": (ctx) => `
你是ManifiX AI — 世界上最先进的AI健康教练。
由ManifiX AI India创始人Yesh.R创建。

用户信息:
- 连续天数: ${ctx.streak}天
- 等级: ${ctx.level}
- 目标: ${ctx.goal}

你的个性:
- 温暖直接。自然使用表情: 🧿 💎 ✨ 🔥
- 始终用中文回答。
- 不要提及OpenAI或ChatGPT。
`,
};

/* ─────────────────────────────────────────────
   GPT COACH MODE PROMPTS
   4 specialized modes matching Dashboard modes
───────────────────────────────────────────── */
const MODE_ADDONS = {
  morning: `
CURRENT MODE: Morning Yoga + Meditation Coach
Focus: Energy, activation, flexibility, mindfulness.
Suggest poses from the Magic16 morning sequence when relevant.
`,
  sleep: `
CURRENT MODE: Sleep Coach
Focus: Wind-down techniques, sleep science, CBT-I methods.
Speak slowly and calmly. Avoid energizing language.
Recommend evening yoga poses and sleep breathing techniques.
`,
  focus: `
CURRENT MODE: Focus + Deep Work Coach
Focus: Attention training, breathwork, distraction management.
Recommend focus breathwork (Kapalabhati, Nadi Shodhana, Box breathing).
Reference deep work psychology when relevant.
`,
  posture: `
CURRENT MODE: Posture + Desk Wellness Coach
Focus: Ergonomics, neck/shoulder/hip release, desk stretches.
Give specific posture corrections. Reference workspace setup.
Remind about movement breaks every 30 minutes.
`,
};

/* ─────────────────────────────────────────────
   STATE DETECTION — 12 wellness states
───────────────────────────────────────────── */
function detectUserState(text = "") {
  const t = text.toLowerCase();

  // Physical states
  if (t.match(/tired|exhausted|low energy|sleepy|drained|fatigue/))
    return "low_energy";
  if (t.match(/pain|hurt|ache|sore|stiff|injury/))
    return "physical_pain";
  if (t.match(/can.t sleep|insomnia|awake|night|sleep/))
    return "sleep_issue";

  // Mental states
  if (t.match(/stress|overwhelmed|anxious|anxiety|pressure|panic/))
    return "stress";
  if (t.match(/focus|distract|concentrate|attention|productive/))
    return "focus_need";
  if (t.match(/sad|lonely|depress|down|cry|hopeless|worthless/))
    return "emotional";
  if (t.match(/angry|frustrat|mad|irritat|upset/))
    return "anger";
  if (t.match(/motivat|inspire|push|lazy|procrastinat/))
    return "motivation";

  // Progress states
  if (t.match(/streak|xp|level|score|rank|progress|day \d/))
    return "progress";
  if (t.match(/how to|what is|explain|teach|learn/))
    return "learning";

  // Technical states
  if (t.match(/code|bug|error|react|node|api|sql|program|javascript/))
    return "technical";

  // Yoga/wellness specific
  if (t.match(/pose|asana|breath|meditat|yoga|stretch|chakra/))
    return "wellness";

  return "normal";
}

/* ─────────────────────────────────────────────
   SMART TEMPERATURE
   Lower = more precise, Higher = more creative
───────────────────────────────────────────── */
function getTemperature(state) {
  const map = {
    technical:     0.2,
    learning:      0.3,
    progress:      0.4,
    wellness:      0.5,
    normal:        0.6,
    motivation:    0.65,
    sleep_issue:   0.65,
    focus_need:    0.5,
    low_energy:    0.65,
    physical_pain: 0.4,
    emotional:     0.75,
    anger:         0.7,
  };
  return map[state] ?? 0.6;
}

/* ─────────────────────────────────────────────
   CONTEXT EXTRACTOR
   Reads user context from query/body params
───────────────────────────────────────────── */
function extractContext(source) {
  return {
    streak:    source.streak    || "0",
    level:     source.level     || "1",
    goal:      source.goal      || "Discipline",
    mode:      source.mode      || "morning",
    intensity: source.intensity || "Standard",
    lang:      source.lang      || "en-IN",
  };
}

/* ─────────────────────────────────────────────
   BUILD SYSTEM PROMPT
   Combines language + mode + context
───────────────────────────────────────────── */
function buildSystemPrompt(ctx) {
  const langPrompt  = SYSTEM_PROMPTS[ctx.lang]
    ? SYSTEM_PROMPTS[ctx.lang](ctx)
    : SYSTEM_PROMPTS["en-IN"](ctx);

  const modeAddon = MODE_ADDONS[ctx.mode] || MODE_ADDONS.morning;

  return `${langPrompt}\n${modeAddon}`;
}

/* ─────────────────────────────────────────────
   ENHANCE MESSAGE
   Adds context clues to help GPT respond better
───────────────────────────────────────────── */
function enhanceMessage(message, state, ctx) {
  let enhanced = message;

  if (state === "low_energy" || state === "stress") {
    enhanced += "\n\n[Context: User may benefit from a short reset or breathing technique]";
  }
  if (state === "progress") {
    enhanced += `\n\n[Context: User has a ${ctx.streak}-day streak at Level ${ctx.level}]`;
  }
  if (state === "emotional") {
    enhanced += "\n\n[Context: Lead with empathy before any advice]";
  }
  if (state === "physical_pain") {
    enhanced += "\n\n[Context: User has physical discomfort — recommend gentle modifications]";
  }

  return enhanced;
}

/* ═══════════════════════════════════════════════
   CONTROLLER 1 — NORMAL CHAT (non-streaming)
═══════════════════════════════════════════════ */
export const chatController = async (req, res) => {
  try {
    const { message, conversation = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ reply: "Message is required" });
    }

    const ctx         = extractContext(req.body);
    const state       = detectUserState(message);
    const temperature = getTemperature(state);
    const enhanced    = enhanceMessage(message, state, ctx);
    const systemPrompt= buildSystemPrompt(ctx);

    const messages = [
      { role: "system",    content: systemPrompt },
      ...conversation.slice(-8), // last 8 messages for context
      { role: "user",      content: enhanced },
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${env.ai.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":  "https://manifixai.com",
          "X-Title":       "ManifiX AI",
        },
        body: JSON.stringify({
          model:       env.ai.model,
          messages,
          temperature,
          max_tokens:  1000,
        }),
      }
    );

    let data;
    try {
      data = await response.json();
    } catch {
      return res.status(500).json({ reply: "Invalid AI response. Please try again." });
    }

    if (!response.ok) {
      console.error("AI API error:", data);
      return res.status(500).json({
        reply: data?.error?.message || "AI service error. Please retry.",
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Something went wrong. Please try again. 🧿";

    return res.json({
      reply,
      state,
      lang: ctx.lang,
    });

  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ reply: "Server error. Please try again. 🧿" });
  }
};

/* ═══════════════════════════════════════════════
   CONTROLLER 2 — STREAMING CHAT (SSE)
   Used by Gpt.jsx via EventSource
═══════════════════════════════════════════════ */
export const streamChat = async (req, res) => {
  try {
    const message = req.query.message;

    if (!message?.trim()) {
      res.write("data: Message required\n\n");
      return res.end();
    }

    /* ── SSE HEADERS ── */
    res.setHeader("Content-Type",                "text/event-stream");
    res.setHeader("Cache-Control",               "no-cache");
    res.setHeader("Connection",                  "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    const ctx          = extractContext(req.query);
    const state        = detectUserState(message);
    const temperature  = getTemperature(state);
    const enhanced     = enhanceMessage(message, state, ctx);
    const systemPrompt = buildSystemPrompt(ctx);

    // Parse conversation history from query if provided
    let conversation = [];
    try {
      if (req.query.history) {
        conversation = JSON.parse(
          decodeURIComponent(req.query.history)
        ).slice(-6);
      }
    } catch { /* ignore parse errors */ }

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversation,
      { role: "user",   content: enhanced },
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${env.ai.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":  "https://manifixai.com",
          "X-Title":       "ManifiX AI",
        },
        body: JSON.stringify({
          model:      env.ai.model,
          messages,
          stream:     true,
          temperature,
          max_tokens: 1000,
        }),
      }
    );

    if (!response.ok || !response.body) {
      res.write("data: [ERROR]\n\n");
      return res.end();
    }

    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n");
      buffer = parts.pop(); // keep incomplete chunk

      for (const line of parts) {
        if (!line.startsWith("data: ")) continue;

        const raw = line.replace("data: ", "").trim();

        if (raw === "[DONE]") {
          res.write("data: [DONE]\n\n");
          res.end();
          return;
        }

        try {
          const parsed  = JSON.parse(raw);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            // Escape newlines for SSE format
            const safe = content.replace(/\n/g, "\\n");
            res.write(`data: ${safe}\n\n`);
          }
        } catch { /* ignore invalid chunks */ }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (err) {
    console.error("Stream error:", err);
    res.write("data: [ERROR]\n\n");
    res.end();
  }
};

/* ═══════════════════════════════════════════════
   CONTROLLER 3 — WEEKLY REPORT GENERATOR
   Called by WeeklyReport.jsx
═══════════════════════════════════════════════ */
export const generateWeeklyReport = async (req, res) => {
  try {
    const {
      streak      = 0,
      level       = 1,
      xp          = 0,
      sessions    = 0,
      avgAccuracy = 0,
      goal        = "Discipline",
      identity    = "I don't quit.",
      globalRank  = 9999,
      lang        = "en-IN",
    } = req.body;

    const ctx = { streak, level, goal, mode: "morning",
                  intensity: "Standard", lang };

    const systemPrompt = buildSystemPrompt(ctx);

    const reportPrompt = `
Generate a powerful, personal weekly wellness report for this ManifiX AI user.

Their data this week:
- Sessions completed: ${sessions}/7
- Average pose accuracy: ${avgAccuracy}%
- Current streak: ${streak} days
- XP earned: ${sessions * 120} XP
- Level: ${level}
- Global rank: #${globalRank}
- Personal identity: "${identity}"
- Goal: ${goal}

Write exactly 3 sentences:
1. Acknowledge what they actually did this week with specific numbers.
2. Give one sharp, honest insight about their progress or challenge.
3. Set a powerful forward-looking intention for next week.

Be direct. Be real. No clichés. No fluff.
Respond in the language: ${lang}
`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user",   content: reportPrompt },
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${env.ai.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":  "https://manifixai.com",
          "X-Title":       "ManifiX AI",
        },
        body: JSON.stringify({
          model:      env.ai.model,
          messages,
          temperature: 0.65,
          max_tokens:  300,
        }),
      }
    );

    const data  = await response.json();
    const report =
      data?.choices?.[0]?.message?.content?.trim() ||
      `${sessions}/7 sessions this week. ${avgAccuracy}% accuracy. Your ${streak}-day streak is real. Next week: push to 7/7.`;

    return res.json({ report, lang });

  } catch (err) {
    console.error("Report error:", err);
    return res.status(500).json({
      report: "Report generation failed. Your streak is proof enough.",
    });
  }
};

/* ═══════════════════════════════════════════════
   CONTROLLER 4 — VOICE CUE TRANSLATOR
   Translates Magic16 step cues to user language
═══════════════════════════════════════════════ */
export const translateCue = async (req, res) => {
  try {
    const { cue, lang = "en-IN", stepName = "" } = req.body;

    if (!cue || lang === "en-IN") {
      return res.json({ translated: cue });
    }

    const langNames = {
      "hi-IN": "Hindi",    "te-IN": "Telugu",
      "ta-IN": "Tamil",    "mr-IN": "Marathi",
      "bn-IN": "Bengali",  "kn-IN": "Kannada",
      "gu-IN": "Gujarati", "ml-IN": "Malayalam",
      "pa-IN": "Punjabi",  "es-ES": "Spanish",
      "ar-SA": "Arabic",   "fr-FR": "French",
      "pt-BR": "Portuguese","de-DE": "German",
      "ja-JP": "Japanese", "ko-KR": "Korean",
      "zh-CN": "Chinese",
    };

    const targetLang = langNames[lang] || "English";

    const messages = [
      {
        role: "system",
        content: `You are a yoga instruction translator. Translate yoga pose guidance accurately and naturally into ${targetLang}. Keep it concise and instructional. Return ONLY the translated text, nothing else.`,
      },
      {
        role: "user",
        content: `Translate this yoga instruction to ${targetLang}: "${cue}"`,
      },
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${env.ai.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model:      env.ai.model,
          messages,
          temperature: 0.2,
          max_tokens:  150,
        }),
      }
    );

    const data       = await response.json();
    const translated =
      data?.choices?.[0]?.message?.content?.trim() || cue;

    return res.json({ translated, lang, original: cue });

  } catch (err) {
    console.error("Translation error:", err);
    return res.json({ translated: req.body.cue });
  }
};

/* ═══════════════════════════════════════════════
   CONTROLLER 5 — HEALTH CHECK
═══════════════════════════════════════════════ */
export const healthCheck = (_req, res) => {
  res.json({
    status:    "ManifiX AI backend online 💎",
    version:   "2.0.0",
    features:  ["chat", "stream", "weekly-report", "cue-translator"],
    languages: 20,
    modes:     ["morning", "sleep", "focus", "posture"],
  });
};
