import type { DynamicModule, FactoryProvider, ModuleMetadata, Provider } from '@nestjs/common';
import { Module } from '@nestjs/common';

import { MakeCommerceClient } from '../client.js';
import type { MakeCommerceClientOptions } from '../core/http-client.js';
import { MAKECOMMERCE_CLIENT, MAKECOMMERCE_MODULE_OPTIONS } from './tokens.js';

export type MakeCommerceModuleAsyncOptions = {
  imports?: ModuleMetadata['imports'];
  inject?: FactoryProvider<MakeCommerceClientOptions>['inject'];
  useFactory: (...args: any[]) => Promise<MakeCommerceClientOptions> | MakeCommerceClientOptions;
};

function createClientProvider(): Provider {
  return {
    provide: MAKECOMMERCE_CLIENT,
    inject: [MAKECOMMERCE_MODULE_OPTIONS],
    useFactory: (options: MakeCommerceClientOptions) => new MakeCommerceClient(options),
  };
}

@Module({})
export class MakeCommerceModule {
  static forRoot(options: MakeCommerceClientOptions): DynamicModule {
    return {
      module: MakeCommerceModule,
      providers: [
        {
          provide: MAKECOMMERCE_MODULE_OPTIONS,
          useValue: options,
        },
        createClientProvider(),
      ],
      exports: [MAKECOMMERCE_CLIENT],
    };
  }

  static forRootAsync(options: MakeCommerceModuleAsyncOptions): DynamicModule {
    return {
      module: MakeCommerceModule,
      imports: options.imports ?? [],
      providers: [
        {
          provide: MAKECOMMERCE_MODULE_OPTIONS,
          inject: options.inject ?? [],
          useFactory: options.useFactory,
        },
        createClientProvider(),
      ],
      exports: [MAKECOMMERCE_CLIENT],
    };
  }
}
