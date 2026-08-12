export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | JsonRecord;
export type JsonRecord = { [key: string]: JsonValue | undefined };

export type QueryPrimitive = string | number | boolean;
export type QueryValue = QueryPrimitive | QueryPrimitive[] | null | undefined;
export type QueryRecord = Record<string, QueryValue>;

export type MakeCommerceEnvironment = 'test' | 'live';

export type MakeCommerceHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type MakeCommerceUrlConfig = {
  url?: string;
  method?: string;
};

export type MakeCommercePaymentMethod = JsonRecord & {
  name?: string;
  url?: string;
  country?: string;
  countries?: string[];
  min_amount?: number;
  max_amount?: number;
  channel?: string;
  display_name?: string;
  logo_url?: string;
};

export type MakeCommercePaymentMethods = JsonRecord & {
  banklinks?: MakeCommercePaymentMethod[];
  cards?: MakeCommercePaymentMethod[];
  payLater?: MakeCommercePaymentMethod[];
  paylater?: MakeCommercePaymentMethod[];
  other?: MakeCommercePaymentMethod[];
};

export type MakeCommerceCustomer = JsonRecord & {
  id?: string;
  object?: string;
  created_at?: string;
  email?: string;
  locale?: string;
  country?: string;
  ip?: string;
  ip_country?: string;
  name?: string;
};

export type MakeCommerceTransactionUrls = JsonRecord & {
  return_url?: MakeCommerceUrlConfig;
  cancel_url?: MakeCommerceUrlConfig;
  notification_url?: MakeCommerceUrlConfig;
  cart_url?: MakeCommerceUrlConfig;
};

export type MakeCommerceAppInfo = JsonRecord & {
  module?: string;
  module_version?: string;
  platform?: string;
  platform_version?: string;
};

export type MakeCommerceCreateTransactionRequest = JsonRecord & {
  transaction: JsonRecord & {
    amount: string;
    currency: string;
    reference?: string;
    merchant_data?: string;
    recurring_required?: string | boolean;
    transaction_url?: MakeCommerceTransactionUrls;
  };
  customer: JsonRecord & {
    ip: string;
    email?: string;
    country?: string;
    locale?: string;
    name?: string;
  };
  app_info?: MakeCommerceAppInfo;
};

export type MakeCommerceTransaction = JsonRecord & {
  id: string;
  object?: string;
  created_at?: string;
  completed_at?: string;
  refunded_at?: string;
  status?: string;
  reference?: string;
  customer?: MakeCommerceCustomer;
  refunded_amount?: number;
  refunded_original_amount?: number;
  type?: string;
  method?: string;
  channel?: string;
  country?: string;
  fees?: number;
  fees_vat?: number;
  net_amount?: number;
  merchant_data?: string;
  transaction_url?: MakeCommerceTransactionUrls;
  recurring_required?: boolean;
  payment_methods?: MakeCommercePaymentMethods;
};

export type MakeCommerceTransactionListQuery = QueryRecord & {
  since?: string;
  until?: string;
  completed_since?: string;
  comleted_until?: string;
  refunded_since?: string;
  redunded_until?: string;
  status?: string | string[];
  page?: number;
  per_page?: number;
};

export type MakeCommercePaymentMethodsQuery = QueryRecord & {
  transaction?: string;
  amount?: string;
  currency?: string;
  country?: string;
};

export type MakeCommerceStatementQuery = QueryRecord & {
  since?: string;
  until?: string;
  payout_id?: string;
  page?: number;
  per_page?: number;
};

export type MakeCommerceFeesQuery = QueryRecord & {
  since?: string;
  until?: string;
  page?: string | number;
  per_page?: string | number;
};

export type MakeCommerceStatementRow = JsonRecord & {
  created?: string;
  amount?: number;
  balance_before?: number;
  balance_after?: number;
  type?: string;
  transaction?: string;
  transaction_id?: string;
  channel?: string;
  merchant_reference?: string;
  payout_id?: string;
  original_amount?: number;
  original_currency?: string;
  exchange_rate?: number;
};

export type MakeCommerceFee = JsonRecord & {
  accounting_id?: string;
  object?: string;
  created_at?: string;
  amount?: number;
  vat?: number;
};

export type MakeCommerceShopConfiguration = JsonRecord & {
  id?: string;
  object?: string;
  created_at?: string;
  modified_at?: string;
  name?: string;
  status?: string;
  return?: MakeCommerceUrlConfig;
  notifications?: JsonRecord & {
    email?: string;
    url?: string;
    method?: string;
  };
  contact?: JsonRecord & {
    email?: string;
    phone?: string;
  };
  payment_methods?: MakeCommercePaymentMethods;
  features?: Array<JsonRecord & {
    object?: string;
    name?: string;
    enabled?: boolean;
  }>;
};

export type MakeCommerceAddMerchantDataRequest = JsonRecord & {
  merchant_data: string;
};

export type MakeCommerceCreatePaymentRequest = JsonRecord & {
  token: string;
};

export type MakeCommercePayment = JsonRecord & {
  id?: string;
  object?: string;
  amount?: number;
  currency?: string;
  status?: string;
  created_at?: string;
  card?: JsonRecord;
  transaction?: MakeCommerceTransaction;
};

export type MakeCommerceCreateRefundRequest = JsonRecord & {
  amount?: string | number;
  comment?: string;
};

export type MakeCommerceRefund = JsonRecord & {
  id?: string;
  object?: string;
  created_at?: string;
  status?: string;
  comment?: string;
  transaction?: MakeCommerceTransaction;
};

export type MakeCommerceRefundListQuery = QueryRecord & {
  since?: string;
  until?: string;
  status?: string | string[];
  page?: number;
  per_page?: number;
};
