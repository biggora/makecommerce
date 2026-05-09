# @biggora/makecommerce

[![npm version](https://img.shields.io/npm/v/@biggora/makecommerce.svg)](https://www.npmjs.com/package/@biggora/makecommerce)
[![Unit Tests](https://github.com/biggora/makecommerce/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/biggora/makecommerce/actions/workflows/unit-tests.yml
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TypeScript SDK and NestJS adapter for the MakeCommerce REST API.

## Install

```bash
npm install @biggora/makecommerce
```

## Node.js

```ts
import { createMakeCommerceClient } from '@biggora/makecommerce';

const makeCommerce = createMakeCommerceClient({
  shopId: process.env.MAKECOMMERCE_SHOP_ID!,
  secretKey: process.env.MAKECOMMERCE_SECRET_KEY!,
  environment: 'test',
});

const transaction = await makeCommerce.transactions.create({
  transaction: {
    amount: '10.00',
    currency: 'EUR',
    reference: 'order-123',
    transaction_url: {
      return_url: {
        url: 'https://shop.example/checkout/return',
        method: 'GET',
      },
      cancel_url: {
        url: 'https://shop.example/checkout/cancel',
        method: 'GET',
      },
      notification_url: {
        url: 'https://shop.example/webhooks/makecommerce',
        method: 'POST',
      },
    },
  },
  customer: {
    ip: '203.0.113.10',
    email: 'buyer@example.com',
    country: 'EE',
    locale: 'et',
  },
});

const redirectUrl = transaction.payment_methods?.other?.find((method) => method.name === 'redirect')?.url;
```

`environment` defaults to `test`. Use `environment: 'live'` for `https://api.maksekeskus.ee`, or pass `baseUrl` for custom routing.

## Resources

```ts
await makeCommerce.shop.getConfiguration();
await makeCommerce.shop.getPaymentMethods({ amount: '10.00', currency: 'EUR', country: 'EE' });
await makeCommerce.shop.getAccountStatement({ since: '2026-01-01' });
await makeCommerce.shop.getAccountStatementXml({ since: '2026-01-01' });
await makeCommerce.shop.getAccountStatementCamt053({ since: '2026-01-01' });
await makeCommerce.shop.getFees({ since: '2026-01-01' });

await makeCommerce.transactions.list({ status: ['COMPLETED', 'REFUNDED'] });
await makeCommerce.transactions.get('transaction-id');
await makeCommerce.transactions.getStatement('transaction-id');
await makeCommerce.transactions.addMerchantData('transaction-id', { merchant_data: 'order-123' });
await makeCommerce.transactions.createPayment('transaction-id', { token: 'token-id' });

await makeCommerce.refunds.create('transaction-id', { amount: '1.00', comment: 'Partial refund' });
await makeCommerce.refunds.get('refund-id');
await makeCommerce.refunds.list({ status: 'SETTLED' });
```

## NestJS

```ts
import { Module } from '@nestjs/common';
import { MakeCommerceModule } from '@biggora/makecommerce/nestjs';

@Module({
  imports: [
    MakeCommerceModule.forRoot({
      shopId: process.env.MAKECOMMERCE_SHOP_ID!,
      secretKey: process.env.MAKECOMMERCE_SECRET_KEY!,
      environment: 'test',
    }),
  ],
})
export class AppModule {}
```

```ts
import { Injectable } from '@nestjs/common';
import { InjectMakeCommerceClient } from '@biggora/makecommerce/nestjs';
import type { MakeCommerceClient } from '@biggora/makecommerce';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectMakeCommerceClient()
    private readonly makeCommerce: MakeCommerceClient,
  ) {}
}
```

Async configuration:

```ts
MakeCommerceModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    shopId: config.getOrThrow('MAKECOMMERCE_SHOP_ID'),
    secretKey: config.getOrThrow('MAKECOMMERCE_SECRET_KEY'),
    environment: config.get('MAKECOMMERCE_ENVIRONMENT') ?? 'test',
  }),
});
```

## Errors

Failed API responses and request failures throw `MakeCommerceApiError`.

```ts
try {
  await makeCommerce.transactions.get('missing-id');
} catch (error) {
  if (error instanceof MakeCommerceApiError) {
    console.log(error.status, error.code, error.requestId);
  }
}
```
