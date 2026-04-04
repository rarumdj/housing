import { VideoSession } from '../models';

const VideoSessionRepo = {
  create: async (data: Record<string, unknown>) => VideoSession.create(data),

  getByNonce: async (nonce: string) => VideoSession.findOne({ where: { nonce } }),

  updateByNonce: async (nonce: string, data: Record<string, unknown>) => {
    await VideoSession.update(data, { where: { nonce } });
    return VideoSession.findOne({ where: { nonce } });
  },
};

export default VideoSessionRepo;
