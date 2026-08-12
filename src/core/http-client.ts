import { MakeCommerceApiError, createMakeCommerceApiError, createMakeCommerceRequestError } from './error.js';
import type { MakeCommerceEnvironment, MakeCommerceHttpMethod, QueryRecord } from './types.js';

export type FetchRequestInput = string | URL | Request;
export type FetchLike = (input: FetchRequestInput, init?: RequestInit) => Promise<Response>;

export type MakeCommerceClientOptions = {
  shopId: string;
  secretKey: string;
  environment?: MakeCommerceEnvironment;
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: FetchLike;
};

export type RequestOptions<TBody = unknown> = {
  method: MakeCommerceHttpMethod;
  path?: string | undefined;
  absoluteUrl?: string | undefined;
  query?: QueryRecord | undefined;
  body?: TBody | undefined;
  signal?: AbortSignal | undefined;
  responseType?: 'json' | 'text' | 'void' | undefined;
};

const BASE_URLS: Record<MakeCommerceEnvironment, string> = {
  test: 'https://api.test.maksekeskus.ee/',
  live: 'https://api.maksekeskus.ee/',
};

export class HttpClient {
  readonly shopId: string;
  readonly secretKey: string;
  readonly environment: MakeCommerceEnvironment;
  readonly baseUrl: string;
  readonly timeoutMs: number;
  private readonly fetchImpl: FetchLike;

  constructor(options: MakeCommerceClientOptions) {
    this.shopId = options.shopId;
    this.secretKey = options.secretKey;
    this.environment = options.environment ?? 'test';
    this.baseUrl = ensureTrailingSlash(options.baseUrl ?? BASE_URLS[this.environment]);
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  async request<TResponse, TBody = unknown>(options: RequestOptions<TBody>): Promise<TResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const combinedSignal = options.signal
      ? AbortSignal.any([controller.signal, options.signal])
      : controller.signal;

    try {
      const init: RequestInit = {
        method: options.method,
        headers: this.buildHeaders(options.body),
        signal: combinedSignal,
      };
      if (options.body !== undefined) {
        init.body = JSON.stringify(options.body);
      }

      const response = await this.fetchImpl(this.buildUrl(options), init);

      if (!response.ok) {
        throw await createMakeCommerceApiError(response);
      }

      if (response.status === 204 || options.responseType === 'void') {
        return undefined as TResponse;
      }

      if (options.responseType === 'text') {
        return await response.text() as TResponse;
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json') && !contentType.includes('application/hal+json')) {
        return undefined as TResponse;
      }

      return await response.json() as TResponse;
    } catch (error) {
      throw error instanceof MakeCommerceApiError ? error : createMakeCommerceRequestError(error);
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildUrl(options: RequestOptions<unknown>): URL {
    const url = options.absoluteUrl
      ? new URL(options.absoluteUrl)
      : new URL(stripLeadingSlash(options.path ?? ''), this.baseUrl);

    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value === undefined || value === null) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const entry of value) {
          url.searchParams.append(key, String(entry));
        }
        continue;
      }

      url.searchParams.set(key, String(value));
    }

    return url;
  }

  private buildHeaders(body: unknown): Headers {
    const headers = new Headers({
      accept: 'application/json',
      authorization: `Basic ${encodeBasicAuth(this.shopId, this.secretKey)}`,
    });

    if (body !== undefined) {
      headers.set('content-type', 'application/json');
    }

    return headers;
  }
}

function encodeBasicAuth(username: string, password: string): string {
  return Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

function stripLeadingSlash(value: string): string {
  return value.startsWith('/') ? value.slice(1) : value;
}
