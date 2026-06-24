// SpaceFlip Pro — AI concept image generation (image-to-image).
//
// OFF by default. Only runs when IMAGE_GENERATION_ENABLED === 'true' AND a
// provider key is present. Returns a 'disabled' result otherwise so callers
// keep the existing mock/fallback image.
//
// Provider direction:
//   * IMAGE_GENERATION_PROVIDER=replicate (default) → FLUX Kontext (image edit)
//   * IMAGE_GENERATION_PROVIDER=stability → Stability structure control
//
// Never logs tokens or keys.

export type ConceptImageInput = {
  projectType: string;
  goal: string | null;
  budgetRange: string | null;
  notes: string | null;
  planSummary: string | null;
  inputImageUrl: string;
};

export type ConceptImageResult =
  | { status: 'disabled' }
  | { status: 'success'; bytes: Uint8Array; contentType: string; provider: string; costCents: number }
  | { status: 'failed'; provider: string; costCents: number; error: string };

const REPLICATE_MODEL = 'black-forest-labs/flux-kontext-pro';
const REPLICATE_COST_CENTS = 4;
const STABILITY_COST_CENTS = 4;

function redact(text: unknown): string {
  let out = typeof text === 'string' ? text : String(text ?? '');
  out = out.replace(/Bearer\s+[0-9A-Za-z._\-]+/gi, 'Bearer [REDACTED]');
  out = out.replace(/r8_[0-9A-Za-z]{10,}/g, '[REDACTED]');
  out = out.replace(/sk-[0-9A-Za-z]{10,}/g, '[REDACTED]');
  return out.slice(0, 200);
}

export function isImageGenerationEnabled(): boolean {
  return Deno.env.get('IMAGE_GENERATION_ENABLED') === 'true';
}

function getProvider(): 'replicate' | 'stability' {
  const p = Deno.env.get('IMAGE_GENERATION_PROVIDER')?.trim().toLowerCase();
  return p === 'stability' ? 'stability' : 'replicate';
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

export function buildConceptImagePrompt(input: ConceptImageInput): string {
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
    const msg = redact(await createRes.text().catch(() => ''));
    console.warn('[imageProvider] Replicate create failed', { status: createRes.status, message: msg });
    return { status: 'failed', provider: 'replicate', costCents: 0, error: `replicate_${createRes.status}` };
  }

  let prediction = await createRes.json();

  // Poll if the synchronous "Prefer: wait" did not reach a terminal state.
  const getUrl: string | undefined = prediction?.urls?.get;
  for (let i = 0; i < 30 && prediction?.status && !['succeeded', 'failed', 'canceled'].includes(prediction.status); i += 1) {
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

  // FLUX Kontext output is a single URL (or array of URLs).
  const output = prediction.output;
  const outputUrl: string | undefined = Array.isArray(output) ? output[0] : output;
  if (typeof outputUrl !== 'string') {
    return { status: 'failed', provider: 'replicate', costCents: 0, error: 'replicate_no_output' };
  }

  try {
    const { bytes, contentType } = await fetchImageBytes(outputUrl);
    return { status: 'success', bytes, contentType, provider: 'replicate', costCents: REPLICATE_COST_CENTS };
  } catch (error) {
    console.warn('[imageProvider] Replicate output download failed', { message: redact(error) });
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
    console.warn('[imageProvider] Stability input fetch failed', { message: redact(error) });
    return { status: 'failed', provider: 'stability', costCents: 0, error: 'stability_input_fetch_failed' };
  }

  const form = new FormData();
  form.append('image', new Blob([source.bytes], { type: source.contentType }), 'input.png');
  form.append('prompt', prompt);
  form.append('control_strength', '0.7');
  form.append('output_format', 'png');

  const res = await fetch('https://api.stability.ai/v2beta/stable-image/control/structure', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'image/*',
    },
    body: form,
  });

  if (!res.ok) {
    const msg = redact(await res.text().catch(() => ''));
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

/**
 * Generates an AI concept image from the original property photo.
 * Returns 'disabled' when the feature flag/keys are off so the caller keeps
 * the existing mock/fallback image. Never throws.
 */
export async function generateConceptImage(input: ConceptImageInput): Promise<ConceptImageResult> {
  if (!isImageGenerationEnabled()) {
    return { status: 'disabled' };
  }
  if (!input.inputImageUrl || !/^https?:\/\//.test(input.inputImageUrl)) {
    return { status: 'failed', provider: getProvider(), costCents: 0, error: 'no_public_input_image' };
  }

  const provider = getProvider();
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
    console.warn('[imageProvider] Unexpected error', { provider, message: redact(error) });
    return { status: 'failed', provider, costCents: 0, error: 'unexpected_error' };
  }
}
