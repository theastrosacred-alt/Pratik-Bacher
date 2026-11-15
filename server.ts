import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  generateAdPackage,
  generateVoiceoverAudio,
  regenerateStaticCopy,
  regenerateVideoPrompts,
  rewriteScriptVariant,
} from './server/adforgeService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

function formatError(err: unknown): { status: number; message: string } {
  const status = (err as { status?: number })?.status;
  const rawMessage = err instanceof Error ? err.message : 'Unexpected server error.';

  if (status === 400 || rawMessage.includes('API_KEY_INVALID')) {
    return { status: 400, message: 'Invalid Gemini API key or request parameters. Please check Settings > Secrets.' };
  }
  if (status === 403 || rawMessage.includes('PERMISSION_DENIED')) {
    return { status: 403, message: 'Permission denied by Gemini API. Check your API key in Settings > Secrets.' };
  }
  if (status === 429 || rawMessage.includes('RESOURCE_EXHAUSTED')) {
    return { status: 429, message: 'Rate limit reached. Wait a moment and try again.' };
  }
  if (status === 404) {
    return { status: 404, message: 'Requested Gemini model was not found.' };
  }
  return { status: 500, message: rawMessage };
}

app.post('/api/adforge/generate', async (req: Request, res: Response) => {
  try {
    const { mode, brief, quickInput } = req.body;
    if (!brief) {
      res.status(400).json({ error: 'Missing ad brief payload.' });
      return;
    }
    const result = await generateAdPackage({ mode: mode === 'quick' ? 'quick' : 'brief', brief, quickInput });
    res.json(result);
  } catch (err) {
    console.error('Error in /api/adforge/generate:', err);
    const { status, message } = formatError(err);
    res.status(status).json({ error: message });
  }
});

app.post('/api/adforge/rewrite', async (req: Request, res: Response) => {
  try {
    const { script, mode, language } = req.body;
    if (!script || !mode) {
      res.status(400).json({ error: 'Missing script or rewrite mode.' });
      return;
    }
    const updated = await rewriteScriptVariant({ script, mode, language });
    res.json(updated);
  } catch (err) {
    console.error('Error in /api/adforge/rewrite:', err);
    const { status, message } = formatError(err);
    res.status(status).json({ error: message });
  }
});

app.post('/api/adforge/video-prompts', async (req: Request, res: Response) => {
  try {
    const { script, aspectRatio, sceneFocus } = req.body;
    if (!script) {
      res.status(400).json({ error: 'Missing script payload.' });
      return;
    }
    const prompts = await regenerateVideoPrompts({
      script,
      aspectRatio: aspectRatio || '9:16',
      sceneFocus: sceneFocus || 'Full UGC Ad Key Shots',
    });
    res.json(prompts);
  } catch (err) {
    console.error('Error in /api/adforge/video-prompts:', err);
    const { status, message } = formatError(err);
    res.status(status).json({ error: message });
  }
});

app.post('/api/adforge/static-copy', async (req: Request, res: Response) => {
  try {
    const { script, brief } = req.body;
    if (!script || !brief) {
      res.status(400).json({ error: 'Missing script or brief payload.' });
      return;
    }
    const copy = await regenerateStaticCopy({ script, brief });
    res.json(copy);
  } catch (err) {
    console.error('Error in /api/adforge/static-copy:', err);
    const { status, message } = formatError(err);
    res.status(status).json({ error: message });
  }
});

app.post('/api/adforge/voiceover', async (req: Request, res: Response) => {
  try {
    const { text, voiceDescription, voiceName } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Missing voiceover text.' });
      return;
    }
    const audio = await generateVoiceoverAudio({ text, voiceDescription, voiceName });
    res.json(audio);
  } catch (err) {
    console.error('Error in /api/adforge/voiceover:', err);
    const { status, message } = formatError(err);
    res.status(status).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AdForge server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
