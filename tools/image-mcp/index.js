import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = process.env.MATCHCV_PROJECT_ROOT ?? path.resolve(__dirname, '../..');
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY ?? '';
const DEFAULT_MODEL = 'black-forest-labs/FLUX.1-schnell';
const API_URL = 'https://api.together.ai/v1/images/generations';

function resolveOutputPath(filename) {
  const normalized = filename.replace(/\\/g, '/');
  if (path.isAbsolute(normalized)) {
    throw new Error('Use a project-relative path only, e.g. assets/icon.png');
  }
  const full = path.resolve(PROJECT_ROOT, normalized);
  if (!full.startsWith(path.resolve(PROJECT_ROOT))) {
    throw new Error('Path must stay inside the project directory');
  }
  return full;
}

async function generateWithTogether({ prompt, width, height, steps }) {
  if (!TOGETHER_API_KEY) {
    throw new Error('TOGETHER_API_KEY is not set. Add it in Cursor MCP settings.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      prompt,
      width,
      height,
      steps,
      n: 1,
      response_format: 'base64',
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = body?.error?.message ?? body?.message ?? response.statusText;
    throw new Error(`Together AI error (${response.status}): ${msg}`);
  }

  const b64 = body?.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('Together AI returned no image data');
  }

  return Buffer.from(b64, 'base64');
}

const server = new McpServer({
  name: 'matchcv-image-gen',
  version: '1.0.0',
});

server.tool(
  'generate_image',
  'Generate an image with FLUX.1-schnell (Together AI) and save it into the MatchCV project. Use English prompts. Paths are relative to project root.',
  {
    prompt: z.string().describe('Detailed English image prompt'),
    filename: z
      .string()
      .describe('Relative save path, e.g. assets/icon.png or assets/generated/banner.png'),
    width: z.number().int().min(256).max(2048).optional().default(1024),
    height: z.number().int().min(256).max(2048).optional().default(1024),
    steps: z.number().int().min(1).max(8).optional().default(4),
  },
  async ({ prompt, filename, width, height, steps }) => {
    try {
      const outputPath = resolveOutputPath(filename);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });

      const buffer = await generateWithTogether({ prompt, width, height, steps });
      fs.writeFileSync(outputPath, buffer);

      return {
        content: [
          {
            type: 'text',
            text: `Saved ${buffer.length} bytes to ${path.relative(PROJECT_ROOT, outputPath).replace(/\\/g, '/')} (${width}x${height}, model ${DEFAULT_MODEL})`,
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [{ type: 'text', text: `Image generation failed: ${message}` }],
      };
    }
  },
);

server.tool(
  'list_asset_targets',
  'List recommended MatchCV asset paths and sizes for store graphics',
  {},
  async () => ({
    content: [
      {
        type: 'text',
        text: [
          'MatchCV brand: primary #FF7A33 orange, clean mobile UI, professional career app.',
          '',
          'Recommended outputs:',
          '- assets/icon.png — 1024x1024 app icon, flat vector, letter M or CV match symbol',
          '- assets/adaptive-icon.png — 1024x1024 foreground, transparent-friendly',
          '- assets/splash.png — 1284x2778 splash, logo centered on orange/white',
          '- assets/generated/play-screenshot-*.png — 1080x1920 Play Store screenshots',
          '- assets/generated/feature-graphic.png — 1024x500 Play feature graphic',
          '',
          'After generating icons, run: npm run generate:icons (if resizing needed)',
        ].join('\n'),
      },
    ],
  }),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
