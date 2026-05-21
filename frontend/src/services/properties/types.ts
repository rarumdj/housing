import type { PropertyActivity, PropertyDetail, PropertyMedia, PropertySearchFilters, PropertySearchMeta, PropertySummary } from '@/types/domain';
import type { BaseResponse } from '../_types';

export interface PropertyListResponse {
  success: boolean;
  properties: PropertySummary[];
  meta: PropertySearchMeta;
}

export type PropertyDetailResponse = BaseResponse<PropertyDetail>;

export type MyPropertiesResponse = BaseResponse<PropertySummary[]>;

export type CreatePropertyPayload = Record<string, unknown>;
export type CreatePropertyResponse = BaseResponse<PropertyDetail>;

export type UpdatePropertyPayload = Record<string, unknown>;
export type UpdatePropertyResponse = BaseResponse<PropertyDetail>;

export type PublishPropertyResponse = BaseResponse<PropertyDetail>;

export type AddRoomPayload = Record<string, unknown>;
export type AddRoomResponse = BaseResponse<Record<string, unknown>>;

export type UploadMediaResponse = BaseResponse<PropertyMedia[]>;
export type PropertyActivityResponse = BaseResponse<PropertyActivity>;

export type PropertyFilters = PropertySearchFilters;
