import {
  Bookmark,
  BookmarkCheck,
  Camera,
  Check,
  Download,
  Edit3,
  FileText,
  Film,
  Image as ImageIcon,
  Loader2,
  Mic,
  RefreshCw,
  Volume2,
  Wand2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { VOICE_PRESETS } from '../data/templates';
import { NICHE_TEMPLATES } from '../data/templates';
import type {
  AdBrief,
  AdGenerationResult,
  AdScript,
  NicheTemplate,
  RewriteMode,
  ScriptSegment,
  VoicePrebuiltName,
} from '../types/adforge';
import { downloadScriptPdf, downloadScriptTxt, formatScriptAsText } from '../utils/export';
import { CopyButton } from './CopyButton';

type WorkspaceTab = 'script' | 'visuals' | 'voice' | 'video_prompts' | 'static_copy';

interface ScriptWorkspaceProps {
  brief: AdBrief;
  result: AdGenerationResult | null;
  activeScriptIndex: number;
  onSelectScriptIndex: (idx: number) => void;
  onUpdateScript: (idx: number, updated: AdScript) => void;
  onSaveProject: () => void;
  isProjectSaved: boolean;
  isGenerating: boolean;
  error: string | null;
  onLoadTemplate: (template: NicheTemplate, autoGenerate: boolean) => void;
  onSwitchToQuickMode: () => void;
}

const REWRITE_ACTIONS: { mode: RewriteMode; label: string }[] = [
  { mode: 'more_ugc', label: 'More UGC' },
  { mode: 'more_emotional', label: 'More Emotional' },
  { mode: 'more_urgent', label: 'More Urgent' },
  { mode: 'shorter_punchier', label: 'Shorter & Punchier' },
  { mode: 'bangla_polish', label: 'Natural Mix Polish' },
];

const VOICE_OPTIONS: { name: VoicePrebuiltName; label: string }[] = [
  { name: 'Kore', label: 'Kore (Warm Female)' },
  { name: 'Zephyr', label: 'Zephyr (Calm Female)' },
  { name: 'Puck', label: 'Puck (Energetic Male)' },
  { name: 'Fenrir', label: 'Fenrir (Bold Male)' },
  { name: 'Charon', label: 'Charon (Deep Authority)' },
];

export function ScriptWorkspace({
  brief,
  result,
  activeScriptIndex,
  onSelectScriptIndex,
  onUpdateScript,
  onSaveProject,
  isProjectSaved,
  isGenerating,
  error,
  onLoadTemplate,
  onSwitchToQuickMode,
}: ScriptWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('script');
  const [isEditing, setIsEditing] = useState(false);
  const [rewritingMode, setRewritingMode] = useState<RewriteMode | null>(null);
  const [toolError, setToolError] = useState<string | null>(null);

  // Video AI Prompts state
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '4:5' | '16:9'>('9:16');
  const [sceneFocus, setSceneFocus] = useState('Hook + Product Reveal Shot');
  const [isRegenPrompts, setIsRegenPrompts] = useState(false);

  // Static Copy state
  const [isRegenStatic, setIsRegenStatic] = useState(false);

  // Voice Studio state
  const [selectedVoicePreset, setSelectedVoicePreset] = useState<string>(VOICE_PRESETS[0].id);
  const [voiceDescription, setVoiceDescription] = useState<string>(VOICE_PRESETS[0].stylePrompt);
  const [voiceName, setVoiceName] = useState<VoicePrebuiltName>(VOICE_PRESETS[0].voiceName);
  const [voiceDraftText, setVoiceDraftText] = useState<string>('');
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // PDF Export loading
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const activeScript: AdScript | undefined = result?.scripts?.[activeScriptIndex];

  useEffect(() => {
    if (activeScript) {
      setVoiceDraftText(activeScript.voiceoverScript);
      setAudioUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
    setToolError(null);
    setIsEditing(false);
  }, [activeScript?.id, activeScriptIndex]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleSegmentEdit = (
    segIndex: number,
    field: keyof ScriptSegment,
    value: string,
  ) => {
    if (!activeScript) return;
    const nextSegments = activeScript.segments.map((seg, i) =>
      i === segIndex ? { ...seg, [field]: value } : seg,
    );
    const updatedVo =
      field === 'spokenLine'
        ? nextSegments.map((s) => s.spokenLine).join(' ')
        : activeScript.voiceoverScript;
    onUpdateScript(activeScriptIndex, {
      ...activeScript,
      segments: nextSegments,
      voiceoverScript: updatedVo,
    });
    if (field === 'spokenLine') {
      setVoiceDraftText(updatedVo);
    }
  };

  const handleRewrite = async (mode: RewriteMode) => {
    if (!activeScript || rewritingMode) return;
    setRewritingMode(mode);
    setToolError(null);
    try {
      const res = await fetch('/api/adforge/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: activeScript,
          mode,
          language: brief.language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to rewrite script.');
      onUpdateScript(activeScriptIndex, {
        ...activeScript,
        title: data.title || activeScript.title,
        segments: data.segments || activeScript.segments,
        voiceoverScript: data.voiceoverScript || activeScript.voiceoverScript,
        ctaVariations: data.ctaVariations || activeScript.ctaVariations,
      });
      if (data.voiceoverScript) setVoiceDraftText(data.voiceoverScript);
    } catch (err) {
      setToolError(err instanceof Error ? err.message : 'Rewrite failed.');
    } finally {
      setRewritingMode(null);
    }
  };

  const handleRegenVideoPrompts = async () => {
    if (!activeScript || isRegenPrompts) return;
    setIsRegenPrompts(true);
    setToolError(null);
    try {
      const res = await fetch('/api/adforge/video-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: activeScript,
          aspectRatio,
          sceneFocus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate video prompts.');
      onUpdateScript(activeScriptIndex, {
        ...activeScript,
        videoPrompts: data,
      });
    } catch (err) {
      setToolError(err instanceof Error ? err.message : 'Video prompt generation failed.');
    } finally {
      setIsRegenPrompts(false);
    }
  };

  const handleRegenStaticCopy = async () => {
    if (!activeScript || isRegenStatic) return;
    setIsRegenStatic(true);
    setToolError(null);
    try {
      const res = await fetch('/api/adforge/static-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: activeScript,
          brief,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to regenerate ad copy.');
      onUpdateScript(activeScriptIndex, {
        ...activeScript,
        staticAndThumbnail: data,
      });
    } catch (err) {
      setToolError(err instanceof Error ? err.message : 'Ad copy regeneration failed.');
    } finally {
      setIsRegenStatic(false);
    }
  };

  const handleGenerateVoice = async () => {
    if (!voiceDraftText.trim() || isGeneratingVoice) return;
    setIsGeneratingVoice(true);
    setToolError(null);
    try {
      const res = await fetch('/api/adforge/voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: voiceDraftText,
          voiceDescription,
          voiceName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Voice generation failed.');
      const byteCharacters = atob(data.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([new Uint8Array(byteNumbers)], {
        type: data.mimeType || 'audio/wav',
      });
      const nextUrl = URL.createObjectURL(blob);
      setAudioUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return nextUrl;
      });
    } catch (err) {
      setToolError(err instanceof Error ? err.message : 'Voice generation failed.');
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const handlePdfExport = async () => {
    if (!activeScript || isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      await downloadScriptPdf(activeScript, brief);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Loading Skeleton State
  if (isGenerating) {
    return (
      <main className="flex-1 bg-[#0A0B0D] px-6 py-8 lg:px-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 text-sm text-zinc-300">
            <Loader2 className="h-4 w-4 animate-spin text-[#FF5A1F]" />
            <span>
              Forging scroll-stopping hooks, timed UGC beats, voiceover, and AI video prompts...
            </span>
          </div>
          <div className="border-t border-white/[0.08] pt-6 space-y-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-5 border-b border-white/[0.06]">
                <div className="md:col-span-3 space-y-2">
                  <div className="h-4 w-20 rounded bg-white/[0.06] animate-pulse" />
                  <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse" />
                </div>
                <div className="md:col-span-9 space-y-2.5">
                  <div className="h-4 w-full rounded bg-white/[0.06] animate-pulse" />
                  <div className="h-4 w-4/5 rounded bg-white/[0.05] animate-pulse" />
                  <div className="h-3 w-2/3 rounded bg-white/[0.03] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Empty / Ready State
  if (!result || !activeScript) {
    return (
      <main className="flex-1 bg-[#0A0B0D] px-6 py-8 lg:px-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-10">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
              Create scroll-stopping UGC video ads in minutes.
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
              Fill out the Ad Brief on the left, paste a product link in Quick Mode, or launch straight from a niche template below. Every generation includes 3-second hooks, timed beats, Hinglish, Hindi & English natural voiceover, B-roll shot lists, and AI video prompts.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onSwitchToQuickMode}
                className="rounded-lg border border-white/[0.12] bg-[#14171D] px-4 py-2 text-xs font-medium text-white hover:border-[#FF5A1F] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Try Quick Mode (Paste Link)
              </button>
            </div>
          </div>

          <section aria-labelledby="quick-templates-heading" className="border-t border-white/[0.08] pt-8">
            <div className="flex items-baseline justify-between gap-4 mb-5">
              <h2 id="quick-templates-heading" className="font-display text-base font-semibold text-white">
                Start from a Meta Ad Niche Template
              </h2>
              <span className="text-xs text-zinc-500">Click to load or auto-generate</span>
            </div>

            <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {NICHE_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="text-[#FF5A1F] font-medium">{tpl.niche}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tpl.brief.preferredStyle}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{tpl.brief.videoLength}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate">
                      {tpl.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {tpl.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onLoadTemplate(tpl, false)}
                      className="rounded-md border border-white/[0.1] bg-[#14171D] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-white/25 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Fill Brief
                    </button>
                    <button
                      type="button"
                      onClick={() => onLoadTemplate(tpl, true)}
                      className="rounded-md bg-[#FF5A1F]/15 border border-[#FF5A1F]/40 px-3 py-1.5 text-xs font-medium text-[#FF7A47] hover:bg-[#FF5A1F] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Load & Generate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }

  const fullScriptCopyText = formatScriptAsText(activeScript, brief);

  return (
    <main className="flex-1 bg-[#0A0B0D] flex flex-col min-w-0 overflow-hidden">
      {/* Top Workspace Summary & Actions */}
      <div className="border-b border-white/[0.08] bg-[#0D0F13] px-5 py-4 lg:px-8">
        {error && (
          <div
            role="alert"
            className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-200"
          >
            {error}
          </div>
        )}
        {toolError && (
          <div
            role="alert"
            className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200"
          >
            {toolError}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
              <span className="font-medium text-zinc-200">
                {brief.productName || 'Generated Campaign'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{brief.preferredStyle}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{activeScript.estimatedDuration}</span>
              <span aria-hidden="true">·</span>
              <span>{result.scripts.length} Variations</span>
            </div>
            <p className="text-xs text-zinc-400 line-clamp-2 font-bengali-aware">
              {result.detectedBriefSummary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onSaveProject}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isProjectSaved
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-white/[0.1] bg-[#14171D] text-zinc-200 hover:border-white/25 hover:text-white'
              }`}
            >
              {isProjectSaved ? (
                <>
                  <BookmarkCheck className="h-3.5 w-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Save Project</span>
                </>
              )}
            </button>

            <CopyButton text={fullScriptCopyText} label="Copy All" />

            <button
              type="button"
              onClick={() => downloadScriptTxt(activeScript, brief)}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] bg-[#14171D] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-white/25 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-zinc-400" />
              <span>TXT</span>
            </button>

            <button
              type="button"
              onClick={handlePdfExport}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] bg-[#14171D] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-white/25 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isExportingPdf ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5 text-zinc-400" />
              )}
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Script Variations Selector */}
        <div
          className="mt-4 flex items-center gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Generated script variations"
        >
          {result.scripts.map((script, idx) => {
            const selected = idx === activeScriptIndex;
            return (
              <button
                key={script.id || idx}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onSelectScriptIndex(idx)}
                className={`group flex flex-col items-start rounded-lg border px-3.5 py-2 text-left transition-colors shrink-0 max-w-[230px] cursor-pointer ${
                  selected
                    ? 'border-[#FF5A1F] bg-[#FF5A1F]/10'
                    : 'border-white/[0.08] bg-[#14171D] hover:border-white/20'
                }`}
              >
                <span className="text-[11px] font-mono tabular-nums text-zinc-400">
                  0{idx + 1}. {script.hookType}
                </span>
                <span
                  className={`text-xs font-semibold truncate w-full mt-0.5 ${
                    selected ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                  }`}
                >
                  {script.angle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Creative Tool Tabs */}
      <div className="border-b border-white/[0.08] bg-[#0A0B0D] px-5 lg:px-8 overflow-x-auto">
        <div className="flex items-center gap-6" role="tablist" aria-label="Creative studio tools">
          {[
            { id: 'script' as const, label: 'Script & Beats', icon: FileText },
            { id: 'visuals' as const, label: 'Visuals & B-Roll', icon: Camera },
            { id: 'voice' as const, label: 'Voice Studio', icon: Mic },
            { id: 'video_prompts' as const, label: 'Video AI Prompts', icon: Film },
            { id: 'static_copy' as const, label: 'Thumbnail & Ad Copy', icon: ImageIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 py-3.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'border-[#FF5A1F] text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#FF5A1F]' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tool Viewport */}
      <div className="flex-1 overflow-y-auto px-5 py-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'script' && (
            <div className="space-y-8">
              {/* Script Title + One-Click AI Rewrites + Edit Toggle */}
              <div className="flex flex-col gap-4 pb-5 border-b border-white/[0.08]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-white font-bengali-aware">
                      {activeScript.title}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {activeScript.angle} · {activeScript.hookType} ·{' '}
                      <span className="tabular-nums">{activeScript.estimatedDuration}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditing((v) => !v)}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isEditing
                        ? 'border-[#FF5A1F] bg-[#FF5A1F] text-white'
                        : 'border-white/[0.1] bg-[#14171D] text-zinc-200 hover:border-white/25'
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Done Editing</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Script</span>
                      </>
                    )}
                  </button>
                </div>

                {/* One-click Rewrite Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 mr-1">
                    <Wand2 className="h-3.5 w-3.5 text-[#FF5A1F]" />
                    <span>Rewrite:</span>
                  </span>
                  {REWRITE_ACTIONS.map((action) => {
                    const loadingThis = rewritingMode === action.mode;
                    return (
                      <button
                        key={action.mode}
                        type="button"
                        disabled={Boolean(rewritingMode)}
                        onClick={() => handleRewrite(action.mode)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-[#14171D] px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:border-[#FF5A1F]/60 hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {loadingThis && <Loader2 className="h-3 w-3 animate-spin text-[#FF5A1F]" />}
                        <span>{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6-Beat Timed Script Table */}
              <div className="divide-y divide-white/[0.08]">
                {activeScript.segments.map((seg, idx) => (
                  <div
                    key={`${seg.stage}-${idx}`}
                    className="py-5 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
                  >
                    {/* Timing & Stage */}
                    <div className="md:col-span-3 flex md:flex-col items-center md:items-start justify-between gap-1">
                      <span
                        className={`text-sm font-semibold ${
                          seg.stage === 'Hook' ? 'text-[#FF5A1F]' : 'text-white'
                        }`}
                      >
                        {seg.stage}
                      </span>
                      <span className="text-xs font-mono tabular-nums text-zinc-400">
                        {seg.timing}
                      </span>
                    </div>

                    {/* Spoken Dialogue, Visual & On-screen Caption */}
                    <div className="md:col-span-9 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={seg.spokenLine}
                            onChange={(e) => handleSegmentEdit(idx, 'spokenLine', e.target.value)}
                            aria-label={`${seg.stage} spoken line`}
                            className="w-full rounded-md border border-white/15 bg-[#14171D] px-3 py-2 text-sm text-white focus:border-[#FF5A1F] focus:outline-none font-bengali-aware"
                          />
                        ) : (
                          <p className="text-[15px] leading-relaxed text-zinc-100 font-bengali-aware">
                            “{seg.spokenLine}”
                          </p>
                        )}
                        <CopyButton text={seg.spokenLine} label="Copy" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="rounded-md bg-[#111318] border border-white/[0.06] px-3 py-2.5">
                          <span className="block text-[11px] font-medium text-zinc-500 mb-1">
                            Visual / Camera Action
                          </span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={seg.visualAction}
                              onChange={(e) =>
                                handleSegmentEdit(idx, 'visualAction', e.target.value)
                              }
                              className="w-full bg-transparent text-zinc-200 focus:outline-none"
                            />
                          ) : (
                            <span className="text-zinc-300 leading-relaxed">{seg.visualAction}</span>
                          )}
                        </div>

                        <div className="rounded-md bg-[#111318] border border-white/[0.06] px-3 py-2.5">
                          <span className="block text-[11px] font-medium text-zinc-500 mb-1">
                            On-Screen Caption
                          </span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={seg.onScreenText}
                              onChange={(e) =>
                                handleSegmentEdit(idx, 'onScreenText', e.target.value)
                              }
                              className="w-full bg-transparent text-zinc-200 focus:outline-none font-bengali-aware"
                            />
                          ) : (
                            <span className="text-zinc-200 font-medium font-bengali-aware leading-relaxed">
                              {seg.onScreenText}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Variations */}
              <section className="border-t border-white/[0.08] pt-6 space-y-4">
                <h3 className="font-display text-sm font-semibold text-white">
                  CTA Variations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'strong' as const, label: 'Strong Benefit CTA', val: activeScript.ctaVariations.strong },
                    { key: 'direct' as const, label: 'Direct Action CTA', val: activeScript.ctaVariations.direct },
                    { key: 'urgency' as const, label: 'Urgency / FOMO CTA', val: activeScript.ctaVariations.urgency },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="rounded-lg border border-white/[0.08] bg-[#111318] p-4 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <span className="block text-xs font-medium text-[#FF5A1F] mb-1.5">
                          {item.label}
                        </span>
                        <p className="text-sm text-zinc-200 font-bengali-aware leading-relaxed">
                          {item.val}
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <CopyButton text={item.val} label="Copy CTA" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'visuals' && (
            <div className="space-y-8">
              {/* Continuous Voiceover Script */}
              <section className="space-y-3 pb-6 border-b border-white/[0.08]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-base font-semibold text-white">
                      Natural Voiceover Script
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Formatted for smooth, conversational single-take recording.
                    </p>
                  </div>
                  <CopyButton text={activeScript.voiceoverScript} label="Copy VO" />
                </div>
                <textarea
                  rows={6}
                  value={activeScript.voiceoverScript}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateScript(activeScriptIndex, {
                      ...activeScript,
                      voiceoverScript: val,
                    });
                    setVoiceDraftText(val);
                  }}
                  className="w-full rounded-lg border border-white/[0.08] bg-[#111318] p-4 text-sm text-zinc-100 leading-relaxed focus:border-[#FF5A1F] focus:outline-none font-bengali-aware"
                />
              </section>

              {/* Visual Style & Lighting */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/[0.08]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">UGC Visual Style</h3>
                    <CopyButton text={activeScript.visualStyle} label="Copy" />
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {activeScript.visualStyle}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Lighting & Setting</h3>
                    <CopyButton text={activeScript.lightingAndSetting} label="Copy" />
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {activeScript.lightingAndSetting}
                  </p>
                </div>
              </section>

              {/* Camera Angles & B-Roll */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Camera Angles</h3>
                    <CopyButton text={activeScript.cameraAngles.join('\n')} label="Copy All" />
                  </div>
                  <ol className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
                    {activeScript.cameraAngles.map((angle, i) => (
                      <li key={i} className="py-2.5 text-sm text-zinc-300 flex gap-3">
                        <span className="font-mono text-xs text-zinc-500 tabular-nums pt-0.5">
                          0{i + 1}
                        </span>
                        <span>{angle}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">B-Roll Shot Ideas</h3>
                    <CopyButton text={activeScript.bRollIdeas.join('\n')} label="Copy All" />
                  </div>
                  <ol className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
                    {activeScript.bRollIdeas.map((shot, i) => (
                      <li key={i} className="py-2.5 text-sm text-zinc-300 flex gap-3">
                        <span className="font-mono text-xs text-[#FF5A1F] tabular-nums pt-0.5">
                          0{i + 1}
                        </span>
                        <span>{shot}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    Voiceover Generation Studio
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Choose a creator persona or describe your desired voice tone, then synthesize a real WAV preview.
                  </p>
                </div>
              </div>

              {/* Persona Presets */}
              <div className="space-y-2.5">
                <span className="block text-xs font-medium text-zinc-300">
                  Voice Persona Presets
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {VOICE_PRESETS.map((preset) => {
                    const active = selectedVoicePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedVoicePreset(preset.id);
                          setVoiceDescription(preset.stylePrompt);
                          setVoiceName(preset.voiceName);
                        }}
                        className={`rounded-lg border p-3 text-left transition-colors cursor-pointer ${
                          active
                            ? 'border-[#FF5A1F] bg-[#FF5A1F]/10'
                            : 'border-white/[0.08] bg-[#111318] hover:border-white/20'
                        }`}
                      >
                        <div className="text-xs font-semibold text-white">{preset.label}</div>
                        <div className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                          {preset.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Voice Description & Prebuilt Timbre */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="voice-desc"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Describe Desired Voice & Delivery Style
                  </label>
                  <input
                    id="voice-desc"
                    type="text"
                    value={voiceDescription}
                    onChange={(e) => setVoiceDescription(e.target.value)}
                    placeholder="e.g. Young female, casual UGC tone, enthusiastic on product reveal"
                    className="w-full rounded-lg border border-white/[0.1] bg-[#14171D] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#FF5A1F] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="voice-timbre"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Voice Timbre
                  </label>
                  <select
                    id="voice-timbre"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value as VoicePrebuiltName)}
                    className="w-full rounded-lg border border-white/[0.1] bg-[#14171D] px-3 py-2.5 text-sm text-white focus:border-[#FF5A1F] focus:outline-none"
                  >
                    {VOICE_OPTIONS.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Voiceover Script Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="voice-script-text"
                    className="text-xs font-medium text-zinc-300"
                  >
                    Spoken Voiceover Text
                  </label>
                  <CopyButton text={voiceDraftText} label="Copy Script" />
                </div>
                <textarea
                  id="voice-script-text"
                  rows={5}
                  value={voiceDraftText}
                  onChange={(e) => setVoiceDraftText(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.1] bg-[#14171D] px-3.5 py-3 text-sm text-zinc-100 leading-relaxed focus:border-[#FF5A1F] focus:outline-none font-bengali-aware"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleGenerateVoice}
                  disabled={isGeneratingVoice || !voiceDraftText.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#FF5A1F] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#FF6D38] disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors cursor-pointer"
                >
                  {isGeneratingVoice ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Synthesizing Audio...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      <span>Generate Voiceover Audio</span>
                    </>
                  )}
                </button>

                {audioUrl && (
                  <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
                    <audio controls src={audioUrl} className="h-10 flex-1 min-w-[200px]" />
                    <a
                      href={audioUrl}
                      download={`${(brief.productName || 'adforge').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-voiceover.wav`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.12] bg-[#14171D] px-3 py-2 text-xs font-medium text-zinc-200 hover:border-white/25 hover:text-white whitespace-nowrap shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download WAV</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'video_prompts' && (
            <div className="space-y-6">
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-white/[0.08]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  <div>
                    <label
                      htmlFor="prompt-aspect"
                      className="block text-xs font-medium text-zinc-400 mb-1.5"
                    >
                      Aspect Ratio
                    </label>
                    <select
                      id="prompt-aspect"
                      value={aspectRatio}
                      onChange={(e) =>
                        setAspectRatio(e.target.value as '9:16' | '4:5' | '16:9')
                      }
                      className="w-full rounded-lg border border-white/[0.1] bg-[#14171D] px-3 py-2 text-xs font-medium text-white focus:border-[#FF5A1F] focus:outline-none"
                    >
                      <option value="9:16">9:16 (Reels / Stories)</option>
                      <option value="4:5">4:5 (Meta Feed)</option>
                      <option value="16:9">16:9 (Landscape)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="scene-focus"
                      className="block text-xs font-medium text-zinc-400 mb-1.5"
                    >
                      Scene Focus
                    </label>
                    <input
                      id="scene-focus"
                      type="text"
                      value={sceneFocus}
                      onChange={(e) => setSceneFocus(e.target.value)}
                      placeholder="e.g. 3-second Hook reaction shot or Product texture close-up"
                      className="w-full rounded-lg border border-white/[0.1] bg-[#14171D] px-3 py-2 text-xs text-white focus:border-[#FF5A1F] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRegenVideoPrompts}
                  disabled={isRegenPrompts}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#14171D] border border-white/[0.12] px-4 py-2 text-xs font-medium text-white hover:border-[#FF5A1F] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isRegenPrompts ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FF5A1F]" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 text-[#FF5A1F]" />
                  )}
                  <span>Regenerate Prompts</span>
                </button>
              </div>

              {/* 5 Platform Prompts */}
              <div className="divide-y divide-white/[0.08]">
                {[
                  { key: 'kling' as const, name: 'Kling AI', note: 'Realistic human micro-expressions & handheld physics' },
                  { key: 'runway' as const, name: 'Runway Gen-3 / Gen-4', note: 'Camera motion & natural indoor depth' },
                  { key: 'luma' as const, name: 'Luma Dream Machine', note: 'Smooth continuous tracking & texture detail' },
                  { key: 'pika' as const, name: 'Pika', note: 'Punchy hook motion & product reveal' },
                  { key: 'hailuo' as const, name: 'Hailuo / MiniMax', note: 'Expressive face/hand UGC interaction' },
                ].map((tool) => {
                  const promptText = activeScript.videoPrompts[tool.key];
                  return (
                    <div key={tool.key} className="py-4 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="text-sm font-semibold text-white">{tool.name}</span>
                          <span className="text-xs text-zinc-500 ml-2.5">{tool.note}</span>
                        </div>
                        <CopyButton text={promptText} label="Copy Prompt" />
                      </div>
                      <pre className="whitespace-pre-wrap rounded-lg border border-white/[0.06] bg-[#111318] p-3.5 font-mono text-xs text-zinc-300 leading-relaxed">
                        {promptText}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'static_copy' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    Thumbnail & Meta Static Ad Copy
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Scroll-stopping Reels cover frame ideas and ready-to-launch Facebook/Instagram primary copy.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRegenStaticCopy}
                  disabled={isRegenStatic}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-[#14171D] px-3.5 py-2 text-xs font-medium text-white hover:border-[#FF5A1F] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isRegenStatic ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FF5A1F]" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 text-[#FF5A1F]" />
                  )}
                  <span>New Variations</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="rounded-lg border border-white/[0.08] bg-[#111318] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#FF5A1F]">
                      Thumbnail / Cover Frame Concept
                    </span>
                    <CopyButton text={activeScript.staticAndThumbnail.thumbnailVisual} label="Copy" />
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed">
                    {activeScript.staticAndThumbnail.thumbnailVisual}
                  </p>
                </div>

                <div className="rounded-lg border border-white/[0.08] bg-[#111318] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#FF5A1F]">
                      Text Overlay on Thumbnail
                    </span>
                    <CopyButton
                      text={activeScript.staticAndThumbnail.thumbnailHeadline}
                      label="Copy"
                    />
                  </div>
                  <p className="text-base font-bold text-white font-bengali-aware leading-relaxed">
                    {activeScript.staticAndThumbnail.thumbnailHeadline}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-white/[0.08] border-t border-white/[0.08]">
                <div className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">
                      Meta Primary Text (Short & Punchy)
                    </span>
                    <CopyButton
                      text={activeScript.staticAndThumbnail.primaryTextShort}
                      label="Copy"
                    />
                  </div>
                  <p className="text-sm text-zinc-200 whitespace-pre-line leading-relaxed font-bengali-aware">
                    {activeScript.staticAndThumbnail.primaryTextShort}
                  </p>
                </div>

                <div className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">
                      Meta Primary Text (Storytelling Variant)
                    </span>
                    <CopyButton
                      text={activeScript.staticAndThumbnail.primaryTextStory}
                      label="Copy"
                    />
                  </div>
                  <p className="text-sm text-zinc-200 whitespace-pre-line leading-relaxed font-bengali-aware">
                    {activeScript.staticAndThumbnail.primaryTextStory}
                  </p>
                </div>

                <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-400">Meta Headline</span>
                      <CopyButton text={activeScript.staticAndThumbnail.metaHeadline} label="Copy" />
                    </div>
                    <p className="text-sm font-semibold text-white font-bengali-aware">
                      {activeScript.staticAndThumbnail.metaHeadline}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-400">Link Description</span>
                      <CopyButton
                        text={activeScript.staticAndThumbnail.metaDescription}
                        label="Copy"
                      />
                    </div>
                    <p className="text-sm text-zinc-300 font-bengali-aware">
                      {activeScript.staticAndThumbnail.metaDescription}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="block text-xs font-medium text-zinc-400">
                      Recommended CTA Button
                    </span>
                    <p className="text-sm font-semibold text-[#FF5A1F]">
                      {activeScript.staticAndThumbnail.ctaButton}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
