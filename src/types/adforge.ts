export type LanguageOption = 'hinglish' | 'hindi' | 'english';

export type VideoLengthOption = '15s' | '30s' | '45s' | '60s';

export type AdGoalOption = 'sales' | 'leads' | 'traffic' | 'awareness';

export type CreativeStyleOption =
  | 'UGC'
  | 'Talking Head'
  | 'Problem-Solution'
  | 'Before-After'
  | 'Testimonial'
  | 'Storytelling';

export type EmotionToneOption =
  | 'Urgent'
  | 'Emotional'
  | 'Funny'
  | 'Authority'
  | 'FOMO'
  | 'Trustworthy'
  | 'Empathetic'
  | 'Conversational';

export type RewriteMode =
  | 'more_ugc'
  | 'more_emotional'
  | 'more_urgent'
  | 'shorter_punchier'
  | 'bangla_polish';

export type VoicePrebuiltName = 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon';

export interface AdBrief {
  productName: string;
  productDescription: string;
  targetAudience: string;
  mainOffer: string;
  emotionTone: EmotionToneOption;
  adGoal: AdGoalOption;
  preferredStyle: CreativeStyleOption;
  language: LanguageOption;
  videoLength: VideoLengthOption;
  scriptCount: number;
}

export interface ScriptSegment {
  stage: 'Hook' | 'Problem' | 'Agitation' | 'Solution' | 'Social Proof' | 'Strong CTA';
  timing: string;
  spokenLine: string;
  visualAction: string;
  onScreenText: string;
}

export interface CtaVariations {
  strong: string;
  direct: string;
  urgency: string;
}

export interface VideoPrompts {
  kling: string;
  runway: string;
  luma: string;
  pika: string;
  hailuo: string;
}

export interface StaticAndThumbnailCopy {
  thumbnailVisual: string;
  thumbnailHeadline: string;
  primaryTextShort: string;
  primaryTextStory: string;
  metaHeadline: string;
  metaDescription: string;
  ctaButton: string;
}

export interface AdScript {
  id: string;
  title: string;
  angle: string;
  hookType: string;
  estimatedDuration: string;
  segments: ScriptSegment[];
  voiceoverScript: string;
  visualStyle: string;
  cameraAngles: string[];
  bRollIdeas: string[];
  lightingAndSetting: string;
  ctaVariations: CtaVariations;
  videoPrompts: VideoPrompts;
  staticAndThumbnail: StaticAndThumbnailCopy;
}

export interface AdGenerationResult {
  detectedBriefSummary: string;
  inferredBrief?: Partial<AdBrief>;
  scripts: AdScript[];
}

export interface SavedProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  mode: 'brief' | 'quick';
  quickInput?: string;
  brief: AdBrief;
  result: AdGenerationResult;
  pinned?: boolean;
}

export interface NicheTemplate {
  id: string;
  niche: string;
  title: string;
  summary: string;
  brief: AdBrief;
}

export interface VoicePreset {
  id: string;
  label: string;
  description: string;
  voiceName: VoicePrebuiltName;
  stylePrompt: string;
}
