import 'reflect-metadata';

import { Inject, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

import type { MakeCommerceClient } from '../src/index.js';
import {
  InjectMakeCommerceClient,
  MAKECOMMERCE_CLIENT,
  MakeCommerceModule,
} from '../src/nest/index.js';

@Injectable()
class DirectInjectService {
  constructor(@Inject(MAKECOMMERCE_CLIENT) readonly client: MakeCommerceClient) {}
}

@Injectable()
class DecoratorInjectService {
  constructor(@InjectMakeCommerceClient() readonly client: MakeCommerceClient) {}
}

describe('MakeCommerce NestJS integration', () => {
  it('registers MAKECOMMERCE_CLIENT through forRoot', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MakeCommerceModule.forRoot({
          shopId: 'shop-id',
          secretKey: 'secret-key',
          fetch: async () => new Response('{}', { headers: { 'content-type': 'application/json' } }),
        }),
      ],
      providers: [DirectInjectService, DecoratorInjectService],
    }).compile();

    const direct = moduleRef.get(DirectInjectService);
    const decorated = moduleRef.get(DecoratorInjectService);

    expect(direct.client).toBeDefined();
    expect(decorated.client).toBe(direct.client);
  });

  it('builds client through forRootAsync factory', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MakeCommerceModule.forRootAsync({
          useFactory: async () => ({
            shopId: 'shop-id',
            secretKey: 'secret-key',
            fetch: async () => new Response('{}', { headers: { 'content-type': 'application/json' } }),
          }),
        }),
      ],
    }).compile();

    const client = moduleRef.get<MakeCommerceClient>(MAKECOMMERCE_CLIENT);

    expect(client).toBeDefined();
    expect(client.shop).toBeDefined();
    expect(client.transactions).toBeDefined();
    expect(client.refunds).toBeDefined();
  });
});
