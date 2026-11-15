import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type {
  AdBrief,
  AdGenerationResult,
  AdScript,
  LanguageOption,
  RewriteMode,
  StaticAndThumbnailCopy,
  VideoPrompts,
  VoicePrebuiltName,
} from '../src/types/adforge.ts';

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function languageInstruction(language: LanguageOption | string): string {
  if (language === 'hinglish' || language === 'hindi_english') {
    return (
      'Write spoken dialogue, hooks, on-screen captions, and Meta primary ad copy in natural conversational Indian Hinglish (spoken Hindi + everyday English words written cleanly in Roman script as Indian UGC creators speak on Instagram Reels — e.g., "Agar aapko bhi lagta hai...", "Link bio mein hai", "COD available hai"). Keep visual directions, camera notes, and AI video generator prompts in clear English.'
    );
  }
  if (language === 'hindi') {
    return 'Write all spoken dialogue, hooks, on-screen captions, and Meta primary ad copy in natural, modern conversational Hindi using Devanagari script (हिन्दी) — warm, relatable everyday spoken Hindi (avoid overly stiff textbook Sanskritized phrasing, keep natural product/offer terms clear). Keep visual directions, camera notes, and AI video generator prompts in clear English.';
  }
  return 'Write all spoken dialogue, hooks, on-screen captions, Meta ad copy, visual directions, and AI video prompts in sharp, natural conversational English tailored for high-converting Meta UGC ads.';
}

const SCRIPT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    angle: { type: Type.STRING },
    hookType: { type: Type.STRING },
    estimatedDuration: { type: Type.STRING },
    segments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stage: {
            type: Type.STRING,
            description: 'Must be one of: Hook, Problem, Agitation, Solution, Social Proof, Strong CTA',
          },
          timing: { type: Type.STRING, description: 'Exact timestamp range, e.g. 0:00–0:03' },
          spokenLine: { type: Type.STRING },
          visualAction: { type: Type.STRING },
          onScreenText: { type: Type.STRING },
        },
        required: ['stage', 'timing', 'spokenLine', 'visualAction', 'onScreenText'],
      },
    },
    voiceoverScript: { type: Type.STRING },
    visualStyle: { type: Type.STRING },
    cameraAngles: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    bRollIdeas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    lightingAndSetting: { type: Type.STRING },
    ctaVariations: {
      type: Type.OBJECT,
      properties: {
        strong: { type: Type.STRING },
        direct: { type: Type.STRING },
        urgency: { type: Type.STRING },
      },
      required: ['strong', 'direct', 'urgency'],
    },
    videoPrompts: {
      type: Type.OBJECT,
      properties: {
        kling: { type: Type.STRING },
        runway: { type: Type.STRING },
        luma: { type: Type.STRING },
        pika: { type: Type.STRING },
        hailuo: { type: Type.STRING },
      },
      required: ['kling', 'runway', 'luma', 'pika', 'hailuo'],
    },
    staticAndThumbnail: {
      type: Type.OBJECT,
      properties: {
        thumbnailVisual: { type: Type.STRING },
        thumbnailHeadline: { type: Type.STRING },
        primaryTextShort: { type: Type.STRING },
        primaryTextStory: { type: Type.STRING },
        metaHeadline: { type: Type.STRING },
        metaDescription: { type: Type.STRING },
        ctaButton: { type: Type.STRING },
      },
      required: [
        'thumbnailVisual',
        'thumbnailHeadline',
        'primaryTextShort',
        'primaryTextStory',
        'metaHeadline',
        'metaDescription',
        'ctaButton',
      ],
    },
  },
  required: [
    'id',
    'title',
    'angle',
    'hookType',
    'estimatedDuration',
    'segments',
    'voiceoverScript',
    'visualStyle',
    'cameraAngles',
    'bRollIdeas',
    'lightingAndSetting',
    'ctaVariations',
    'videoPrompts',
    'staticAndThumbnail',
  ],
};

const GENERATION_SYSTEM_INSTRUCTION = `You are a world-class performance creative strategist and Meta (Facebook/Instagram) UGC video ad director, deeply experienced in South Asian (India & Bangladesh) D2C e-commerce, spiritual/wellness products, digital info-products, and global performance creative.

Your core philosophy:
1. Native, raw, human UGC outperforms glossy corporate ads on Meta feeds and Reels.
2. The first 3 seconds (0:00–0:03) decide 80% of ad performance. Every script MUST open with an undeniable scroll-stopping pattern interrupt, hyper-specific pain callout, visual curiosity gap, or myth-busting line.
3. Every script MUST follow the exact 6-beat arc:
   - Hook (0:00–0:03)
   - Problem
   - Agitation
   - Solution
   - Social Proof
   - Strong CTA
4. Voiceover scripts must read aloud naturally with conversational rhythm, short breaths, and zero robotic marketing clichés ("revolutionary", "elevate your lifestyle", "game-changer"). For spiritual, Rudraksha, crystal, astrology, or Vastu products, keep the tone deeply respectful, authentic, grounded in daily peace/clarity/tradition, and trust-focused (never fake miracle hype).
5. AI Video Prompts (for Kling, Runway, Luma, Pika, Hailuo) must be ready-to-paste, hyper-specific prompts describing smartphone UGC realism, natural window lighting, handheld micro-shake, lens framing, and subject action tailored to the script's key scenes.
6. Ensure every script variation uses a genuinely distinct creative angle (e.g., Skeptic Confession, POV Relatable Struggle, Rapid Demo Proof, Friend Recommendation, Myth Bust / Comparison).`;

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      if (status === 400 || status === 401 || status === 403 || status === 404) {
        throw err;
      }
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

async function enrichFromUrlsOrDomains(ai: GoogleGenAI, rawText: string): Promise<string> {
  const hasUrlOrDomain = /(https?:\/\/[^\s]+|\b[a-z0-9-]+\.(in|store|com|co|org|net)\b)/i.test(
    rawText,
  );
  if (!hasUrlOrDomain) return '';

  try {
    const res = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Inspect the URLs or website domains mentioned in this input and summarize the real products, pricing/offers, trust signals (COD, instant download, certification, policies), and target audience in concise factual bullet points so an ad creative strategist can write accurate Meta video ads:\n\n${rawText}`,
      config: {
        tools: [{ urlContext: {} }, { googleSearch: {} }],
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });
    return (res.text ?? '').trim();
  } catch (err) {
    console.warn('URL context enrichment skipped:', err);
    return '';
  }
}

export async function generateAdPackage(params: {
  mode: 'brief' | 'quick';
  brief: AdBrief;
  quickInput?: string;
}): Promise<AdGenerationResult> {
  const ai = getClient();
  const count = Math.min(5, Math.max(3, params.brief.scriptCount || 4));
  const langRule = languageInstruction(params.brief.language);

  const quickSourceText = params.quickInput || params.brief.productDescription;
  const enrichedContext =
    params.mode === 'quick' ? await enrichFromUrlsOrDomains(ai, quickSourceText) : '';

  const promptContent =
    params.mode === 'quick'
      ? `QUICK MODE INPUT (Product URL, rough note, or description):
"""
${quickSourceText}
"""
${
  enrichedContext
    ? `\nLIVE WEBSITE & PRODUCT CONTEXT RETRIEVED:\n"""\n${enrichedContext}\n"""\n`
    : ''
}
Preferences selected by user:
- Language: ${params.brief.language}
- Target Video Duration: ${params.brief.videoLength}
- Generate exactly ${count} distinct ad scripts.

First infer the product/service name, ideal Meta target audience, core pain points, realistic offer/USP, best tone, and UGC style from the Quick Mode input (and retrieved website context if present). Then generate the full creative package.

Language requirement:
${langRule}`
      : `AD BRIEF:
- Product / Service: ${params.brief.productName}
- Description: ${params.brief.productDescription}
- Target Audience (age, gender, interests, pain points): ${params.brief.targetAudience}
- Main Offer / Discount / USP: ${params.brief.mainOffer}
- Desired Emotion / Tone: ${params.brief.emotionTone}
- Ad Goal: ${params.brief.adGoal}
- Preferred Creative Style: ${params.brief.preferredStyle}
- Target Video Length: ${params.brief.videoLength}
- Number of Distinct Scripts to Generate: ${count}

Language requirement:
${langRule}

Ensure timestamps across the 6 segments of each script add up cleanly to ${params.brief.videoLength} (with Hook always strictly 0:00–0:03).`;

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: promptContent,
      config: {
        systemInstruction: GENERATION_SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedBriefSummary: {
              type: Type.STRING,
              description: 'Concise 1-2 sentence strategic summary of the product positioning and audience angle.',
            },
            inferredBrief: {
              type: Type.OBJECT,
              properties: {
                productName: { type: Type.STRING },
                productDescription: { type: Type.STRING },
                targetAudience: { type: Type.STRING },
                mainOffer: { type: Type.STRING },
              },
            },
            scripts: {
              type: Type.ARRAY,
              items: SCRIPT_SCHEMA,
            },
          },
          required: ['detectedBriefSummary', 'scripts'],
        },
      },
    }),
  );

  const rawText = (response.text ?? '{}').trim();
  const parsed = JSON.parse(rawText) as AdGenerationResult;

  if (!parsed.scripts || !Array.isArray(parsed.scripts) || parsed.scripts.length === 0) {
    throw new Error('Model returned an empty script list. Please try again.');
  }

  return parsed;
}

export async function rewriteScriptVariant(params: {
  script: AdScript;
  mode: RewriteMode;
  language: LanguageOption;
}): Promise<Pick<AdScript, 'title' | 'segments' | 'voiceoverScript' | 'ctaVariations'>> {
  const ai = getClient();
  const modeInstructions: Record<RewriteMode, string> = {
    more_ugc:
      'Make this feel 2x more raw, unscripted, self-shot on a phone in a bedroom/kitchen. Use casual filler transitions, honest skepticism, and zero polished ad-agency words.',
    more_emotional:
      'Deepen the emotional resonance and relatable human struggle in Problem and Agitation. Tap into daily frustration, relief, and genuine empathy before introducing the solution.',
    more_urgent:
      'Sharpen urgency and FOMO across the Hook, Social Proof, and Strong CTA. Emphasize limited stock, fast-ending offer, and why waiting costs them.',
    shorter_punchier:
      'Tighten every spoken line by ~30%. Cut fluff words, make sentences snappy and fast-paced for Reels retention, and sharpen the 3-second hook.',
    bangla_polish:
      params.language === 'hindi'
        ? 'Refine the spoken lines into ultra-natural conversational everyday Hindi (Devanagari हिन्दी) with zero stiff textbook or robotic translation tone.'
        : params.language === 'english'
          ? 'Refine the spoken lines into ultra-natural conversational everyday English with zero ad-agency buzzwords.'
          : 'Refine the spoken lines into ultra-natural Indian creator Hinglish (Roman Hindi + everyday English words) with crisp Reels delivery and zero robotic tone.',
  };

  const prompt = `Rewrite the following Meta video ad script according to this creative direction:
DIRECTION: ${modeInstructions[params.mode]}

LANGUAGE RULE: ${languageInstruction(params.language)}

CURRENT SCRIPT JSON:
${JSON.stringify({
    title: params.script.title,
    estimatedDuration: params.script.estimatedDuration,
    segments: params.script.segments,
    voiceoverScript: params.script.voiceoverScript,
    ctaVariations: params.script.ctaVariations,
  })}

Preserve the exact 6-segment structure (Hook, Problem, Agitation, Solution, Social Proof, Strong CTA) and matching timestamps.`;

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction: GENERATION_SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            segments: SCRIPT_SCHEMA.properties.segments,
            voiceoverScript: { type: Type.STRING },
            ctaVariations: SCRIPT_SCHEMA.properties.ctaVariations,
          },
          required: ['title', 'segments', 'voiceoverScript', 'ctaVariations'],
        },
      },
    }),
  );

  const rawText = (response.text ?? '{}').trim();
  return JSON.parse(rawText);
}

export async function regenerateVideoPrompts(params: {
  script: AdScript;
  aspectRatio: '9:16' | '4:5' | '16:9';
  sceneFocus: string;
}): Promise<VideoPrompts> {
  const ai = getClient();

  const prompt = `Generate ready-to-copy AI video generation prompts tailored to this ad script's key visual scene (${params.sceneFocus}) in ${params.aspectRatio} framing.

SCRIPT TITLE: ${params.script.title}
VISUAL STYLE: ${params.script.visualStyle}
HOOK VISUAL: ${params.script.segments[0]?.visualAction ?? ''}
SOLUTION VISUAL: ${params.script.segments[3]?.visualAction ?? ''}

Craft platform-specific prompts optimized for each tool's syntax and strengths:
- kling: Kling AI (realistic human motion, handheld iPhone camera physics, natural indoor lighting, ${params.aspectRatio})
- runway: Runway Gen-3/Gen-4 (cinematic yet authentic UGC camera motion, lens, depth, subject expression)
- luma: Luma Dream Machine (natural continuous shot, realistic texture, smooth handheld tracking)
- pika: Pika (punchy visual hook, dynamic product motion or transformation, crisp framing)
- hailuo: Hailuo / MiniMax (expressive natural human face/hands interaction, realistic South Asian/global creator UGC aesthetic)`;

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: SCRIPT_SCHEMA.properties.videoPrompts,
      },
    }),
  );

  const rawText = (response.text ?? '{}').trim();
  return JSON.parse(rawText) as VideoPrompts;
}

export async function regenerateStaticCopy(params: {
  script: AdScript;
  brief: AdBrief;
}): Promise<StaticAndThumbnailCopy> {
  const ai = getClient();

  const prompt = `Create fresh Meta Feed & Reels thumbnail concepts and static ad copy paired with this script.
Product: ${params.brief.productName}
Offer/USP: ${params.brief.mainOffer}
Language rule: ${languageInstruction(params.brief.language)}
Hook spoken line: ${params.script.segments[0]?.spokenLine ?? ''}
CTA: ${params.script.ctaVariations.strong}`;

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: SCRIPT_SCHEMA.properties.staticAndThumbnail,
      },
    }),
  );

  const rawText = (response.text ?? '{}').trim();
  return JSON.parse(rawText) as StaticAndThumbnailCopy;
}

export async function generateVoiceoverAudio(params: {
  text: string;
  voiceDescription: string;
  voiceName: VoicePrebuiltName;
}): Promise<{ audioBase64: string; mimeType: string }> {
  const ai = getClient();

  const cleanText = params.text.trim().slice(0, 2200);
  if (!cleanText) {
    throw new Error('Voiceover text cannot be empty.');
  }

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: params.voiceDescription || 'Natural, authentic, conversational UGC creator',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: params.voiceName || 'Kore',
            },
          },
        },
      },
    }),
  );

  const part = response.candidates?.[0]?.content?.parts?.[0];
  const base64Audio = part?.inlineData?.data;
  const mimeType = part?.inlineData?.mimeType || 'audio/wav';

  if (!base64Audio) {
    throw new Error('No audio returned from voice generation model. Try shorter or cleaner text.');
  }

  return {
    audioBase64: base64Audio,
    mimeType,
  };
}
