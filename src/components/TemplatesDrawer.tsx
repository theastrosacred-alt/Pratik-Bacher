import { X } from 'lucide-react';
import { useEffect } from 'react';
import { NICHE_TEMPLATES } from '../data/templates';
import type { NicheTemplate } from '../types/adforge';

interface TemplatesDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: NicheTemplate, autoGenerate: boolean) => void;
}

export function TemplatesDrawer({
  open,
  onClose,
  onSelectTemplate,
}: TemplatesDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Niche ad templates"
    >
      <div
        className="w-full max-w-xl bg-[#0E1014] border-l border-white/[0.08] h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <div>
            <h2 className="font-display text-base font-bold text-white">
              Niche Ad Brief Templates
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Proven high-converting Meta UGC structures ready to customize or generate.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close templates drawer"
            className="rounded-md p-2 text-zinc-400 hover:bg-white/[0.06] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.08] px-6">
          {NICHE_TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="py-5 space-y-3">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="font-semibold text-[#FF5A1F]">{tpl.niche}</span>
                <span aria-hidden="true">·</span>
                <span>{tpl.brief.preferredStyle}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{tpl.brief.videoLength}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{tpl.title}</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{tpl.summary}</p>
              </div>
              <div className="text-xs text-zinc-400 space-y-1">
                <div>
                  <span className="text-zinc-500">Audience: </span>
                  <span>{tpl.brief.targetAudience}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Offer: </span>
                  <span>{tpl.brief.mainOffer}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTemplate(tpl, false);
                    onClose();
                  }}
                  className="rounded-md border border-white/[0.12] bg-[#14171D] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-white/25 hover:text-white cursor-pointer"
                >
                  Load into Brief
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTemplate(tpl, true);
                    onClose();
                  }}
                  className="rounded-md bg-[#FF5A1F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#FF6D38] cursor-pointer"
                >
                  Load & Generate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
