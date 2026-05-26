export interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  prompt: (context: any) => string;
  type: "text" | "code";
  language?: string;
  dependsOn: string[];
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    title: "基礎背景研究",
    description: "針對主題進行深入的文化、歷史或背景資料彙整。",
    type: "text",
    dependsOn: ["theme"],
    prompt: (ctx) => `你是一位民俗文化專家，請針對主題「${ctx.theme}」進行深入的背景研究。
內容需包含：文化由來、核心意義、相關傳說或歷史紀錄。
請以結構化、易讀的段落撰寫。
【最高指導原則】：
1. 嚴守台灣傳統道教與民間信仰之正統記載，不可混入其他無關之奇幻文學或西方神話。
2. 內容必須鎖定在「正史記載」、「受官方認可之《道藏》」或「台灣指標性大廟（如大甲鎮瀾宮、松山奉天宮）之官方沿革」。
3. 嚴禁任何怪力亂神、無根據的鄉野奇談或 AI 隨意編造的法術情節。
4. 敘事範圍僅限於：文化與歷史起源神明、生平/由來、核心精神與當代象徵意義、經典神話、民間傳說或歷史史料記載、獨特的台灣民俗科儀、藝術表徵。`,
  },
  {
    id: 2,
    title: "長影音腳本撰寫",
    description: "根據基礎背景，產出 5-10 分鐘的 YouTube 長影片文案。",
    type: "text",
    dependsOn: ["theme", "step1"],
    prompt: (ctx) => `請根據以下背景資料，為「${ctx.theme}」撰寫一份 5-10 分鐘的 YouTube 長影片腳本。
背景資料：
${ctx.step1}

腳本需求：包含引人入勝的開場、深度內容解析、以及總結與互動引導。`,
  },
  {
    id: 3,
    title: "長影音 SEO 優化",
    description: "生成標題、標籤與說明欄內容。",
    type: "text",
    dependsOn: ["theme", "step2"],
    prompt: (ctx) => `請根據以下長影音腳本，為主題「${ctx.theme}」生成 SEO 優化內容。
腳本內容：
${ctx.step2}

請提供：5 個吸引人的標題、一組關鍵字標籤、以及一段包含時間軸建議的影片說明欄。`,
  },
  {
    id: 4,
    title: "短影音腳本撰寫",
    description: "產出 60 秒內的精簡爆款短影片文案。",
    type: "text",
    dependsOn: ["theme", "step1"],
    prompt: (ctx) => `請根據以下背景資料，為「${ctx.theme}」撰寫一份 60 秒內的 YouTube Shorts/TikTok 短影片腳本。
背景資料：
${ctx.step1}

需求：節奏明快，前 3 秒必須有鉤子 (Hook)，內容精簡有力。`,
  },
  {
    id: 5,
    title: "短影音 SEO 優化",
    description: "生成短影片標題與標籤。",
    type: "text",
    dependsOn: ["theme", "step4"],
    prompt: (ctx) => `請根據以下短影音腳本，產出適合的 SEO 內容。
腳本內容：
${ctx.step4}

請提供：3 個衝擊力強的標題、以及 10 個熱門 Hasthtags。`,
  },
  {
    id: 6,
    title: "長影音縮圖設計",
    description: "生成 3 組 16:9 YouTube 縮圖文案與 AI 繪圖指令。",
    type: "code",
    language: "markdown",
    dependsOn: ["theme", "step3"],
    prompt: (ctx) => `請針對主題「${ctx.theme}」生成 3 組長影音 YouTube 縮圖設計 (16:9)。
參考背景：${ctx.step3}

每組必須包含：
1. 【縮圖名稱】
2. 高點擊文案：主標與副標
3. AI Prompt (中文)：必須包含風格設定 (colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed)，並詳述畫面細節與文字擺放。
4. AI Prompt (English)：對應的英文 Prompt，結尾註明 16:9。

請【嚴格】依照以下格式輸出，不要改變標題名稱或新增無謂的符號：

### 第一組：[縮圖名稱]
主標：[主標內容]
副標：[副標內容]
中文：[中文Prompt]
English：[英文Prompt]`,
  },
  {
    id: 7,
    title: "短影音縮圖設計",
    description: "生成 3 組 9:16 短影音縮圖文案與 AI 繪圖指令。",
    type: "code",
    language: "markdown",
    dependsOn: ["theme", "step5"],
    prompt: (ctx) => `請針對主題「${ctx.theme}」生成 3 組短影音 YouTube 縮圖設計 (9:16)。
參考背景：${ctx.step5}

每組必須包含：
1. 【短影音縮圖 [編號]】
2. 高點擊文案：衝擊力強的主標
3. AI Prompt (中文)：包含風格設定 (colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed)，強調直式構圖與快速吸睛的視覺要素。
4. AI Prompt (English)：對應的英文 Prompt，結尾註明 9:16。

請【嚴格】依照以下格式輸出，不要改變標題名稱或新增無謂的符號：

### 第一組：[短影音縮圖名稱]
高點擊文案：[主標內容]
中文：[中文Prompt]
English：[英文Prompt]`,
  },
  {
    id: 8,
    title: "彩墨風格意象圖",
    description: "生成 3 組 16:9 意象圖指令與搭配詩詞。",
    type: "code",
    language: "markdown",
    dependsOn: ["theme"],
    prompt: (ctx) => `請針對主題「${ctx.theme}」生成 3 組 16:9 彩墨風格意象圖。
要求：
1. 每組需有【意象圖名稱】。
2. 視覺設計：詳述畫面構成，必須包含風格標籤 (colorful ink wash, vivid diffusion...)，強調無人物、充滿禪意或史詩感的氛圍。
3. 搭配詩詞：撰寫一首七言四句或相關風格的詩詞，呼應畫面意象。

風格需維持統一的高級感與傳統文化底蘊。

請【嚴格】依照以下格式輸出，不要改變標題名稱或新增無謂的符號：

### 第一組：[意象圖名稱]
詩詞：[七言四句詩詞]
中文：[中文畫面描述]
English：[英文Prompt]`,
  },
  {
    id: 9,
    title: "Suno AI 配樂設計",
    description: "生成 3 組符合主題氛圍的音樂生成指令。",
    type: "code",
    language: "markdown",
    dependsOn: ["theme", "step1"],
    prompt: (ctx) => `請針對主題「${ctx.theme}」生成 3 組 Suno AI 音樂生成 Prompt。
請依據以下三種場景設計：
1. 史詩感：講述神話或宏大開場。
2. 敘事感：講述文化細節或溫暖歷史。
3. 活力感：實用攻略或現代交織節奏。

每組需包含：
- 【音樂 [編號]：[場景描述]】
- 適用場景說明。
- Suno AI Prompt：包含 Music Style、Instruments、Tempo 等參數。

請【嚴格】依照以下格式輸出，不要改變標題名稱或新增無謂的符號：

### 第一組：[史詩感/敘事感/活力感]
適用場景：[適用場景說明]
Suno AI Prompt：[包含參數的Prompt內容]`,
  },
];
