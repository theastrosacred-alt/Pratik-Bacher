import { Pin, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { SavedProject } from '../types/adforge';

interface ProjectsModalProps {
  open: boolean;
  onClose: () => void;
  projects: SavedProject[];
  activeProjectId: string | null;
  onLoadProject: (project: SavedProject) => void;
  onDeleteProject: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export function ProjectsModal({
  open,
  onClose,
  projects,
  activeProjectId,
  onLoadProject,
  onDeleteProject,
  onTogglePin,
}: ProjectsModalProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pinned'>('all');

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => (filter === 'pinned' ? p.pinned : true))
      .filter((p) =>
        q
          ? p.name.toLowerCase().includes(q) ||
            p.brief.productName.toLowerCase().includes(q) ||
            p.result.detectedBriefSummary.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [projects, query, filter]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Saved projects and generation history"
    >
      <div
        className="w-full max-w-xl bg-[#0E1014] border-l border-white/[0.08] h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <div>
            <h2 className="font-display text-base font-bold text-white">
              Saved Projects & History
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Stored locally in your browser so your briefs and scripts stay ready.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close projects drawer"
            className="rounded-md p-2 text-zinc-400 hover:bg-white/[0.06] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="border-b border-white/[0.08] px-6 py-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search saved products or briefs..."
              className="w-full rounded-md border border-white/[0.1] bg-[#14171D] pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-[#FF5A1F] focus:outline-none"
            />
          </div>

          <div className="inline-flex rounded-md bg-[#14171D] p-0.5 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer ${
                filter === 'all' ? 'bg-[#232730] text-white' : 'text-zinc-400'
              }`}
            >
              All ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('pinned')}
              className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer ${
                filter === 'pinned' ? 'bg-[#232730] text-white' : 'text-zinc-400'
              }`}
            >
              Saved
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.08] px-6">
          {filtered.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-medium text-zinc-300">No projects found</p>
              <p className="text-xs text-zinc-500">
                Generate a set of UGC ad scripts and they will appear here automatically.
              </p>
            </div>
          ) : (
            filtered.map((proj) => {
              const isActive = proj.id === activeProjectId;
              const dateLabel = new Date(proj.updatedAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <div key={proj.id} className="py-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span>{proj.brief.preferredStyle}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{proj.brief.videoLength}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{proj.result.scripts.length} scripts</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{dateLabel}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white truncate mt-1">
                        {proj.name}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5 font-bengali-aware">
                        {proj.result.detectedBriefSummary}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onTogglePin(proj.id)}
                        aria-label={proj.pinned ? 'Unpin project' : 'Pin project'}
                        className={`p-1.5 rounded hover:bg-white/[0.06] cursor-pointer ${
                          proj.pinned ? 'text-[#FF5A1F]' : 'text-zinc-500 hover:text-zinc-200'
                        }`}
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProject(proj.id)}
                        aria-label="Delete project"
                        className="p-1.5 rounded text-zinc-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadProject(proj);
                        onClose();
                      }}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'bg-[#14171D] border border-white/[0.1] text-zinc-200 hover:border-[#FF5A1F] hover:text-white'
                      }`}
                    >
                      {isActive ? 'Currently Open' : 'Open in Studio'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
