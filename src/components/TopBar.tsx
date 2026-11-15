interface TopBarProps {
  activeSection: 'studio' | 'templates' | 'projects';
  onSelectStudio: () => void;
  onOpenTemplates: () => void;
  onOpenProjects: () => void;
  onExportTxt: () => void;
  canExport: boolean;
  onNewBrief: () => void;
}

export function TopBar({
  activeSection,
  onSelectStudio,
  onOpenTemplates,
  onOpenProjects,
  onExportTxt,
  canExport,
  onNewBrief,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-8 border-b border-white/[0.08] bg-[#0A0B0D]/95 px-4 backdrop-blur-md sm:px-6">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#studio"
        onClick={(e) => {
          e.preventDefault();
          onSelectStudio();
        }}
        className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5A1F]"
      >
        AdForge
      </a>

      {/* Zone 2: Clean single-line navigation links */}
      <nav aria-label="Primary" className="hidden md:flex items-center gap-6 text-sm font-medium">
        <button
          type="button"
          onClick={onSelectStudio}
          className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5A1F] ${
            activeSection === 'studio'
              ? 'text-white border-b border-[#FF5A1F]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Studio
        </button>
        <button
          type="button"
          onClick={onOpenTemplates}
          className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5A1F] ${
            activeSection === 'templates'
              ? 'text-white border-b border-[#FF5A1F]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Templates
        </button>
        <button
          type="button"
          onClick={onOpenProjects}
          className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5A1F] ${
            activeSection === 'projects'
              ? 'text-white border-b border-[#FF5A1F]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Saved Projects
        </button>
        <button
          type="button"
          onClick={onExportTxt}
          disabled={!canExport}
          className={`py-1 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5A1F] ${
            canExport
              ? 'text-zinc-400 hover:text-white cursor-pointer'
              : 'text-zinc-600 cursor-not-allowed'
          }`}
        >
          Export Brief
        </button>
      </nav>

      {/* Zone 3: Single primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onNewBrief}
          className="rounded-lg bg-[#FF5A1F] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#FF6D38] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F] whitespace-nowrap shrink-0 cursor-pointer"
        >
          New Brief
        </button>
      </div>
    </header>
  );
}
