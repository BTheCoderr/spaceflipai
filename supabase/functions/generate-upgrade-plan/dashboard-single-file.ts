// @ts-nocheck
// Dashboard paste-only — not part of Expo typecheck or modular CLI deploy.
// =============================================================================
// SpaceFlip Pro — generate-upgrade-plan (single-file Dashboard build)
// -----------------------------------------------------------------------------
// Behavior:
//   - Provider order: Gemini (vision) -> Groq (text) -> mock plan-text fallback
//   - No stock/mock concept image: when image generation is OFF (default) or fails,
//     result_image_url = the user's ORIGINAL property photo and concept_image_url = null
//   - Never fails the user flow on AI errors — always completes the job
//   - verify_jwt=false compatible (app invokes with anon key)
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

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
  concept_image_url?: string | null;
  image_provider?: string | null;
  image_generation_status?: string | null;
  image_generation_error?: string | null;
  estimated_image_cost_cents?: number | null;
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
  conceptImageUrl?: string;
  imageProvider?: string;
  imageGenerationStatus?: string;
  estimatedImageCostCents?: number;
  error?: string;
};

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
    'Output: a practical upgrade plan. Preserve architecture unless scope says otherwise.',
  ].filter(Boolean);

  return sections.join('\n\n');
}

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

const DESIGN_INPUTS_BUCKET = 'design-inputs';
const REPLICATE_MODEL = 'black-forest-labs/flux-kontext-pro';
const REPLICATE_COST_CENTS = 4;
const STABILITY_COST_CENTS = 4;

type ConceptImageInput = {
  projectType: string;
  goal: string | null;
  budgetRange: string | null;
  notes: string | null;
  planSummary: string | null;
  inputImageUrl: string;
};

type ConceptImageResult =
  | { status: 'disabled' }
  | { status: 'success'; bytes: Uint8Array; contentType: string; provider: string; costCents: number }
  | { status: 'failed'; provider: string; costCents: number; error: string };

function redactImg(text: unknown): string {
  let out = typeof text === 'string' ? text : String(text ?? '');
  out = out.replace(/Bearer\s+[0-9A-Za-z._\-]+/gi, 'Bearer [REDACTED]');
  out = out.replace(/r8_[0-9A-Za-z]{10,}/g, '[REDACTED]');
  out = out.replace(/sk-[0-9A-Za-z]{10,}/g, '[REDACTED]');
  return out.slice(0, 200);
}

function isImageGenerationEnabled(): boolean {
  return Deno.env.get('IMAGE_GENERATION_ENABLED') === 'true';
}

function getImageProvider(): 'replicate' | 'stability' {
  const p = Deno.env.get('IMAGE_GENERATION_PROVIDER')?.trim().toLowerCase();
  return p === 'stability' ? 'stability' : 'replicate';
}

function maxImagesPerUserPerDay(): number {
  const raw = Number(Deno.env.get('MAX_IMAGE_GENERATIONS_PER_USER_PER_DAY') ?? '5');
  return Number.isFinite(raw) && raw > 0 ? raw : 5;
}

function projectTypeGuidance(projectType: string): string {
  switch (projectType) {
    case 'airbnb-unit':
      return 'Make the space feel guest-ready, clean, durable, and photographable. Use practical furnishings and decor that could improve listing presentation.';
    case 'backyard-landscape':
    case 'home-exterior':
    case 'real-estate-listing':
      return 'Preserve the property structure, driveway, roofline, yard shape, and camera angle. Improve curb appeal with realistic landscaping, lighting, paint/material suggestions, and staging appropriate for the budget.';
    case 'office-space':
    case 'retail-store':
    case 'restaurant':
    case 'salon-studio':
    case 'empty-commercial':
      return 'Make the space more organized, functional, customer/client-ready, and commercially practical.';
    default:
      return 'Improve the space in a clean, practical, business-friendly way appropriate for the budget.';
  }
}

function buildConceptImagePrompt(input: ConceptImageInput): string {
  const goal = input.goal?.trim() || 'improve the space for its intended use';
  const budget = input.budgetRange?.trim() || 'mid-range, practical';
  const summary = input.planSummary?.trim();
  return [
    'Create a realistic concept reference for this property upgrade.',
    'Preserve the original room/property layout, camera angle, walls, windows, doors, major structures, and perspective.',
    `Upgrade the space for ${input.projectType}.`,
    `Goal: ${goal}.`,
    `Budget level: ${budget}.`,
    projectTypeGuidance(input.projectType),
    summary ? `Plan context: ${summary}` : '',
    'Style should be clean, practical, business-friendly, and achievable.',
    'Do not add impossible architecture. Do not add people. Do not add text or watermarks.',
    'This is a planning reference, not a final construction rendering.',
  ]
    .filter(Boolean)
    .join(' ');
}

async function fetchImageBytes(url: string): Promise<{ bytes: Uint8Array; contentType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`input_image_fetch_failed_${response.status}`);
  }
  const contentType = (response.headers.get('content-type') ?? 'image/png').split(';')[0].trim();
  const buffer = await response.arrayBuffer();
  return { bytes: new Uint8Array(buffer), contentType: contentType || 'image/png' };
}

async function generateWithReplicate(
  input: ConceptImageInput,
  token: string,
  prompt: string
): Promise<ConceptImageResult> {
  const createRes = await fetch(
    `https://api.replicate.com/v1/models/${REPLICATE_MODEL}/predictions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      },
      body: JSON.stringify({
        input: {
          prompt,
          input_image: input.inputImageUrl,
          output_format: 'png',
          aspect_ratio: 'match_input_image',
          safety_tolerance: 2,
        },
      }),
    }
  );
  if (!createRes.ok) {
    const msg = redactImg(await createRes.text().catch(() => ''));
    console.warn('[imageProvider] Replicate create failed', { status: createRes.status, message: msg });
    return { status: 'failed', provider: 'replicate', costCents: 0, error: `replicate_${createRes.status}` };
  }
  let prediction = await createRes.json();
  const getUrl: string | undefined = prediction?.urls?.get;
  for (
    let i = 0;
    i < 30 && prediction?.status && !['succeeded', 'failed', 'canceled'].includes(prediction.status);
    i += 1
  ) {
    await new Promise((r) => setTimeout(r, 2000));
    if (!getUrl) break;
    const pollRes = await fetch(getUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!pollRes.ok) break;
    prediction = await pollRes.json();
  }
  if (prediction?.status !== 'succeeded') {
    console.warn('[imageProvider] Replicate did not succeed', { status: prediction?.status });
    return { status: 'failed', provider: 'replicate', costCents: 0, error: 'replicate_not_succeeded' };
  }
  const output = prediction.output;
  const outputUrl: string | undefined = Array.isArray(output) ? output[0] : output;
  if (typeof outputUrl !== 'string') {
    return { status: 'failed', provider: 'replicate', costCents: 0, error: 'replicate_no_output' };
  }
  try {
    const { bytes, contentType } = await fetchImageBytes(outputUrl);
    return { status: 'success', bytes, contentType, provider: 'replicate', costCents: REPLICATE_COST_CENTS };
  } catch (error) {
    console.warn('[imageProvider] Replicate output download failed', { message: redactImg(error) });
    return { status: 'failed', provider: 'replicate', costCents: REPLICATE_COST_CENTS, error: 'replicate_download_failed' };
  }
}

async function generateWithStability(
  input: ConceptImageInput,
  apiKey: string,
  prompt: string
): Promise<ConceptImageResult> {
  let source: { bytes: Uint8Array; contentType: string };
  try {
    source = await fetchImageBytes(input.inputImageUrl);
  } catch (error) {
    console.warn('[imageProvider] Stability input fetch failed', { message: redactImg(error) });
    return { status: 'failed', provider: 'stability', costCents: 0, error: 'stability_input_fetch_failed' };
  }
  const form = new FormData();
  form.append('image', new Blob([source.bytes], { type: source.contentType }), 'input.png');
  form.append('prompt', prompt);
  form.append('control_strength', '0.7');
  form.append('output_format', 'png');
  const res = await fetch('https://api.stability.ai/v2beta/stable-image/control/structure', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'image/*' },
    body: form,
  });
  if (!res.ok) {
    const msg = redactImg(await res.text().catch(() => ''));
    console.warn('[imageProvider] Stability failed', { status: res.status, message: msg });
    return { status: 'failed', provider: 'stability', costCents: 0, error: `stability_${res.status}` };
  }
  const buffer = await res.arrayBuffer();
  return {
    status: 'success',
    bytes: new Uint8Array(buffer),
    contentType: 'image/png',
    provider: 'stability',
    costCents: STABILITY_COST_CENTS,
  };
}

async function generateConceptImage(input: ConceptImageInput): Promise<ConceptImageResult> {
  if (!isImageGenerationEnabled()) {
    return { status: 'disabled' };
  }
  if (!input.inputImageUrl || !/^https?:\/\//.test(input.inputImageUrl)) {
    return { status: 'failed', provider: getImageProvider(), costCents: 0, error: 'no_public_input_image' };
  }
  const provider = getImageProvider();
  const prompt = buildConceptImagePrompt(input);
  try {
    if (provider === 'stability') {
      const key = Deno.env.get('STABILITY_API_KEY');
      if (!key) return { status: 'failed', provider, costCents: 0, error: 'missing_stability_key' };
      return await generateWithStability(input, key, prompt);
    }
    const token = Deno.env.get('REPLICATE_API_TOKEN');
    if (!token) return { status: 'failed', provider, costCents: 0, error: 'missing_replicate_token' };
    return await generateWithReplicate(input, token, prompt);
  } catch (error) {
    console.warn('[imageProvider] Unexpected error', { provider, message: redactImg(error) });
    return { status: 'failed', provider, costCents: 0, error: 'unexpected_error' };
  }
}

type ConceptImageOutcome = {
  resultImageUrl: string;
  conceptImageUrl: string | null;
  imageProvider: string;
  imageGenerationStatus: string;
  imageGenerationError: string | null;
  estimatedImageCostCents: number;
};

async function maybeGenerateConceptImage(
  supabase: ReturnType<typeof createClient>,
  record: GenerationJobRecord,
  jobId: string,
  originalImageUrl: string,
  planSummary: string | null
): Promise<ConceptImageOutcome> {
  // Default (no real concept image): show the user's original property photo.
  const fallback: ConceptImageOutcome = {
    resultImageUrl: originalImageUrl,
    conceptImageUrl: null,
    imageProvider: 'none',
    imageGenerationStatus: 'not_generated',
    imageGenerationError: null,
    estimatedImageCostCents: 0,
  };

  if (!isImageGenerationEnabled()) {
    return { ...fallback, imageGenerationStatus: 'disabled' };
  }

  try {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from('generation_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', record.user_id)
      .eq('image_generation_status', 'completed')
      .gte('created_at', since.toISOString());
    if (typeof count === 'number' && count >= maxImagesPerUserPerDay()) {
      console.warn('[generate-upgrade-plan] Image generation daily limit reached for user');
      return { ...fallback, imageGenerationStatus: 'skipped_limit' };
    }
  } catch {
    // Proceed if the guard query fails (one image per job is still bounded).
  }

  const inputImageUrl = record.input_public_url ?? record.input_image_uri ?? '';
  const concept = await generateConceptImage({
    projectType: record.project_type,
    goal: record.goal,
    budgetRange: record.budget_range,
    notes: record.notes,
    planSummary,
    inputImageUrl,
  });

  if (concept.status === 'disabled') {
    return { ...fallback, imageGenerationStatus: 'disabled' };
  }

  if (concept.status === 'failed') {
    // Do not expose provider failure to the user; keep the original photo.
    return {
      ...fallback,
      imageProvider: 'none',
      imageGenerationStatus: 'failed',
      imageGenerationError: concept.error,
      estimatedImageCostCents: concept.costCents,
    };
  }

  const path = `users/${record.user_id}/outputs/${jobId}/concept.png`;
  const { error: uploadError } = await supabase.storage
    .from(DESIGN_INPUTS_BUCKET)
    .upload(path, concept.bytes, { contentType: concept.contentType, upsert: true });

  if (uploadError) {
    console.warn('[generate-upgrade-plan] Concept image upload failed:', uploadError.message);
    return {
      ...fallback,
      imageProvider: 'none',
      imageGenerationStatus: 'failed',
      imageGenerationError: 'storage_upload_failed',
      estimatedImageCostCents: concept.costCents,
    };
  }

  const { data: pub } = supabase.storage.from(DESIGN_INPUTS_BUCKET).getPublicUrl(path);
  return {
    resultImageUrl: pub.publicUrl,
    conceptImageUrl: pub.publicUrl,
    imageProvider: concept.provider,
    imageGenerationStatus: 'completed',
    imageGenerationError: null,
    estimatedImageCostCents: concept.costCents,
  };
}

const DEMO_USER_ID = 'demo-user';
const FUNCTION_VERSION = 'phase19-no-mock-image-v1';

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

async function getAuthenticatedUserId(
  supabase: ReturnType<typeof createClient>,
  authHeader: string | null
): Promise<string | null> {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
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
  const authUserId = await getAuthenticatedUserId(supabase, req.headers.get('Authorization'));
  const effectiveUserId = authUserId ?? userId;
  console.log('[generate-upgrade-plan] auth resolved:', authUserId ? 'jwt' : 'fallback-body');
  if (record.user_id !== effectiveUserId) {
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
    const resultPayload = planResult.payload;
    const planSource = planResult.source;
    const aiProvider = planResult.provider;
    const estimatedCostCents = 0;
    // Real AI concept image only when enabled; otherwise the user's original
    // property photo is used as the visual (never a stock/mock image).
    const originalImageUrl = record.input_public_url ?? record.input_image_uri ?? inputImageUrl ?? '';
    const image = await maybeGenerateConceptImage(
      supabase,
      record,
      jobId,
      originalImageUrl,
      resultPayload?.upgradeSummary ?? null
    );
    const { error: completeError } = await supabase
      .from('generation_jobs')
      .update({
        status: 'completed',
        result_image_url: image.resultImageUrl,
        result_payload: resultPayload,
        plan_source: planSource,
        ai_provider: aiProvider,
        estimated_cost_cents: estimatedCostCents,
        concept_image_url: image.conceptImageUrl,
        image_provider: image.imageProvider,
        image_generation_status: image.imageGenerationStatus,
        image_generation_error: image.imageGenerationError,
        estimated_image_cost_cents: image.estimatedImageCostCents,
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
    console.log('[generate-upgrade-plan] imageProvider', image.imageProvider);
    console.log('[generate-upgrade-plan] imageGenerationStatus', image.imageGenerationStatus);
    return jsonResponse({
      ok: true,
      jobId,
      resultImageUrl: image.resultImageUrl,
      resultPayload,
      planSource,
      aiProvider,
      estimatedCostCents,
      promptPreview,
      functionVersion: FUNCTION_VERSION,
      conceptImageUrl: image.conceptImageUrl ?? undefined,
      imageProvider: image.imageProvider,
      imageGenerationStatus: image.imageGenerationStatus,
      estimatedImageCostCents: image.estimatedImageCostCents,
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
