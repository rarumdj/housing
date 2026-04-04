import { Axios } from '@/lib/axios';
import { PropertyApiKeys } from './keys';
import type {
  AddRoomPayload,
  AddRoomResponse,
  CreatePropertyPayload,
  CreatePropertyResponse,
  MyPropertiesResponse,
  PropertyDetailResponse,
  PropertyFilters,
  PropertyListResponse,
  PublishPropertyResponse,
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
  async publish(id: string): Promise<PublishPropertyResponse> {
    return Axios.post(PropertyApiKeys.publish(id));
  },
  async addRoom(id: string, payload: AddRoomPayload): Promise<AddRoomResponse> {
    return Axios.post(PropertyApiKeys.addRoom(id), payload);
  },
};

export default propertiesApi;
