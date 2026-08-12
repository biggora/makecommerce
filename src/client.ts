import type { MakeCommerceClientOptions, RequestOptions } from './core/http-client.js';
import { HttpClient } from './core/http-client.js';
import { RefundsResource } from './resources/refunds.js';
import { ShopResource } from './resources/shop.js';
import { TransactionsResource } from './resources/transactions.js';

export class MakeCommerceClient {
  readonly shop: ShopResource;
  readonly transactions: TransactionsResource;
  readonly refunds: RefundsResource;
  private readonly httpClient: HttpClient;

  constructor(options: MakeCommerceClientOptions) {
    this.httpClient = new HttpClient(options);
    this.shop = new ShopResource(this.httpClient);
    this.transactions = new TransactionsResource(this.httpClient);
    this.refunds = new RefundsResource(this.httpClient);
  }

  request<TResponse, TBody = unknown>(options: RequestOptions<TBody>): Promise<TResponse> {
    return this.httpClient.request<TResponse, TBody>(options);
  }
}

export function createMakeCommerceClient(options: MakeCommerceClientOptions): MakeCommerceClient {
  return new MakeCommerceClient(options);
}
