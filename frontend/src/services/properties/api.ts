import { Axios } from '@/lib/axios';
import { PropertyApiKeys } from './keys';
import type { BaseResponse } from '../_types';
import type {
  AddRoomPayload,
  AddRoomResponse,
  CreatePropertyPayload,
  CreatePropertyResponse,
  MyPropertiesResponse,
  PropertyActivityResponse,
  PropertyDetailResponse,
  PropertyFilters,
  PropertyListResponse,
  PublishPropertyResponse,
  UpdatePropertyPayload,
  UpdatePropertyResponse,
  UploadMediaResponse,
} from './types';

const propertiesApi = {
  async list(params: PropertyFilters): Promise<PropertyListResponse> {
    return Axios.get(PropertyApiKeys.list, { params });
  },
  async detail(id: string): Promise<PropertyDetailResponse> {
    return Axios.get(PropertyApiKeys.detail(id));
  },
  async myProperties(): Promise<MyPropertiesResponse> {
    return Axios.get(PropertyApiKeys.myProperties);
  },
  async create(payload: CreatePropertyPayload): Promise<CreatePropertyResponse> {
    return Axios.post(PropertyApiKeys.create, payload);
  },
  async update(id: string, payload: UpdatePropertyPayload): Promise<UpdatePropertyResponse> {
    return Axios.put(PropertyApiKeys.update(id), payload);
  },
  async deleteProperty(id: string): Promise<BaseResponse> {
    return Axios.delete(PropertyApiKeys.delete(id));
  },
  async publish(id: string): Promise<PublishPropertyResponse> {
    return Axios.post(PropertyApiKeys.publish(id));
  },
  async addRoom(id: string, payload: AddRoomPayload): Promise<AddRoomResponse> {
    return Axios.post(PropertyApiKeys.addRoom(id), payload);
  },
  async uploadMedia(id: string, files: File[]): Promise<UploadMediaResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return Axios.post(PropertyApiKeys.uploadMedia(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  async deleteMedia(id: string, mediaId: string): Promise<BaseResponse> {
    return Axios.delete(PropertyApiKeys.deleteMedia(id, mediaId));
  },
  async setCoverMedia(id: string, mediaId: string): Promise<BaseResponse> {
    return Axios.put(PropertyApiKeys.setCoverMedia(id, mediaId));
  },
  async activity(id: string): Promise<PropertyActivityResponse> {
    return Axios.get(PropertyApiKeys.activity(id));
  },
};

export default propertiesApi;
