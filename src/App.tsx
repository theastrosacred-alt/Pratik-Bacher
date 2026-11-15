import { useEffect, useState } from 'react';
import { BriefSidebar } from './components/BriefSidebar';
import { ProjectsModal } from './components/ProjectsModal';
import { ScriptWorkspace } from './components/ScriptWorkspace';
import { TemplatesDrawer } from './components/TemplatesDrawer';
import { TopBar } from './components/TopBar';
import { DEFAULT_BRIEF } from './data/templates';
import type {
  AdBrief,
  AdGenerationResult,
  AdScript,
  NicheTemplate,
  SavedProject,
} from './types/adforge';
import { downloadScriptTxt } from './utils/export';

const STORAGE_KEY = 'adforge_projects_v1';
const ACTIVE_ID_KEY = 'adforge_active_project_v1';

function loadProjectsFromStorage(): SavedProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [projects, setProjects] = useState<SavedProject[]>(() => loadProjectsFromStorage());
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_ID_KEY);
    } catch {
      return null;
    }
  });

  const [mode, setMode] = useState<'brief' | 'quick'>('brief');
  const [brief, setBrief] = useState<AdBrief>(DEFAULT_BRIEF);
  const [quickInput, setQuickInput] = useState<string>('');
  const [result, setResult] = useState<AdGenerationResult | null>(null);
  const [activeScriptIndex, setActiveScriptIndex] = useState<number>(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'brief' | 'workspace'>('brief');

  // Hydrate last active project on first mount
  useEffect(() => {
    if (!activeProjectId) return;
    const found = projects.find((p) => p.id === activeProjectId);
    if (found) {
      const lang = found.brief.language as string;
      const normalizedLang =
        lang === 'hindi' || lang === 'english' || lang === 'hinglish' ? lang : 'hinglish';
      setMode(found.mode);
      setBrief({ ...found.brief, language: normalizedLang });
      setQuickInput(found.quickInput || '');
      setResult(found.result);
      setMobilePanel('workspace');
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist projects list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.slice(0, 40)));
    } catch {
      // Ignore storage quota errors
    }
  }, [projects]);

  useEffect(() => {
    try {
      if (activeProjectId) {
        localStorage.setItem(ACTIVE_ID_KEY, activeProjectId);
      } else {
        localStorage.removeItem(ACTIVE_ID_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [activeProjectId]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  const runGeneration = async (
    targetMode: 'brief' | 'quick',
    targetBrief: AdBrief,
    targetQuickInput: string,
  ) => {
    setIsGenerating(true);
    setError(null);
    setMobilePanel('workspace');

    try {
      const res = await fetch('/api/adforge/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: targetMode,
          brief: targetBrief,
          quickInput: targetQuickInput,
        }),
      });
      const data = (await res.json()) as AdGenerationResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate scripts.');
      }

      let resolvedBrief = targetBrief;
      if (targetMode === 'quick' && data.inferredBrief) {
        resolvedBrief = {
          ...targetBrief,
          productName: data.inferredBrief.productName || targetBrief.productName || 'Quick Ad Brief',
          productDescription:
            data.inferredBrief.productDescription || targetQuickInput.slice(0, 220),
          targetAudience: data.inferredBrief.targetAudience || targetBrief.targetAudience,
          mainOffer: data.inferredBrief.mainOffer || targetBrief.mainOffer,
        };
        setBrief(resolvedBrief);
      }

      setResult(data);
      setActiveScriptIndex(0);

      // Auto-save to local history
      const now = new Date().toISOString();
      const newId = `proj_${Date.now()}`;
      const projectName =
        resolvedBrief.productName?.trim() ||
        targetQuickInput.trim().slice(0, 40) ||
        'Untitled Campaign';

      const newProject: SavedProject = {
        id: newId,
        name: projectName,
        createdAt: now,
        updatedAt: now,
        mode: targetMode,
        quickInput: targetQuickInput,
        brief: resolvedBrief,
        result: data,
        pinned: false,
      };

      setProjects((prev) => [newProject, ...prev]);
      setActiveProjectId(newId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while generating.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateScript = (idx: number, updated: AdScript) => {
    if (!result) return;
    const nextScripts = result.scripts.map((s, i) => (i === idx ? updated : s));
    const nextResult = { ...result, scripts: nextScripts };
    setResult(nextResult);

    if (activeProjectId) {
      const now = new Date().toISOString();
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProjectId ? { ...p, result: nextResult, updatedAt: now } : p,
        ),
      );
    }
  };

  const handleSaveProject = () => {
    if (!result) return;
    if (activeProjectId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProjectId
            ? { ...p, pinned: !p.pinned, updatedAt: new Date().toISOString() }
            : p,
        ),
      );
    }
  };

  const handleLoadTemplate = (template: NicheTemplate, autoGenerate: boolean) => {
    setMode('brief');
    setBrief(template.brief);
    setError(null);
    if (autoGenerate) {
      void runGeneration('brief', template.brief, '');
    } else {
      setMobilePanel('brief');
    }
  };

  const handleNewBrief = () => {
    setMode('brief');
    setBrief(DEFAULT_BRIEF);
    setQuickInput('');
    setResult(null);
    setActiveProjectId(null);
    setActiveScriptIndex(0);
    setError(null);
    setMobilePanel('brief');
  };

  const handleLoadProject = (proj: SavedProject) => {
    const lang = proj.brief.language as string;
    const normalizedLang =
      lang === 'hindi' || lang === 'english' || lang === 'hinglish' ? lang : 'hinglish';
    setMode(proj.mode);
    setBrief({ ...proj.brief, language: normalizedLang });
    setQuickInput(proj.quickInput || '');
    setResult(proj.result);
    setActiveProjectId(proj.id);
    setActiveScriptIndex(0);
    setError(null);
    setMobilePanel('workspace');
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(null);
    }
  };

  const handleTogglePin = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p)),
    );
  };

  const activeScript = result?.scripts?.[activeScriptIndex];

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0B0D] text-[#F4F4F5]">
      <TopBar
        activeSection={templatesOpen ? 'templates' : projectsOpen ? 'projects' : 'studio'}
        onSelectStudio={() => {
          setTemplatesOpen(false);
          setProjectsOpen(false);
        }}
        onOpenTemplates={() => {
          setProjectsOpen(false);
          setTemplatesOpen(true);
        }}
        onOpenProjects={() => {
          setTemplatesOpen(false);
          setProjectsOpen(true);
        }}
        onExportTxt={() => {
          if (activeScript) downloadScriptTxt(activeScript, brief);
        }}
        canExport={Boolean(activeScript)}
        onNewBrief={handleNewBrief}
      />

      {/* Mobile Compact Panel Switcher */}
      <div className="lg:hidden flex items-center justify-between gap-2 border-b border-white/[0.08] bg-[#0D0F13] px-4 py-2">
        <div className="inline-flex rounded-md bg-[#14171D] p-0.5 border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setMobilePanel('brief')}
            className={`px-3 py-1 text-xs font-medium rounded cursor-pointer ${
              mobilePanel === 'brief' ? 'bg-[#232730] text-white' : 'text-zinc-400'
            }`}
          >
            Ad Brief
          </button>
          <button
            type="button"
            onClick={() => setMobilePanel('workspace')}
            className={`px-3 py-1 text-xs font-medium rounded cursor-pointer ${
              mobilePanel === 'workspace' ? 'bg-[#232730] text-white' : 'text-zinc-400'
            }`}
          >
            Scripts & Tools
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          <button
            type="button"
            onClick={() => setTemplatesOpen(true)}
            className="text-zinc-400 hover:text-white cursor-pointer"
          >
            Templates
          </button>
          <button
            type="button"
            onClick={() => setProjectsOpen(true)}
            className="text-zinc-400 hover:text-white cursor-pointer"
          >
            Projects ({projects.length})
          </button>
        </div>
      </div>

      {/* Main Studio Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 lg:h-[calc(100vh-3.5rem)]">
        <div
          className={`${
            mobilePanel === 'brief' ? 'flex' : 'hidden'
          } lg:flex flex-col lg:h-full`}
        >
          <BriefSidebar
            mode={mode}
            onModeChange={setMode}
            brief={brief}
            onBriefChange={setBrief}
            quickInput={quickInput}
            onQuickInputChange={setQuickInput}
            onGenerate={() => runGeneration(mode, brief, quickInput)}
            onOpenTemplates={() => setTemplatesOpen(true)}
            isGenerating={isGenerating}
          />
        </div>

        <div
          className={`${
            mobilePanel === 'workspace' ? 'flex' : 'hidden'
          } lg:flex flex-1 min-w-0 lg:h-full`}
        >
          <ScriptWorkspace
            brief={brief}
            result={result}
            activeScriptIndex={activeScriptIndex}
            onSelectScriptIndex={setActiveScriptIndex}
            onUpdateScript={handleUpdateScript}
            onSaveProject={handleSaveProject}
            isProjectSaved={Boolean(activeProject?.pinned)}
            isGenerating={isGenerating}
            error={error}
            onLoadTemplate={handleLoadTemplate}
            onSwitchToQuickMode={() => {
              setMode('quick');
              setMobilePanel('brief');
            }}
          />
        </div>
      </div>

      <TemplatesDrawer
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onSelectTemplate={handleLoadTemplate}
      />

      <ProjectsModal
        open={projectsOpen}
        onClose={() => setProjectsOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        onLoadProject={handleLoadProject}
        onDeleteProject={handleDeleteProject}
        onTogglePin={handleTogglePin}
      />
    </div>
  );
}
