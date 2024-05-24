export type PaystackPlan = {
  name: string;
  amount: number;
  interval: string;
  integration: number;
  domain: string;
  plan_code: string;
  description: unknown;
  send_invoices: boolean;
  send_sms: boolean;
  hosted_page: boolean;
  hosted_page_url: unknown;
  hosted_page_summary: unknown;
  currency: string;
  migrate: boolean;
  is_archived: boolean;
  id: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Customer = {
  id: number;
  subscriptions: Subscription[];
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  metadata?: Record<string, unknown>;
  domain: string;
  customer_code: string;
  risk_action: string;
  international_format_phone?: string;
  integration: number;
  createdAt: Date;
  updatedAt: Date;
  identified: boolean;
};

export type Subscription = {
  invoices: unknown[];
  customer: Customer;
  plan: PaystackPlan;
  integration: number;
  domain: string;
  start: number;
  status: string;
  quantity: number;
  amount: number;
  subscription_code: string;
  email_token: string;
  easy_cron_id: string;
  cron_expression: string;
  next_payment_date: Date;
  open_invoice: string;
  id: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductData = {
  productId?: string;
  name: string;
  price: number;
  handle: string;
  description: string;
  categoryId: string;
  isFeatured: boolean;
  isArchived: boolean;
  storeId: string;
  images: { url: string }[];
  variants: { title: string; price: number; inventory: number }[];
  options: { optionName: string; optionValues: { name: string }[] }[];
};
