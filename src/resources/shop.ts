import type { HttpClient } from '../core/http-client.js';
import type {
  MakeCommerceFee,
  MakeCommerceFeesQuery,
  MakeCommercePaymentMethods,
  MakeCommercePaymentMethodsQuery,
  MakeCommerceShopConfiguration,
  MakeCommerceStatementQuery,
  MakeCommerceStatementRow,
} from '../core/types.js';

export class ShopResource {
  constructor(private readonly httpClient: HttpClient) {}

  getConfiguration(): Promise<MakeCommerceShopConfiguration> {
    return this.httpClient.request({ method: 'GET', path: 'v1/shop/configuration' });
  }

  getPaymentMethods(query?: MakeCommercePaymentMethodsQuery): Promise<MakeCommercePaymentMethods> {
    return this.httpClient.request({ method: 'GET', path: 'v1/methods', query });
  }

  getAccountStatement(query: MakeCommerceStatementQuery): Promise<MakeCommerceStatementRow[]> {
    return this.httpClient.request({ method: 'GET', path: 'v1/shop/accountstatements', query });
  }

  getAccountStatementXml(query: MakeCommerceStatementQuery): Promise<string | undefined> {
    return this.httpClient.request({
      method: 'GET',
      path: 'v1/shop/accountstatements.xml',
      query,
      responseType: 'text',
    });
  }

  getAccountStatementCamt053(query: MakeCommerceStatementQuery): Promise<string | undefined> {
    return this.httpClient.request({
      method: 'GET',
      path: 'v1/shop/accountstatements.camt053',
      query,
      responseType: 'text',
    });
  }

  getFees(query?: MakeCommerceFeesQuery): Promise<MakeCommerceFee[]> {
    return this.httpClient.request({ method: 'GET', path: 'v1/shop/fees', query });
  }
}
