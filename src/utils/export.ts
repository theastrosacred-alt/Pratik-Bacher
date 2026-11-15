import { jsPDF } from 'jspdf';
import type { AdBrief, AdScript } from '../types/adforge';

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

export function formatScriptAsText(script: AdScript, brief: AdBrief): string {
  const lines: string[] = [];
  lines.push(`ADFORGE CREATIVE BRIEF`);
  lines.push(`==================================================`);
  lines.push(`Product: ${brief.productName || 'Untitled Product'}`);
  lines.push(`Style: ${brief.preferredStyle} | Goal: ${brief.adGoal} | Length: ${script.estimatedDuration}`);
  lines.push(`Script Title: ${script.title}`);
  lines.push(`Angle: ${script.angle} (${script.hookType})`);
  lines.push(``);
  lines.push(`TIMED SCRIPT BEATS`);
  lines.push(`--------------------------------------------------`);
  for (const seg of script.segments) {
    lines.push(`[${seg.timing}] ${seg.stage.toUpperCase()}`);
    lines.push(`Spoken: ${seg.spokenLine}`);
    lines.push(`Visual: ${seg.visualAction}`);
    lines.push(`On-Screen Text: ${seg.onScreenText}`);
    lines.push(``);
  }
  lines.push(`NATURAL VOICEOVER SCRIPT`);
  lines.push(`--------------------------------------------------`);
  lines.push(script.voiceoverScript);
  lines.push(``);
  lines.push(`VISUAL DIRECTION & B-ROLL`);
  lines.push(`--------------------------------------------------`);
  lines.push(`Visual Style: ${script.visualStyle}`);
  lines.push(`Lighting & Setting: ${script.lightingAndSetting}`);
  lines.push(`Camera Angles:`);
  script.cameraAngles.forEach((a, i) => lines.push(`  ${i + 1}. ${a}`));
  lines.push(`B-Roll Shot List:`);
  script.bRollIdeas.forEach((b, i) => lines.push(`  ${i + 1}. ${b}`));
  lines.push(``);
  lines.push(`CTA VARIATIONS`);
  lines.push(`--------------------------------------------------`);
  lines.push(`Strong: ${script.ctaVariations.strong}`);
  lines.push(`Direct: ${script.ctaVariations.direct}`);
  lines.push(`Urgency: ${script.ctaVariations.urgency}`);
  lines.push(``);
  lines.push(`AI VIDEO PROMPTS`);
  lines.push(`--------------------------------------------------`);
  lines.push(`Kling: ${script.videoPrompts.kling}`);
  lines.push(`Runway: ${script.videoPrompts.runway}`);
  lines.push(`Luma: ${script.videoPrompts.luma}`);
  lines.push(`Pika: ${script.videoPrompts.pika}`);
  lines.push(`Hailuo: ${script.videoPrompts.hailuo}`);
  lines.push(``);
  lines.push(`THUMBNAIL & META STATIC AD COPY`);
  lines.push(`--------------------------------------------------`);
  lines.push(`Thumbnail Visual: ${script.staticAndThumbnail.thumbnailVisual}`);
  lines.push(`Thumbnail Text Overlay: ${script.staticAndThumbnail.thumbnailHeadline}`);
  lines.push(`Meta Headline: ${script.staticAndThumbnail.metaHeadline}`);
  lines.push(`Meta Description: ${script.staticAndThumbnail.metaDescription}`);
  lines.push(`CTA Button: ${script.staticAndThumbnail.ctaButton}`);
  lines.push(`Primary Text (Short): ${script.staticAndThumbnail.primaryTextShort}`);
  lines.push(`Primary Text (Story): ${script.staticAndThumbnail.primaryTextStory}`);
  return lines.join('\n');
}

export function downloadScriptTxt(script: AdScript, brief: AdBrief): void {
  const content = formatScriptAsText(script, brief);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const safeName = (brief.productName || 'adforge-script')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName || 'adforge'}-script.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Renders the creative brief onto crisp high-DPI offscreen canvases using the browser's
 * loaded Noto Sans Bengali + DM Sans font stack, then embeds each page into a clean A4 PDF.
 * This guarantees 100% accurate Bangla Unicode ligatures in the exported PDF.
 */
export async function downloadScriptPdf(script: AdScript, brief: AdBrief): Promise<void> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const pageWidthPx = 1240;
  const pageHeightPx = 1754; // A4 ratio at 150 DPI
  const marginX = 88;
  const marginTop = 84;
  const marginBottom = 84;
  const contentWidth = pageWidthPx - marginX * 2;

  const pages: HTMLCanvasElement[] = [];

  const createPage = (): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; y: number } => {
    const canvas = document.createElement('canvas');
    canvas.width = pageWidthPx;
    canvas.height = pageHeightPx;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, pageWidthPx, pageHeightPx);
    pages.push(canvas);
    return { canvas, ctx, y: marginTop };
  };

  let current = createPage();

  const ensureSpace = (neededHeight: number) => {
    if (current.y + neededHeight > pageHeightPx - marginBottom) {
      current = createPage();
    }
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ): string[] => {
    const paragraphs = text.split('\n');
    const allLines: string[] = [];
    for (const para of paragraphs) {
      const words = para.split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        allLines.push('');
        continue;
      }
      let line = '';
      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && line) {
          allLines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) allLines.push(line);
    }
    return allLines;
  };

  const drawTextBlock = (
    text: string,
    opts: {
      font: string;
      color: string;
      lineHeight: number;
      indent?: number;
      gapAfter?: number;
    },
  ) => {
    const indent = opts.indent ?? 0;
    current.ctx.font = opts.font;
    const lines = wrapText(current.ctx, text, contentWidth - indent);
    for (const line of lines) {
      ensureSpace(opts.lineHeight);
      current.ctx.font = opts.font;
      current.ctx.fillStyle = opts.color;
      current.ctx.fillText(line, marginX + indent, current.y);
      current.y += opts.lineHeight;
    }
    current.y += opts.gapAfter ?? 8;
  };

  const drawDivider = (gapAfter = 20) => {
    ensureSpace(gapAfter + 8);
    current.ctx.strokeStyle = '#E4E4E7';
    current.ctx.lineWidth = 2;
    current.ctx.beginPath();
    current.ctx.moveTo(marginX, current.y);
    current.ctx.lineTo(pageWidthPx - marginX, current.y);
    current.ctx.stroke();
    current.y += gapAfter;
  };

  // Header
  drawTextBlock('AdForge Production Script', {
    font: '700 22px "Plus Jakarta Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
    color: '#FF5A1F',
    lineHeight: 30,
    gapAfter: 6,
  });
  drawTextBlock(script.title, {
    font: '700 38px "Plus Jakarta Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
    color: '#09090B',
    lineHeight: 48,
    gapAfter: 10,
  });
  drawTextBlock(
    `${brief.productName || 'Product'}  ·  ${script.angle}  ·  ${script.estimatedDuration}  ·  ${brief.preferredStyle}`,
    {
      font: '500 20px "DM Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
      color: '#52525B',
      lineHeight: 28,
      gapAfter: 18,
    },
  );
  drawDivider(26);

  // Script Beats
  drawTextBlock('Timed Script Beats', {
    font: '700 26px "Plus Jakarta Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
    color: '#09090B',
    lineHeight: 36,
    gapAfter: 14,
  });

  for (const seg of script.segments) {
    ensureSpace(140);
    drawTextBlock(`${seg.timing}  —  ${seg.stage}`, {
      font: '700 21px "JetBrains Mono", "Noto Sans Devanagari", "Noto Sans Bengali", monospace',
      color: '#FF5A1F',
      lineHeight: 28,
      gapAfter: 4,
    });
    drawTextBlock(`Spoken: ${seg.spokenLine}`, {
      font: '500 22px "DM Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
      color: '#18181B',
      lineHeight: 34,
      indent: 14,
      gapAfter: 4,
    });
    drawTextBlock(`Visual: ${seg.visualAction}`, {
      font: '400 19px "DM Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
      color: '#52525B',
      lineHeight: 28,
      indent: 14,
      gapAfter: 4,
    });
    drawTextBlock(`On-Screen Caption: ${seg.onScreenText}`, {
      font: '600 19px "DM Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
      color: '#27272A',
      lineHeight: 28,
      indent: 14,
      gapAfter: 18,
    });
  }

  drawDivider(24);
  drawTextBlock('Voiceover Script', {
    font: '700 26px "Plus Jakarta Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
    color: '#09090B',
    lineHeight: 36,
    gapAfter: 10,
  });
  drawTextBlock(script.voiceoverScript, {
    font: '400 21px "DM Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
    color: '#18181B',
    lineHeight: 34,
    gapAfter: 20,
  });

  drawDivider(24);
  drawTextBlock('Visual Direction & B-Roll', {
    font: '700 26px "Plus Jakarta Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
    color: '#09090B',
    lineHeight: 36,
    gapAfter: 10,
  });
  drawTextBlock(`Style: ${script.visualStyle}`, {
    font: '500 20px "DM Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
    color: '#27272A',
    lineHeight: 30,
    gapAfter: 6,
  });
  drawTextBlock(`Lighting & Setting: ${script.lightingAndSetting}`, {
    font: '400 20px "DM Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
    color: '#3F3F46',
    lineHeight: 30,
    gapAfter: 10,
  });
  drawTextBlock('Camera Angles: ' + script.cameraAngles.join(' / '), {
    font: '400 19px "DM Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
    color: '#3F3F46',
    lineHeight: 28,
    gapAfter: 10,
  });
  script.bRollIdeas.forEach((b, idx) => {
    drawTextBlock(`${idx + 1}. ${b}`, {
      font: '400 19px "DM Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
      color: '#27272A',
      lineHeight: 28,
      indent: 14,
      gapAfter: 4,
    });
  });

  drawDivider(24);
  drawTextBlock('CTA Variations & Static Ad Copy', {
    font: '700 26px "Plus Jakarta Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
    color: '#09090B',
    lineHeight: 36,
    gapAfter: 10,
  });
  drawTextBlock(`Strong CTA: ${script.ctaVariations.strong}`, {
    font: '500 20px "DM Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
    color: '#18181B',
    lineHeight: 30,
    gapAfter: 6,
  });
  drawTextBlock(`Direct CTA: ${script.ctaVariations.direct}`, {
    font: '500 20px "DM Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
    color: '#18181B',
    lineHeight: 30,
    gapAfter: 6,
  });
  drawTextBlock(`Urgency CTA: ${script.ctaVariations.urgency}`, {
    font: '500 20px "DM Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
    color: '#18181B',
    lineHeight: 30,
    gapAfter: 14,
  });
  drawTextBlock(`Meta Headline: ${script.staticAndThumbnail.metaHeadline}`, {
    font: '600 20px "DM Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
    color: '#09090B',
    lineHeight: 30,
    gapAfter: 6,
  });
  drawTextBlock(`Primary Text: ${script.staticAndThumbnail.primaryTextShort}`, {
    font: '400 20px "DM Sans", "Noto Sans Devanagari", "Noto Sans Bengali", sans-serif',
    color: '#27272A',
    lineHeight: 30,
    gapAfter: 16,
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();

  pages.forEach((canvas, idx) => {
    if (idx > 0) pdf.addPage();
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
  });

  const safeName = (brief.productName || 'adforge-script')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  pdf.save(`${safeName || 'adforge'}-script.pdf`);
}
