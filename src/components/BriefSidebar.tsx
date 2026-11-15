import { BookOpen, Loader2, Sparkles, Zap } from 'lucide-react';
import type {
  AdBrief,
  AdGoalOption,
  CreativeStyleOption,
  EmotionToneOption,
  LanguageOption,
  VideoLengthOption,
} from '../types/adforge';

interface BriefSidebarProps {
  mode: 'brief' | 'quick';
  onModeChange: (mode: 'brief' | 'quick') => void;
  brief: AdBrief;
  onBriefChange: (updated: AdBrief) => void;
  quickInput: string;
  onQuickInputChange: (val: string) => void;
  onGenerate: () => void;
  onOpenTemplates: () => void;
  isGenerating: boolean;
}

const EMOTIONS: EmotionToneOption[] = [
  'Urgent',
  'Emotional',
  'Trustworthy',
  'FOMO',
  'Empathetic',
  'Authority',
  'Conversational',
  'Funny',
];

const GOALS: { value: AdGoalOption; label: string }[] = [
  { value: 'sales', label: 'Direct Sales' },
  { value: 'leads', label: 'Leads / Inbox' },
  { value: 'traffic', label: 'Traffic / Clicks' },
  { value: 'awareness', label: 'Awareness' },
];

const STYLES: CreativeStyleOption[] = [
  'UGC',
  'Talking Head',
  'Problem-Solution',
  'Before-After',
  'Testimonial',
  'Storytelling',
];

const LANGUAGES: { value: LanguageOption; label: string }[] = [
  { value: 'hinglish', label: 'Hinglish' },
  { value: 'hindi', label: 'Hindi (हिन्दी)' },
  { value: 'english', label: 'English' },
];

const LENGTHS: VideoLengthOption[] = ['15s', '30s', '45s', '60s'];

export function BriefSidebar({
  mode,
  onModeChange,
  brief,
  onBriefChange,
  quickInput,
  onQuickInputChange,
  onGenerate,
  onOpenTemplates,
  isGenerating,
}: BriefSidebarProps) {
  const updateField = <K extends keyof AdBrief>(key: K, value: AdBrief[K]) => {
    onBriefChange({ ...brief, [key]: value });
  };

  const canSubmit =
    mode === 'quick'
      ? quickInput.trim().length >= 8
      : brief.productName.trim().length > 0 && brief.productDescription.trim().length > 0;

  return (
    <aside className="w-full lg:w-[390px] xl:w-[420px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#0E1014] flex flex-col">
      {/* Mode Switcher + Template Trigger */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-3.5">
        <div
          className="inline-flex rounded-lg bg-[#171A20] p-1 border border-white/[0.06]"
          role="tablist"
          aria-label="Input mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'brief'}
            onClick={() => onModeChange('brief')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'brief'
                ? 'bg-[#232730] text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Brief Mode
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'quick'}
            onClick={() => onModeChange('quick')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'quick'
                ? 'bg-[#232730] text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-[#FF5A1F]" />
            Quick Mode
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenTemplates}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Templates
        </button>
      </div>

      {/* Form Body */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit && !isGenerating) onGenerate();
        }}
        className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
      >
        {mode === 'quick' ? (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="quick-input"
                className="block text-sm font-medium text-zinc-200 mb-1.5"
              >
                Paste product link or rough description
              </label>
              <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                Drop any product URL (e.g. rudrasacred.in or astrosacred.store) or rough pitch. AdForge reads the page context, infers the audience, and writes full UGC scripts.
              </p>
              <textarea
                id="quick-input"
                rows={7}
                value={quickInput}
                onChange={(e) => onQuickInputChange(e.target.value)}
                placeholder="e.g. https://rudrasacred.in Karungali Mala + Pyrite Money Magnet Combo with COD, OR https://astrosacred.store 400+ Jyotish Ebooks Bundle instant download..."
                className="w-full rounded-lg border border-white/[0.1] bg-[#14171D] px-3.5 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#FF5A1F] focus:outline-none font-bengali-aware"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="product-name"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Product or Service Name
              </label>
              <input
                id="product-name"
                type="text"
                value={brief.productName}
                onChange={(e) => updateField('productName', e.target.value)}
                placeholder="e.g. PureDew Rice & Niacinamide Serum"
                className="w-full rounded-lg border border-white/[0.1] bg-[#14171D] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#FF5A1F] focus:outline-none font-bengali-aware"
              />
            </div>

            <div>
              <label
                htmlFor="product-desc"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Short Description & Core Benefit
              </label>
              <textarea
                id="product-desc"
                rows={3}
                value={brief.productDescription}
                onChange={(e) => updateField('productDescription', e.target.value)}
                placeholder="What does it do, how does it work, and why is it better than alternatives?"
                className="w-full rounded-lg border border-white/[0.1] bg-[#14171D] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#FF5A1F] focus:outline-none font-bengali-aware"
              />
            </div>

            <div>
              <label
                htmlFor="target-audience"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Target Audience (Age, Gender, Interests, Pain Points)
              </label>
              <textarea
                id="target-audience"
                rows={2}
                value={brief.targetAudience}
                onChange={(e) => updateField('targetAudience', e.target.value)}
                placeholder="e.g. Dhaka women 20–34 frustrated with sticky serums in humid weather"
                className="w-full rounded-lg border border-white/[0.1] bg-[#14171D] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#FF5A1F] focus:outline-none font-bengali-aware"
              />
            </div>

            <div>
              <label
                htmlFor="main-offer"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Main Offer / Discount / USP
              </label>
              <input
                id="main-offer"
                type="text"
                value={brief.mainOffer}
                onChange={(e) => updateField('mainOffer', e.target.value)}
                placeholder="e.g. 30% Off + Free Home Delivery + Cash on Delivery"
                className="w-full rounded-lg border border-white/[0.1] bg-[#14171D] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#FF5A1F] focus:outline-none font-bengali-aware"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="emotion-tone"
                  className="block text-xs font-medium text-zinc-300 mb-1.5"
                >
                  Emotion / Tone
                </label>
                <select
                  id="emotion-tone"
                  value={brief.emotionTone}
                  onChange={(e) => updateField('emotionTone', e.target.value as EmotionToneOption)}
                  className="w-full rounded-lg border border-white/[0.1] bg-[#14171D] px-3 py-2.5 text-sm text-white focus:border-[#FF5A1F] focus:outline-none"
                >
                  {EMOTIONS.map((em) => (
                    <option key={em} value={em}>
                      {em}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ad-goal"
                  className="block text-xs font-medium text-zinc-300 mb-1.5"
                >
                  Ad Goal
                </label>
                <select
                  id="ad-goal"
                  value={brief.adGoal}
                  onChange={(e) => updateField('adGoal', e.target.value as AdGoalOption)}
                  className="w-full rounded-lg border border-white/[0.1] bg-[#14171D] px-3 py-2.5 text-sm text-white focus:border-[#FF5A1F] focus:outline-none"
                >
                  {GOALS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-zinc-300 mb-2">
                Creative Style
              </span>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((style) => {
                  const active = brief.preferredStyle === style;
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => updateField('preferredStyle', style)}
                      className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors whitespace-nowrap truncate cursor-pointer ${
                        active
                          ? 'border-[#FF5A1F] bg-[#FF5A1F]/12 text-white'
                          : 'border-white/[0.08] bg-[#14171D] text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Shared Controls: Language, Video Length, Variations */}
        <div className="space-y-4 pt-2 border-t border-white/[0.08]">
          <div>
            <span className="block text-xs font-medium text-zinc-300 mb-2">
              Script Language
            </span>
            <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-[#14171D] p-1 border border-white/[0.06]">
              {LANGUAGES.map((lang) => {
                const active = brief.language === lang.value;
                return (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => updateField('language', lang.value)}
                    className={`rounded-md px-2 py-2 text-xs font-medium transition-colors whitespace-nowrap truncate cursor-pointer ${
                      active
                        ? 'bg-[#232730] text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 items-end">
            <div className="col-span-3">
              <span className="block text-xs font-medium text-zinc-300 mb-2">
                Video Length
              </span>
              <div className="grid grid-cols-4 gap-1 rounded-lg bg-[#14171D] p-1 border border-white/[0.06]">
                {LENGTHS.map((len) => {
                  const active = brief.videoLength === len;
                  return (
                    <button
                      key={len}
                      type="button"
                      onClick={() => updateField('videoLength', len)}
                      className={`rounded-md py-1.5 text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#232730] text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {len}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="col-span-2">
              <label
                htmlFor="script-count"
                className="block text-xs font-medium text-zinc-300 mb-2"
              >
                Scripts
              </label>
              <select
                id="script-count"
                value={brief.scriptCount}
                onChange={(e) => updateField('scriptCount', Number(e.target.value))}
                className="w-full rounded-lg border border-white/[0.1] bg-[#14171D] px-3 py-2 text-xs font-medium text-white tabular-nums focus:border-[#FF5A1F] focus:outline-none"
              >
                <option value={3}>3 Scripts</option>
                <option value={4}>4 Scripts</option>
                <option value={5}>5 Scripts</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!canSubmit || isGenerating}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF5A1F] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#FF6D38] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F] cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Forging UGC Scripts...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate {brief.scriptCount} Ad Scripts</span>
              </>
            )}
          </button>
        </div>
      </form>
    </aside>
  );
}
