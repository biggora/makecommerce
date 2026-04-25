import { afterEach, describe, expect, it, vi } from 'vitest';

import { MakeCommerceApiError, createMakeCommerceClient } from '../src/index.js';
import type { FetchLike, FetchRequestInput } from '../src/index.js';

function createJsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

describe('MakeCommerceClient core behavior', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds Basic authorization header and JSON content type', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => createJsonResponse({ id: 'trx-1' }));
    const client = createMakeCommerceClient({
      shopId: 'shop-id',
      secretKey: 'secret-key',
      baseUrl: 'https://makecommerce.test/',
      fetch: fetchMock,
    });

    await client.transactions.create({
      transaction: {
        amount: '10.00',
        currency: 'EUR',
      },
      customer: {
        ip: '127.0.0.1',
      },
    });

    const call = fetchMock.mock.calls[0];
    if (!call) {
      throw new Error('Expected API call.');
    }

    const [input, init] = call;
    const headers = new Headers(init?.headers);

    expect(String(input)).toBe('https://makecommerce.test/v1/transactions');
    expect(init?.method).toBe('POST');
    expect(headers.get('authorization')).toBe(`Basic ${Buffer.from('shop-id:secret-key').toString('base64')}`);
    expect(headers.get('content-type')).toBe('application/json');
  });

  it('uses test base URL by default', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => createJsonResponse({ id: 'shop-1' }));
    const client = createMakeCommerceClient({
      shopId: 'shop-id',
      secretKey: 'secret-key',
      fetch: fetchMock,
    });

    await client.shop.getConfiguration();

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe('https://api.test.maksekeskus.ee/v1/shop/configuration');
  });

  it('uses live base URL when environment is live', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => createJsonResponse({ id: 'shop-1' }));
    const client = createMakeCommerceClient({
      shopId: 'shop-id',
      secretKey: 'secret-key',
      environment: 'live',
      fetch: fetchMock,
    });

    await client.shop.getConfiguration();

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe('https://api.maksekeskus.ee/v1/shop/configuration');
  });

  it('serializes array query values', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => createJsonResponse([]));
    const client = createMakeCommerceClient({
      shopId: 'shop-id',
      secretKey: 'secret-key',
      baseUrl: 'https://makecommerce.test/api/',
      fetch: fetchMock,
    });

    await client.transactions.list({ status: ['COMPLETED', 'REFUNDED'], page: 2 });

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(url.searchParams.getAll('status')).toEqual(['COMPLETED', 'REFUNDED']);
    expect(url.searchParams.get('page')).toBe('2');
  });

  it('normalizes MakeCommerce API errors', async () => {
    const fetchMock = vi.fn<FetchLike>(async () =>
      createJsonResponse(
        {
          error: 'invalid_request',
          error_description: 'Amount is required',
        },
        {
          status: 400,
          headers: {
            'content-type': 'application/json',
            'x-request-id': 'req-1',
          },
        },
      ),
    );
    const client = createMakeCommerceClient({
      shopId: 'shop-id',
      secretKey: 'secret-key',
      fetch: fetchMock,
    });

    await expect(client.shop.getConfiguration()).rejects.toMatchObject({
      name: 'MakeCommerceApiError',
      status: 400,
      code: 'invalid_request',
      requestId: 'req-1',
      message: 'Amount is required',
    } satisfies Partial<MakeCommerceApiError>);
  });

  it('normalizes request timeout errors', async () => {
    const fetchMock = vi.fn<FetchLike>(
      async (_input: FetchRequestInput, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    );
    const client = createMakeCommerceClient({
      shopId: 'shop-id',
      secretKey: 'secret-key',
      timeoutMs: 10,
      fetch: fetchMock,
    });

    await expect(client.shop.getConfiguration()).rejects.toMatchObject({
      name: 'MakeCommerceApiError',
      code: 'request_timeout',
    } satisfies Partial<MakeCommerceApiError>);
  });

  it('returns text for XML and CAMT statement resources', async () => {
    const fetchMock = vi.fn<FetchLike>(async () =>
      new Response('<statement />', {
        status: 200,
        headers: { 'content-type': 'application/xml' },
      }),
    );
    const client = createMakeCommerceClient({
      shopId: 'shop-id',
      secretKey: 'secret-key',
      fetch: fetchMock,
    });

    await expect(client.shop.getAccountStatementXml({ since: '2026-01-01' })).resolves.toBe('<statement />');
  });
});
