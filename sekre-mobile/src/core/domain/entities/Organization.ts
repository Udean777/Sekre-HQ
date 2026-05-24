import type { OrganizationId } from '@core/domain/ids';

export type OrgId = OrganizationId;
export type { OrganizationId };
export type SubscriptionPlan = 'FREE' | 'LITE' | 'PRO';

export interface Organization {
  id: OrgId;
  name: string;
  subdomain: string;
  subscriptionPlan: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
}
