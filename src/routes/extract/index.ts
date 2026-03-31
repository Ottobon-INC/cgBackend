/**
 * Atomic Extraction Route
 * 
 * POST /api/extract
 * Accepts a source code file and returns its atomic deconstruction
 * via the OpenAI chat completions API.
 */

import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { PromptVault } from '../../lib/prompt-vault';

const router = Router();

// ─── OpenAI Client (Lazy Singleton) ─────────────────────────────────────────
let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
    if (openaiClient) return openaiClient;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error(
            '[extract] OPENAI_API_KEY is not set. ' +
            'Add it to your .env file to enable the extraction engine.'
        );
    }

    openaiClient = new OpenAI({ apiKey });
    return openaiClient;
}

// ─── Configuration ──────────────────────────────────────────────────────────
const EXTRACTION_MODEL = process.env.EXTRACTION_MODEL || 'gpt-4o-mini';
const MAX_CONTENT_SIZE = 1 * 1024 * 1024; // 1 MB

// ─── Allowed file extensions ────────────────────────────────────────────────
const ALLOWED_EXTENSIONS = new Set([
    '.tsx', '.jsx', '.ts', '.js', '.html', '.css', '.vue', '.svelte',
]);

function getExtension(filename: string): string {
    const dotIndex = filename.lastIndexOf('.');
    return dotIndex >= 0 ? filename.slice(dotIndex).toLowerCase() : '';
}

/**
 * POST /api/extract
 * Body: { filename: string, content: string }
 * Returns: { success: true, data: { markdown: string } }
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { filename, content } = req.body as {
            filename?: string;
            content?: string;
        };

        // ── Validation ──────────────────────────────────────────
        if (!filename || typeof filename !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid "filename" field.',
            });
        }

        if (!content || typeof content !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid "content" field.',
            });
        }

        const ext = getExtension(filename);
        if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
            return res.status(400).json({
                success: false,
                error: `Unsupported file type: ${ext}. Allowed: ${[...ALLOWED_EXTENSIONS].join(', ')}`,
            });
        }

        if (Buffer.byteLength(content, 'utf-8') > MAX_CONTENT_SIZE) {
            return res.status(400).json({
                success: false,
                error: 'File content exceeds the 1 MB size limit.',
            });
        }

        if (content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'File content is empty.',
            });
        }

        // ── AI Extraction ───────────────────────────────────────
        console.log(`[extract] Processing "${filename}" (${content.length} chars) with model: ${EXTRACTION_MODEL}`);

        const openai = getOpenAI();

        const completion = await openai.chat.completions.create({
            model: EXTRACTION_MODEL,
            messages: [
                {
                    role: 'system',
                    content: PromptVault.ATOMIC_EXTRACTION,
                },
                {
                    role: 'user',
                    content: `Filename: ${filename}\n\nSource Code:\n${content}`,
                },
            ],
            temperature: 0.2,   // Low temp for consistent, structured output
            max_tokens: 16000,  // Large enough for full file extractions
        });

        const markdown = completion.choices[0]?.message?.content;

        if (!markdown) {
            console.error('[extract] No content returned from OpenAI.');
            return res.status(502).json({
                success: false,
                error: 'AI returned an empty response. Please try again.',
            });
        }

        console.log(`[extract] ✅ "${filename}" extracted successfully (${markdown.length} chars output).`);

        return res.status(200).json({
            success: true,
            data: { markdown },
        });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[extract] Extraction failed:', message);

        // Surface OpenAI-specific errors clearly
        if (message.includes('rate_limit')) {
            return res.status(429).json({
                success: false,
                error: 'Rate limited by OpenAI. Please wait a moment and try again.',
            });
        }

        if (message.includes('insufficient_quota')) {
            return res.status(402).json({
                success: false,
                error: 'OpenAI API quota exceeded. Check your billing.',
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Extraction failed. Please try again.',
            details: process.env.NODE_ENV === 'development' ? message : undefined,
        });
    }
});

export default router;
