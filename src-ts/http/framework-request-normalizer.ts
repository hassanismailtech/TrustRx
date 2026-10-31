import type { HttpRequestContext } from '../ports/authentication.js';

export interface FrameworkRequestInput {
  method: string;
  path: string;
  headers: Readonly<Record<string, string | readonly string[] | undefined>>;
  query?: Readonly<Record<string, string | readonly string[] | undefined>>;
  body: unknown;
}

export interface RequestIdGenerator {
  create(): string;
}

const ALLOWED_HEADERS = new Set(['authorization', 'content-type', 'idempotency-key', 'x-provider-signature', 'x-provider-timestamp']);
const ALLOWED_QUERY = new Set(['limit', 'before']);
const ALLOWED_PATHS = new Set(['/api/v1/signals', '/api/v1/reviewer/queue', '/api/v1/reviewer/decisions']);

function normalizationError(message: string): never {
  const error = new Error(message);
  error.name = 'InvalidFrameworkRequestError';
  throw error;
}

function normalizedHeaders(headers: FrameworkRequestInput['headers']): Readonly<Record<string, string | undefined>> {
  const output: Record<string, string> = {};
  for (const [rawName, value] of Object.entries(headers)) {
    const name = rawName.toLowerCase();
    if (!ALLOWED_HEADERS.has(name)) continue;
    if (typeof value !== 'string' || value.length === 0 || value.length > 4096 || /[\r\n]/.test(value)) normalizationError('Request header is invalid');
    if (output[name] !== undefined) normalizationError('Request contains duplicate protected header');
    output[name] = value;
  }
  return output;
}

function normalizedQuery(query: FrameworkRequestInput['query']): Readonly<Record<string, string | undefined>> {
  const output: Record<string, string> = {};
  for (const [name, value] of Object.entries(query ?? {})) {
    if (!ALLOWED_QUERY.has(name)) normalizationError('Request query parameter is not allowed');
    if (typeof value !== 'string' || value.length > 512 || /[\r\n]/.test(value)) normalizationError('Request query parameter is invalid');
    output[name] = value;
  }
  return output;
}

/**
 * Creates an internal request context from a framework-parsed request. It does
 * not parse a body, trust client request IDs, verify signatures or log input.
 */
export function normalizeFrameworkRequest(input: FrameworkRequestInput, ids: RequestIdGenerator): HttpRequestContext {
  const method = input.method.toUpperCase();
  if (!['GET', 'POST'].includes(method) || input.method !== method || !ALLOWED_PATHS.has(input.path)) normalizationError('Request method or path is invalid');
  const requestId = ids.create();
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(requestId)) normalizationError('Generated request identifier is invalid');
  return { method, path: input.path, headers: normalizedHeaders(input.headers), query: normalizedQuery(input.query), body: input.body, requestId };
}
