import { describe, expect, it, vi } from 'vitest';

import { createMakeCommerceClient } from '../src/index.js';
import type { FetchLike, FetchRequestInput } from '../src/index.js';

describe('MakeCommerce resource routing', () => {
  it('routes resources to documented REST paths', async () => {
    const calls: Array<{ url: URL; method: string; body: string | undefined }> = [];
    const fetchMock = vi.fn<FetchLike>(async (input: FetchRequestInput, init?: RequestInit) => {
      calls.push({
        url: new URL(String(input)),
        method: init?.method ?? 'GET',
        body: typeof init?.body === 'string' ? init.body : undefined,
      });

      return new Response(JSON.stringify({ id: 'resource-1' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });
    const client = createMakeCommerceClient({
      shopId: 'shop-id',
      secretKey: 'secret-key',
      baseUrl: 'https://makecommerce.test/api/',
      fetch: fetchMock,
    });

    await client.shop.getConfiguration();
    await client.shop.getPaymentMethods({ country: 'EE' });
    await client.shop.getAccountStatement({ since: '2026-01-01', payout_id: 'payout-1' });
    await client.shop.getAccountStatementXml({ since: '2026-01-01' });
    await client.shop.getAccountStatementCamt053({ since: '2026-01-01' });
    await client.shop.getFees({ page: 1 });
    await client.transactions.create({
      transaction: {
        amount: '10.00',
        currency: 'EUR',
      },
      customer: {
        ip: '127.0.0.1',
      },
    });
    await client.transactions.list({ status: ['COMPLETED', 'REFUNDED'] });
    await client.transactions.get('trx 1');
    await client.transactions.getStatement('trx-1');
    await client.transactions.addMerchantData('trx-1', { merchant_data: 'order-1' });
    await client.transactions.createPayment('trx-1', { token: 'token-1' });
    await client.refunds.create('trx-1', { amount: '1.00', comment: 'partial' });
    await client.refunds.get('refund 1');
    await client.refunds.list({ status: ['CREATED', 'SETTLED'] });

    expect(calls.map(({ url, method }) => `${method} ${url.pathname}`)).toEqual([
      'GET /api/v1/shop/configuration',
      'GET /api/v1/methods',
      'GET /api/v1/shop/accountstatements',
      'GET /api/v1/shop/accountstatements.xml',
      'GET /api/v1/shop/accountstatements.camt053',
      'GET /api/v1/shop/fees',
      'POST /api/v1/transactions',
      'GET /api/v1/transactions',
      'GET /api/v1/transactions/trx%201',
      'GET /api/v1/transactions/trx-1/statement',
      'POST /api/v1/transactions/trx-1/addMeta',
      'POST /api/v1/transactions/trx-1/payments',
      'POST /api/v1/transactions/trx-1/refunds',
      'GET /api/v1/refunds/refund%201',
      'GET /api/v1/refunds',
    ]);
    expect(calls[1]?.url.searchParams.get('country')).toBe('EE');
    expect(calls[7]?.url.searchParams.getAll('status')).toEqual(['COMPLETED', 'REFUNDED']);
    expect(calls[14]?.url.searchParams.getAll('status')).toEqual(['CREATED', 'SETTLED']);
  });
});
