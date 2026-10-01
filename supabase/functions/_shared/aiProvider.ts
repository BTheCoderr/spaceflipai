import type {
  GenerateUpgradePlanTextInput,
  GenerateUpgradePlanTextResult,
  UpgradePlanPayload,
} from './types.ts';

const MOCK_RESULTS: Record<string, string> = {
  'airbnb-unit': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
  'office-space': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
  'retail-store': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
  'salon-studio': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
  'backyard-landscape': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600',
  'home-exterior': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
  'real-estate-listing': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
  'empty-commercial': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600',
};

const DEFAULT_MOCK =
  'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=600';

const MOCK_PLAN_BY_TYPE: Record<string, Omit<UpgradePlanPayload, 'budgetRange'>> = {
  'airbnb-unit': {
    upgradeSummary:
      'Improve booking appeal with photo-ready staging, guest confidence cues, and a clear sleep + lounge story for listing photos.',
    businessOutcome:
      'Stronger listing photos and guest-ready zones should support higher occupancy and nightly rate.',
    suggestedMaterials: ['Neutral duvet sets', 'Warm LED lamps', 'Removable wall art', 'Entry hooks and storage bench'],
    priorityChecklist: [
      'Refresh bedding and pillows for listing hero shots',
      'Add warm lighting at bed, sofa, and entry for guest confidence',
      'Clear surfaces and personal items before photo day',
      'Define one focal wall that reads well on mobile listing photos',
      'Add practical guest amenities visible near entry',
    ],
    contractorNotes:
      'Prioritize reversible upgrades first. Capture before/after photos by zone for listing updates and guest messaging.',
    riskNotes: ['Avoid permanent structural changes before confirming lease terms', 'Keep staging reversible for turnover'],
    photoPrepTips: ['Shoot during daylight with all lamps on', 'Remove personal items from hero listing angles'],
  },
  'office-space': {
    upgradeSummary:
      'Increase usable desk count while improving team movement, meeting flow, and reception visibility.',
    businessOutcome: 'Better circulation and client-facing polish support productivity and professional impressions.',
    suggestedMaterials: ['Modular bench desks', 'Acoustic panels', 'Reception signage', 'Task lighting'],
    priorityChecklist: [
      'Map desk clusters to window light and power/data drops',
      'Add huddle or focus zones without blocking circulation',
      'Improve reception sightlines and client-first impression',
      'Place storage along low-traffic walls to free desk zones',
      'Refresh paint in client-facing and collaboration areas',
    ],
    contractorNotes:
      'Confirm electrical and data locations before moving workstations. Phase work to keep teams operational.',
    riskNotes: ['Verify lease and fire code before reconfiguring egress paths'],
    photoPrepTips: ['Declutter desks and cable runs before concept photos', 'Capture reception and collaboration zones first'],
  },
  'empty-commercial': {
    upgradeSummary:
      'Turn the shell into a tenant-ready concept with storefront appeal, defined zones, and a phased fit-out plan.',
    businessOutcome: 'A leasable concept layout helps brokers market the space and shortens time to lease.',
    suggestedMaterials: ['Temporary signage', 'Paint and flooring refresh', 'Concept lighting', 'Zone dividers'],
    priorityChecklist: [
      'Define entry and storefront story for leasing photos',
      'Plan main use zone and support/back-of-house area',
      'Identify landlord base build vs tenant improvements',
      'Create concept layout boards for broker presentations',
      'Estimate phased fit-out for investor or tenant review',
    ],
    contractorNotes:
      'Separate landlord base build from tenant fit-out in the client brief. Include photo-ready concept boards for leasing.',
    riskNotes: ['Confirm landlord allowance before tenant improvements', 'Keep MEP scope aligned with intended use'],
    photoPrepTips: ['Photograph entry and main floor zones in natural light', 'Remove construction debris from sightlines'],
  },
};

const DEFAULT_MOCK_PLAN: Omit<UpgradePlanPayload, 'budgetRange'> = {
  upgradeSummary:
    'Practical property upgrade plan focused on visible improvements, budget-aware scope, and photo-ready presentation.',
  businessOutcome: 'Clear priorities help contractors bid accurately and keep the project on schedule.',
  suggestedMaterials: ['Paint and trim refresh', 'Updated lighting', 'Modular furnishings', 'Entry staging props'],
  priorityChecklist: [
    'Confirm scope and photo priorities',
    'Measure key zones and traffic paths',
    'Get trade quotes for priority items',
    'Schedule work in revenue-safe phases',
  ],
  contractorNotes: 'Scope by zone and sequence work to minimize downtime. Confirm permits where required.',
  riskNotes: ['Final pricing requires on-site verification', 'Hidden conditions may affect timeline'],
  photoPrepTips: ['Clean surfaces and improve lighting before photos', 'Capture wide angles of priority zones'],
};

export type GenerateUpgradeImageInput = {
  imageUrl: string;
  prompt: string;
  projectType: string;
};

export type GenerateUpgradeImageResult = {
  resultImageUrl: string;
  estimatedCostCents: number;
};

const GEMINI_MODEL = 'gemini-2.5-flash';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const MAX_PROVIDER_IMAGE_BYTES = 8 * 1024 * 1024;

type AiProviderPreference = 'gemini' | 'groq' | 'auto';

type GeminiAttemptResult = {
  payload: UpgradePlanPayload | null;
  httpStatus?: number;
};

function getAiProviderPreference(): AiProviderPreference {
  const pref = Deno.env.get('AI_PROVIDER_PREFERENCE')?.trim().toLowerCase();
  if (pref === 'gemini' || pref === 'groq') return pref;
  return 'auto';
}

function isGeminiDisabled(): boolean {
  return Deno.env.get('GEMINI_DISABLED') === 'true';
}

function redactSecrets(text: unknown): string {
  let out = typeof text === 'string' ? text : String(text ?? '');
  out = out.replace(/(api[_-]?key|key)\s*[=:]\s*["']?[A-Za-z0-9._\-]+["']?/gi, '$1=[REDACTED]');
  out = out.replace(/AIza[0-9A-Za-z._\-]{10,}/g, '[REDACTED]');
  out = out.replace(/AQ\.[0-9A-Za-z._\-]{10,}/g, '[REDACTED]');
  out = out.replace(/gsk_[0-9A-Za-z]{10,}/g, '[REDACTED]');
  out = out.replace(/Bearer\s+[0-9A-Za-z._\-]+/gi, 'Bearer [REDACTED]');
  out = out.replace(/https?:\/\/generativelanguage\.googleapis\.com\/\S*/gi, '[REDACTED_URL]');
  return out.slice(0, 200);
}

const UPGRADE_PLAN_JSON_SCHEMA = `{
  "upgradeSummary": "string — 2-4 sentences summarizing the upgrade plan",
  "businessOutcome": "string — expected business or property outcome",
  "budgetRange": "string — e.g. $2,500 – $7,500",
  "suggestedMaterials": ["string array of 4-8 material or item suggestions"],
  "priorityChecklist": ["string array of 4-8 ordered action items"],
  "contractorNotes": "string — scope notes for trades or client",
  "riskNotes": ["string array of 2-4 planning risks or caveats"],
  "photoPrepTips": ["string array of 2-4 photo prep tips"]
}`;

function resolveBudgetRange(budgetRange: string | null): string {
  if (!budgetRange?.trim() || budgetRange.trim() === 'Not sure yet') {
    return '$2,500 – $7,500';
  }
  return budgetRange.trim();
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim().length > 0);
}

function parseUpgradePlanPayload(raw: unknown, fallbackBudget: string): UpgradePlanPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;

  if (
    !isNonEmptyString(record.upgradeSummary) ||
    !isNonEmptyString(record.businessOutcome) ||
    !isNonEmptyString(record.contractorNotes) ||
    !isStringArray(record.suggestedMaterials) ||
    !isStringArray(record.priorityChecklist) ||
    !isStringArray(record.riskNotes) ||
    !isStringArray(record.photoPrepTips)
  ) {
    return null;
  }

  return {
    upgradeSummary: record.upgradeSummary.trim(),
    businessOutcome: record.businessOutcome.trim(),
    budgetRange: isNonEmptyString(record.budgetRange) ? record.budgetRange.trim() : fallbackBudget,
    suggestedMaterials: record.suggestedMaterials.map((item) => item.trim()),
    priorityChecklist: record.priorityChecklist.map((item) => item.trim()),
    contractorNotes: record.contractorNotes.trim(),
    riskNotes: record.riskNotes.map((item) => item.trim()),
    photoPrepTips: record.photoPrepTips.map((item) => item.trim()),
  };
}

function extractJsonFromText(content: string): unknown | null {
  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      return null;
    }
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      return null;
    }
  }

  return null;
}

function buildUpgradePlanPrompt(input: GenerateUpgradePlanTextInput): string {
  const budgetRange = resolveBudgetRange(input.budgetRange);

  return [
    'You are SpaceFlip Pro, a property upgrade planning assistant for commercial and residential spaces.',
    'Write a practical, budget-aware upgrade plan for contractors and property owners.',
    '',
    `Project type: ${input.projectType}`,
    input.goal?.trim() ? `Goal: ${input.goal.trim()}` : 'Goal: improve the property for its intended use',
    `Budget range: ${budgetRange}`,
    input.notes?.trim() ? `Additional notes: ${input.notes.trim()}` : '',
    input.inputPublicUrl
      ? 'Analyze the attached property photo and reference visible conditions, layout, and upgrade opportunities.'
      : 'Property photo: not provided — base recommendations on project type and goals only.',
    '',
    'Context prompt:',
    input.prompt,
    '',
    `Return JSON matching this shape exactly:\n${UPGRADE_PLAN_JSON_SCHEMA}`,
    'Return only valid JSON. No markdown. No commentary. No code fences.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function mockGenerateUpgradePlanText(input: GenerateUpgradePlanTextInput): UpgradePlanPayload {
  const base = MOCK_PLAN_BY_TYPE[input.projectType] ?? DEFAULT_MOCK_PLAN;
  const goalNote = input.goal?.trim() ? ` Goal focus: ${input.goal.trim()}.` : '';
  const notesNote = input.notes?.trim() ? ` Notes: ${input.notes.trim()}.` : '';

  return {
    ...base,
    upgradeSummary: `${base.upgradeSummary}${goalNote}${notesNote}`,
    budgetRange: resolveBudgetRange(input.budgetRange),
  };
}

async function fetchImageForGemini(
  imageUrl: string
): Promise<{ mimeType: string; data: string } | null> {
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    return null;
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.warn('[aiProvider] Property photo fetch failed:', response.status);
      return null;
    }

    const contentLength = Number(response.headers.get('content-length') ?? '0');
    if (Number.isFinite(contentLength) && contentLength > MAX_PROVIDER_IMAGE_BYTES) {
      console.warn('[aiProvider] Property photo exceeds provider size limit');
      return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    const mimeType = contentType.split(';')[0].trim().toLowerCase();
    if (!mimeType.startsWith('image/')) {
      console.warn('[aiProvider] Property photo response was not an image');
      return null;
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_PROVIDER_IMAGE_BYTES) {
      console.warn('[aiProvider] Property photo exceeded provider size limit after download');
      return null;
    }
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return { mimeType, data: btoa(binary) };
  } catch (error) {
    console.warn(
      '[aiProvider] Property photo fetch threw:',
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

async function generateWithGemini(
  input: GenerateUpgradePlanTextInput,
  apiKey: string
): Promise<GeminiAttemptResult> {
  const budgetRange = resolveBudgetRange(input.budgetRange);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [];
  let image: { mimeType: string; data: string } | null = null;

  if (input.inputPublicUrl) {
    image = await fetchImageForGemini(input.inputPublicUrl);
    if (image) {
      parts.push({ inline_data: { mime_type: image.mimeType, data: image.data } });
    } else {
      console.warn('[aiProvider] Could not load property photo — plan will use text context only');
    }
  }

  const prompt = buildUpgradePlanPrompt({
    ...input,
    inputPublicUrl: image ? input.inputPublicUrl : '',
  });
  parts.push({ text: prompt });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    }),
  });

  if (!response.ok) {
    const httpStatus = response.status;
    const safeMessage = redactSecrets(await response.text().catch(() => ''));
    console.warn('[aiProvider] Gemini request failed', { status: httpStatus, message: safeMessage });
    return { payload: null, httpStatus };
  }

  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof content !== 'string') {
    console.warn('[aiProvider] Gemini response missing content');
    return { payload: null };
  }

  const parsed = extractJsonFromText(content);
  if (!parsed) {
    console.warn('[aiProvider] Gemini JSON parse failed');
    return { payload: null };
  }

  return { payload: parseUpgradePlanPayload(parsed, budgetRange) };
}

async function generateWithGroqOptional(
  input: GenerateUpgradePlanTextInput,
  apiKey: string
): Promise<UpgradePlanPayload | null> {
  const budgetRange = resolveBudgetRange(input.budgetRange);
  const prompt = buildUpgradePlanPrompt({ ...input, inputPublicUrl: '' });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.6,
      messages: [
        {
          role: 'system',
          content:
            'You are SpaceFlip Pro, a property upgrade planning assistant. ' +
            'Return only valid JSON. No markdown. No commentary. No code fences.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const safeMessage = redactSecrets(await response.text().catch(() => ''));
    console.warn('[aiProvider] Groq request failed', { status: response.status, message: safeMessage });
    return null;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    console.warn('[aiProvider] Groq response missing content');
    return null;
  }

  const parsed = extractJsonFromText(content);
  if (!parsed) {
    console.warn('[aiProvider] Groq JSON parse failed');
    return null;
  }

  return parseUpgradePlanPayload(parsed, budgetRange);
}

/**
 * Generates structured upgrade plan text via Gemini (primary), Groq (optional fallback),
 * otherwise returns a mock payload.
 */
export async function generateUpgradePlanText(
  input: GenerateUpgradePlanTextInput
): Promise<GenerateUpgradePlanTextResult> {
  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  const groqKey = Deno.env.get('GROQ_API_KEY');
  const preference = getAiProviderPreference();
  const geminiDisabled = isGeminiDisabled();

  const mockFallback = (): GenerateUpgradePlanTextResult => ({
    payload: mockGenerateUpgradePlanText(input),
    source: 'mock',
    provider: 'mock',
    estimatedCostCents: 0,
  });

  const tryGroq = async (): Promise<GenerateUpgradePlanTextResult | null> => {
    if (!groqKey) return null;
    try {
      const aiPayload = await generateWithGroqOptional(input, groqKey);
      if (aiPayload) {
        return { payload: aiPayload, source: 'ai', provider: 'groq', estimatedCostCents: 0 };
      }
      console.warn('[aiProvider] Groq failed — using mock fallback');
    } catch (error) {
      console.warn('[aiProvider] Groq threw, using mock', {
        provider: 'groq',
        message: redactSecrets(error instanceof Error ? error.message : error),
      });
    }
    return null;
  };

  const tryGemini = async (): Promise<{
    result: GenerateUpgradePlanTextResult | null;
    rateLimited: boolean;
  }> => {
    if (geminiDisabled) {
      console.warn('[aiProvider] GEMINI_DISABLED=true — skipping Gemini');
      return { result: null, rateLimited: false };
    }
    if (!geminiKey) return { result: null, rateLimited: false };

    try {
      const { payload, httpStatus } = await generateWithGemini(input, geminiKey);
      if (payload) {
        return {
          result: { payload, source: 'ai', provider: 'gemini', estimatedCostCents: 0 },
          rateLimited: false,
        };
      }
      if (httpStatus === 429) {
        console.warn('[aiProvider] Gemini rate limited (429) — trying Groq immediately');
        return { result: null, rateLimited: true };
      }
      console.warn('[aiProvider] Gemini failed', { status: httpStatus ?? 'unknown' });
      return { result: null, rateLimited: false };
    } catch (error) {
      console.warn('[aiProvider] Gemini threw, trying Groq or mock', {
        provider: 'gemini',
        message: redactSecrets(error instanceof Error ? error.message : error),
      });
      return { result: null, rateLimited: false };
    }
  };

  if (preference === 'groq') {
    const groqResult = await tryGroq();
    return groqResult ?? mockFallback();
  }

  if (preference === 'gemini') {
    const { result, rateLimited } = await tryGemini();
    if (result) return result;
    if (rateLimited) {
      const groqResult = await tryGroq();
      if (groqResult) return groqResult;
    }
    return mockFallback();
  }

  const { result: geminiResult, rateLimited } = await tryGemini();
  if (geminiResult) return geminiResult;

  if (rateLimited || !geminiResult) {
    const groqResult = await tryGroq();
    if (groqResult) return groqResult;
  }

  if (!geminiKey && !groqKey) {
    console.warn('[aiProvider] GEMINI_API_KEY and GROQ_API_KEY missing — using mock plan text');
  }

  return mockFallback();
}

/**
 * Placeholder AI provider — returns a mock result URL by project type.
 * Real image generation remains mocked until a later phase.
 */
export async function generateUpgradeImage(
  input: GenerateUpgradeImageInput
): Promise<GenerateUpgradeImageResult> {
  return mockGenerateUpgradeImage(input);
}

export async function mockGenerateUpgradeImage(
  input: GenerateUpgradeImageInput
): Promise<GenerateUpgradeImageResult> {
  const resultImageUrl = MOCK_RESULTS[input.projectType] ?? DEFAULT_MOCK;

  // Simulate provider latency without calling external AI.
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    resultImageUrl,
    estimatedCostCents: 0,
  };
}
