import type { HttpClient } from '../core/http-client.js';
import type {
  MakeCommerceAddMerchantDataRequest,
  MakeCommerceCreatePaymentRequest,
  MakeCommerceCreateTransactionRequest,
  MakeCommercePayment,
  MakeCommerceStatementRow,
  MakeCommerceTransaction,
  MakeCommerceTransactionListQuery,
} from '../core/types.js';

export class TransactionsResource {
  constructor(private readonly httpClient: HttpClient) {}

  create(body: MakeCommerceCreateTransactionRequest): Promise<MakeCommerceTransaction> {
    return this.httpClient.request({ method: 'POST', path: 'v1/transactions', body });
  }

  list(query?: MakeCommerceTransactionListQuery): Promise<MakeCommerceTransaction[]> {
    return this.httpClient.request({ method: 'GET', path: 'v1/transactions', query });
  }

  get(transactionId: string): Promise<MakeCommerceTransaction> {
    return this.httpClient.request({ method: 'GET', path: `v1/transactions/${encodeURIComponent(transactionId)}` });
  }

  getStatement(transactionId: string): Promise<MakeCommerceStatementRow[]> {
    return this.httpClient.request({
      method: 'GET',
      path: `v1/transactions/${encodeURIComponent(transactionId)}/statement`,
    });
  }

  addMerchantData(
    transactionId: string,
    body: MakeCommerceAddMerchantDataRequest,
  ): Promise<MakeCommerceTransaction> {
    return this.httpClient.request({
      method: 'POST',
      path: `v1/transactions/${encodeURIComponent(transactionId)}/addMeta`,
      body,
    });
  }

  createPayment(transactionId: string, body: MakeCommerceCreatePaymentRequest): Promise<MakeCommercePayment> {
    return this.httpClient.request({
      method: 'POST',
      path: `v1/transactions/${encodeURIComponent(transactionId)}/payments`,
      body,
    });
  }
}
