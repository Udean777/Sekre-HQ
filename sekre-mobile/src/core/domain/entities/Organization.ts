// Branded types untuk type safety
export type OrgId = string & { __brand: 'OrgId' };
export type SubscriptionPlan = 'FREE' | 'LITE' | 'PRO';

export interface Organization {
  id: OrgId;
  name: string;
  subdomain: string;
  subscriptionPlan: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
}
