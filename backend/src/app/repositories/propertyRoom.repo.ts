import { PropertyRoom } from '../models';

const PropertyRoomRepo = {
  create: async (data: Record<string, unknown>) => PropertyRoom.create(data),
};

export default PropertyRoomRepo;
