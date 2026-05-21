import { Axios } from '@/lib/axios';
import type { BaseResponse } from '../_types';
import type { AdminUser, AdminUserListMeta, AdminOverview, MonthlyRevenue, PlatformFee, PropertySummary } from '@/types/domain';

const AdminApiKeys = {
  users: '/admin/users',
  userDetail: (id: string) => `/admin/users/${id}`,
  verifyUser: (id: string) => `/admin/users/${id}/verify`,
  toggleActive: (id: string) => `/admin/users/${id}/toggle-active`,
  properties: '/admin/properties',
  verifyProperty: (id: string) => `/admin/properties/${id}/verify`,
  deleteProperty: (id: string) => `/admin/properties/${id}`,
  fees: '/admin/fees',
  fee: (id: string) => `/admin/fees/${id}`,
  overview: '/admin/analytics/overview',
  revenue: '/admin/analytics/revenue',
  landlordAnalytics: '/admin/analytics/landlords',
  tenantAnalytics: '/admin/analytics/tenants',
} as const;

export const AdminQueryKeys = {
  users: 'admin-users',
  userDetail: 'admin-user-detail',
  properties: 'admin-properties',
  fees: 'admin-fees',
  overview: 'admin-overview',
  revenue: 'admin-revenue',
  landlordAnalytics: 'admin-landlord-analytics',
  tenantAnalytics: 'admin-tenant-analytics',
} as const;

interface AdminUserListResponse {
  success: boolean;
  users: AdminUser[];
  meta: AdminUserListMeta;
}

interface AdminPropertyListResponse {
  success: boolean;
  properties: PropertySummary[];
  meta: AdminUserListMeta;
}

const adminApi = {
  // Users
  async listUsers(params?: Record<string, unknown>): Promise<AdminUserListResponse> {
    return Axios.get(AdminApiKeys.users, { params });
  },
  async getUserDetail(id: string): Promise<BaseResponse<AdminUser>> {
    return Axios.get(AdminApiKeys.userDetail(id));
  },
  async verifyUser(id: string, payload: { status: string; reason?: string }): Promise<BaseResponse> {
    return Axios.put(AdminApiKeys.verifyUser(id), payload);
  },
  async toggleActive(id: string): Promise<BaseResponse> {
    return Axios.put(AdminApiKeys.toggleActive(id));
  },

  // Properties
  async listProperties(params?: Record<string, unknown>): Promise<AdminPropertyListResponse> {
    return Axios.get(AdminApiKeys.properties, { params });
  },
  async verifyProperty(id: string, payload: { verificationStatus: string; reason?: string }): Promise<BaseResponse> {
    return Axios.put(AdminApiKeys.verifyProperty(id), payload);
  },
  async deleteProperty(id: string): Promise<BaseResponse> {
    return Axios.delete(AdminApiKeys.deleteProperty(id));
  },

  // Fees
  async listFees(): Promise<BaseResponse<PlatformFee[]>> {
    return Axios.get(AdminApiKeys.fees);
  },
  async createFee(payload: Partial<PlatformFee>): Promise<BaseResponse<PlatformFee>> {
    return Axios.post(AdminApiKeys.fees, payload);
  },
  async updateFee(id: string, payload: Partial<PlatformFee>): Promise<BaseResponse<PlatformFee>> {
    return Axios.put(AdminApiKeys.fee(id), payload);
  },
  async deleteFee(id: string): Promise<BaseResponse> {
    return Axios.delete(AdminApiKeys.fee(id));
  },

  // Analytics
  async getOverview(): Promise<BaseResponse<AdminOverview>> {
    return Axios.get(AdminApiKeys.overview);
  },
  async getRevenue(): Promise<BaseResponse<MonthlyRevenue[]>> {
    return Axios.get(AdminApiKeys.revenue);
  },
  async getLandlordAnalytics(): Promise<BaseResponse<unknown[]>> {
    return Axios.get(AdminApiKeys.landlordAnalytics);
  },
  async getTenantAnalytics(): Promise<BaseResponse<unknown[]>> {
    return Axios.get(AdminApiKeys.tenantAnalytics);
  },
};

export default adminApi;
