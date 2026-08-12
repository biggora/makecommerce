import type { HttpClient } from '../core/http-client.js';
import type {
  MakeCommerceCreateRefundRequest,
  MakeCommerceRefund,
  MakeCommerceRefundListQuery,
} from '../core/types.js';

export class RefundsResource {
  constructor(private readonly httpClient: HttpClient) {}

  create(transactionId: string, body: MakeCommerceCreateRefundRequest): Promise<MakeCommerceRefund> {
    return this.httpClient.request({
      method: 'POST',
      path: `v1/transactions/${encodeURIComponent(transactionId)}/refunds`,
      body,
    });
  }

  get(refundId: string): Promise<MakeCommerceRefund> {
    return this.httpClient.request({ method: 'GET', path: `v1/refunds/${encodeURIComponent(refundId)}` });
  }

  list(query?: MakeCommerceRefundListQuery): Promise<MakeCommerceRefund[]> {
    return this.httpClient.request({ method: 'GET', path: 'v1/refunds', query });
  }
}
