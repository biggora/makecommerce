export type MakeCommerceApiErrorOptions = {
  status?: number;
  code?: string;
  requestId?: string;
  raw?: unknown;
  cause?: unknown;
};

export class MakeCommerceApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly requestId?: string;
  readonly raw?: unknown;

  constructor(message: string, options: MakeCommerceApiErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = 'MakeCommerceApiError';
    this.status = options.status;
    this.code = options.code;
    this.requestId = options.requestId;
    this.raw = options.raw;
  }
}

export async function createMakeCommerceApiError(response: Response): Promise<MakeCommerceApiError> {
  const contentType = response.headers.get('content-type') ?? '';
  const requestId = response.headers.get('x-request-id') ?? undefined;
  const raw = await readErrorBody(response, contentType);
  const { code, message } = normalizeErrorBody(raw, response.statusText || 'MakeCommerce API error.');

  return new MakeCommerceApiError(message, {
    status: response.status,
    code,
    requestId,
    raw,
  });
}

export function createMakeCommerceRequestError(error: unknown): MakeCommerceApiError {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new MakeCommerceApiError('MakeCommerce request timed out.', {
      code: 'request_timeout',
      cause: error,
    });
  }

  if (error instanceof Error) {
    return new MakeCommerceApiError(error.message, {
      code: 'request_failed',
      cause: error,
    });
  }

  return new MakeCommerceApiError('MakeCommerce request failed.', {
    code: 'request_failed',
    raw: error,
  });
}

async function readErrorBody(response: Response, contentType: string): Promise<unknown> {
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }

  try {
    const text = await response.text();
    return text || undefined;
  } catch {
    return undefined;
  }
}

function normalizeErrorBody(raw: unknown, fallback: string): { code?: string; message: string } {
  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    const code = stringify(record.code ?? record.error);
    const message = stringify(record.message ?? record.error_description ?? record.description) ?? fallback;
    return { code, message };
  }

  if (typeof raw === 'string' && raw.length > 0) {
    return { message: raw };
  }

  return { message: fallback };
}

function stringify(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
