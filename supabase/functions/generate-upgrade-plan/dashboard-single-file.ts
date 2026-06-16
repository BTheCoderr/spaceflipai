// @ts-nocheck
// Dashboard paste-only — not part of Expo typecheck or modular CLI deploy.
// =============================================================================
// SpaceFlip Pro — generate-upgrade-plan (Phase 9, single-file Dashboard build)
// -----------------------------------------------------------------------------
// Paste this entire file into:
//   Supabase Dashboard → Edge Functions → generate-upgrade-plan → Edit source
//
// Behavior matches the local modular version:
//   - Provider order: Gemini (vision) → Groq (text) → mock fallback
//   - Image generation stays MOCKED (Unsplash URLs by project type)
//   - Never fails the user flow on AI errors — always completes the job
//   - Secrets read from Deno.env (GEMINI_API_KEY, GROQ_API_KEY)
//   - verify_jwt=false compatible (app invokes with anon key)
//
// Required Edge Function secrets (already managed via Supabase secrets):
//   GEMINI_API_KEY            (primary)
//   GROQ_API_KEY              (optional fallback)
//   SUPABASE_URL              (auto-provided by platform)
//   SUPABASE_SERVICE_ROLE_KEY (auto-provided by platform)
//
// Optional provider controls (Supabase secrets):
//   GEMINI_DISABLED=true              skip Gemini entirely
//   AI_PROVIDER_PREFERENCE=auto       auto | gemini | groq (default: auto)
//   On Gemini 429, Groq is tried immediately (no Gemini retry).
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

// -----------------------------------------------------------------------------
// Types (inlined from _shared/types.ts)
// -----------------------------------------------------------------------------
type UpgradePlanPayload = {
  upgradeSummary: string;
  businessOutcome: string;
  budgetRange: string;
  suggestedMaterials: string[];
  priorityChecklist: string[];
  contractorNotes: string;
  riskNotes: string[];
  photoPrepTips: string[];
};

type PlanSource = 'ai' | 'mock';
type AiProvider = 'gemini' | 'groq' | 'mock';

type GenerationJobRecord = {
  id: string;
  user_id: string;
  project_type: string;
  goal: string | null;
  budget_range: string | null;
  notes: string | null;
  input_image_uri: string | null;
  input_storage_path: string | null;
  input_public_url: string | null;
  result_image_url: string | null;
  result_payload: UpgradePlanPayload | null;
  plan_source: string | null;
  ai_provider: string | null;
  status: string;
  source: string | null;
  estimated_cost_cents: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

type GenerateUpgradePlanTextInput = {
  projectType: string;
  goal: string | null;
  budgetRange: string | null;
  notes: string | null;
  inputPublicUrl: string;
  prompt: string;
};

type GenerateUpgradePlanTextResult = {
  payload: UpgradePlanPayload;
  source: PlanSource;
  provider: AiProvider;
  estimatedCostCents: number;
};

type GenerateUpgradePlanRequest = {
  jobId: string;
  userId?: string;
};

type GenerateUpgradePlanResponse = {
  ok: boolean;
  jobId?: string;
  resultImageUrl?: string;
  resultPayload?: UpgradePlanPayload;
  planSource?: PlanSource;
  aiProvider?: AiProvider;
  estimatedCostCents?: number;
  promptPreview?: string;
  functionVersion?: string;
  error?: string;
};

type GenerateUpgradeImageInput = {
  imageUrl: string;
  prompt: string;
  projectType: string;
};

type GenerateUpgradeImageResult = {
  resultImageUrl: string;
  estimatedCostCents: number;
};

// -----------------------------------------------------------------------------
// Prompt builder (inlined from _shared/promptBuilder.ts)
// -----------------------------------------------------------------------------
const PROJECT_PROMPTS: Record<string, string> = {
  'airbnb-unit':
    'Create a realistic property upgrade concept for this Airbnb unit. Focus on stronger listing photo appeal, guest confidence, brighter staging, practical furniture placement, and a budget-aware checklist. Preserve room structure, windows, doors, and flooring unless the user requested changes.',
  'office-space':
    'Create a realistic office upgrade concept. Focus on desk layout, walking paths, meeting zones, reception flow, and professional appearance.',
  'retail-store':
    'Create a realistic retail improvement concept. Focus on customer flow, product visibility, checkout path, display zones, and storefront appeal.',
  restaurant:
    'Create a realistic restaurant upgrade concept. Focus on seating mix, guest paths, waiting areas, service flow, and front-of-house clarity.',
  'salon-studio':
    'Create a realistic salon or studio upgrade concept. Focus on station layout, client flow, reception queue, and premium presentation.',
  'backyard-landscape':
    'Create a realistic curb appeal and outdoor upgrade concept. Focus on low-maintenance improvements, lighting, seating zones, plant groupings, and property value.',
  'home-exterior':
    'Create a realistic home exterior upgrade concept. Focus on curb appeal, entry presentation, lighting, trim, and perceived property value.',
  'real-estate-listing':
    'Create a realistic listing prep upgrade concept. Focus on buyer appeal, photo-ready staging, decluttering, and rooms buyers see first online.',
  'empty-commercial':
    'Create a realistic empty commercial shell upgrade concept. Focus on tenant-ready zoning, storefront appeal, clear use zones, and leasable presentation.',
};

const DEFAULT_PROMPT =
  'Create a realistic property upgrade concept for this commercial or residential space. Focus on practical improvements, budget-aware scope, and preserving structural elements unless the user requested changes.';

function formatBudget(budgetRange: string | null): string {
  if (!budgetRange?.trim()) return 'Budget: not specified — suggest practical phased options.';
  return `Budget range: ${budgetRange.trim()}.`;
}

function formatGoal(goal: string | null): string {
  if (!goal?.trim()) return 'Primary goal: improve the property for its intended use.';
  return `Primary goal: ${goal.trim()}.`;
}

function formatNotes(notes: string | null): string {
  if (!notes?.trim()) return '';
  return `Additional notes: ${notes.trim()}`;
}

function buildUpgradePrompt(job: GenerationJobRecord): string {
  const projectType = job.project_type ?? 'empty-commercial';
  const typePrompt = PROJECT_PROMPTS[projectType] ?? DEFAULT_PROMPT;
  const imageUrl = job.input_public_url ?? job.input_image_uri ?? '';

  const sections = [
    'SpaceFlip Pro — property upgrade concept request.',
    `Project type: ${projectType.replace(/-/g, ' ')}.`,
    typePrompt,
    formatGoal(job.goal),
    formatBudget(job.budget_range),
    formatNotes(job.notes),
    imageUrl ? `Input property photo: ${imageUrl}` : 'Input property photo: not provided.',
    'Output: one realistic upgraded concept image plus a practical upgrade plan. Preserve architecture unless scope says otherwise.',
  ].filter(Boolean);

  return sections.join('\n\n');
}

// -----------------------------------------------------------------------------
// AI provider + mocks (inlined from _shared/aiProvider.ts)
// -----------------------------------------------------------------------------
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

const GEMINI_MODEL = 'gemini-2.5-flash';
const GROQ_MODEL = 'llama-3.1-8b-instant';

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

/**
 * Removes anything that looks like a provider API key, an `key=`/`api_key=`
 * query param, or a full generativelanguage URL (which carries the key) so it
 * is never written to Supabase logs. Behavior-neutral — log sanitation only.
 */
function redactSecrets(text: unknown): string {
  let out = typeof text === 'string' ? text : String(text ?? '');

  // key=... or api_key=... in query strings or JSON
  out = out.replace(/(api[_-]?key|key)\s*[=:]\s*["']?[A-Za-z0-9._\-]+["']?/gi, '$1=[REDACTED]');
  // Google Gemini key prefix (e.g. AIza..., AQ....)
  out = out.replace(/AIza[0-9A-Za-z._\-]{10,}/g, '[REDACTED]');
  out = out.replace(/AQ\.[0-9A-Za-z._\-]{10,}/g, '[REDACTED]');
  // Groq key prefix
  out = out.replace(/gsk_[0-9A-Za-z]{10,}/g, '[REDACTED]');
  // Bearer tokens
  out = out.replace(/Bearer\s+[0-9A-Za-z._\-]+/gi, 'Bearer [REDACTED]');
  // Full generativelanguage URLs carry the key in the query string
  out = out.replace(/https?:\/\/generativelanguage\.googleapis\.com\/\S*/gi, '[REDACTED_URL]');

  return out.slice(0, 200);
}

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

function mockGenerateUpgradePlanText(input: GenerateUpgradePlanTextInput): UpgradePlanPayload {
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

    const contentType = response.headers.get('content-type') ?? 'image/jpeg';
    const mimeType = contentType.split(';')[0].trim() || 'image/jpeg';
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return { mimeType, data: btoa(binary) };
  } catch (error) {
    console.warn('[aiProvider] Property photo fetch threw', {
      message: redactSecrets(error instanceof Error ? error.message : error),
    });
    return null;
  }
}

async function generateWithGemini(
  input: GenerateUpgradePlanTextInput,
  apiKey: string
): Promise<GeminiAttemptResult> {
  const budgetRange = resolveBudgetRange(input.budgetRange);
  const prompt = buildUpgradePlanPrompt(input);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [];

  if (input.inputPublicUrl) {
    const image = await fetchImageForGemini(input.inputPublicUrl);
    if (image) {
      parts.push({ inline_data: { mime_type: image.mimeType, data: image.data } });
    } else {
      console.warn('[aiProvider] Could not load property photo — plan will use text context only');
    }
  }

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
  const prompt = buildUpgradePlanPrompt(input);

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

async function generateUpgradePlanText(
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

  // Groq-only preference
  if (preference === 'groq') {
    const groqResult = await tryGroq();
    return groqResult ?? mockFallback();
  }

  // Gemini-only preference (429 still falls through to Groq for MVP stability)
  if (preference === 'gemini') {
    const { result, rateLimited } = await tryGemini();
    if (result) return result;
    if (rateLimited) {
      const groqResult = await tryGroq();
      if (groqResult) return groqResult;
    }
    return mockFallback();
  }

  // auto — Gemini → Groq → mock (no Gemini retry on 429)
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

// Image generation stays mocked for MVP cost control.
async function generateUpgradeImage(
  input: GenerateUpgradeImageInput
): Promise<GenerateUpgradeImageResult> {
  const resultImageUrl = MOCK_RESULTS[input.projectType] ?? DEFAULT_MOCK;
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { resultImageUrl, estimatedCostCents: 0 };
}

// -----------------------------------------------------------------------------
// HTTP handler (inlined from generate-upgrade-plan/index.ts)
// -----------------------------------------------------------------------------
const DEMO_USER_ID = 'demo-user';
const FUNCTION_VERSION = 'phase9-dashboard-gemini-v2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: GenerateUpgradePlanResponse, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[generate-upgrade-plan] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return jsonResponse({ ok: false, error: 'Server configuration error' }, 500);
  }

  let body: GenerateUpgradePlanRequest;
  try {
    body = (await req.json()) as GenerateUpgradePlanRequest;
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  const jobId = body.jobId?.trim();
  const userId = body.userId?.trim() || DEMO_USER_ID;

  if (!jobId) {
    return jsonResponse({ ok: false, error: 'jobId is required' }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: job, error: fetchError } = await supabase
    .from('generation_jobs')
    .select('*')
    .eq('id', jobId)
    .maybeSingle();

  if (fetchError) {
    console.error('[generate-upgrade-plan] Fetch job failed:', fetchError.message);
    return jsonResponse({ ok: false, error: 'Could not load generation job' }, 500);
  }

  if (!job) {
    return jsonResponse({ ok: false, error: 'Generation job not found' }, 404);
  }

  const record = job as GenerationJobRecord;

  if (record.user_id !== userId) {
    return jsonResponse({ ok: false, error: 'User does not match job' }, 403);
  }

  const { error: processingError } = await supabase
    .from('generation_jobs')
    .update({ status: 'processing', error_message: null })
    .eq('id', jobId);

  if (processingError) {
    console.error('[generate-upgrade-plan] Update processing failed:', processingError.message);
    return jsonResponse({ ok: false, error: 'Could not update job status' }, 500);
  }

  try {
    const prompt = buildUpgradePrompt(record);
    const inputImageUrl = record.input_public_url ?? record.input_image_uri ?? '';

    const planResult = await generateUpgradePlanText({
      projectType: record.project_type,
      goal: record.goal,
      budgetRange: record.budget_range,
      notes: record.notes,
      inputPublicUrl: inputImageUrl,
      prompt,
    });

    if (planResult.source === 'mock') {
      if (!Deno.env.get('GEMINI_API_KEY') && !Deno.env.get('GROQ_API_KEY')) {
        console.warn('[generate-upgrade-plan] GEMINI_API_KEY and GROQ_API_KEY missing — using mock plan text');
      } else {
        console.warn('[generate-upgrade-plan] AI plan generation failed — using mock plan text');
      }
    }

    const { resultImageUrl } = await generateUpgradeImage({
      imageUrl: inputImageUrl,
      prompt,
      projectType: record.project_type,
    });

    const resultPayload = planResult.payload;
    const planSource = planResult.source;
    const aiProvider = planResult.provider;
    const estimatedCostCents = 0;

    const { error: completeError } = await supabase
      .from('generation_jobs')
      .update({
        status: 'completed',
        result_image_url: resultImageUrl,
        result_payload: resultPayload,
        plan_source: planSource,
        ai_provider: aiProvider,
        estimated_cost_cents: estimatedCostCents,
        error_message: null,
      })
      .eq('id', jobId);

    if (completeError) {
      console.error('[generate-upgrade-plan] Complete job failed:', completeError.message);
      return jsonResponse({ ok: false, error: 'Could not save generation result' }, 500);
    }

    const promptPreview = prompt.length > 280 ? `${prompt.slice(0, 277)}...` : prompt;

    console.log('[generate-upgrade-plan] functionVersion', FUNCTION_VERSION);
    console.log('[generate-upgrade-plan] planSource', planSource);
    console.log('[generate-upgrade-plan] aiProvider', aiProvider);
    console.log('[generate-upgrade-plan] resultPayload keys', Object.keys(resultPayload ?? {}));

    return jsonResponse({
      ok: true,
      jobId,
      resultImageUrl,
      resultPayload,
      planSource,
      aiProvider,
      estimatedCostCents,
      promptPreview,
      functionVersion: FUNCTION_VERSION,
    });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : 'Generation failed';
    const message = redactSecrets(rawMessage);

    await supabase
      .from('generation_jobs')
      .update({ status: 'failed', error_message: message })
      .eq('id', jobId);

    console.error('[generate-upgrade-plan] Generation failed:', message);
    return jsonResponse({ ok: false, error: message }, 500);
  }
});
