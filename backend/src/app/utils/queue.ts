import { env } from './env';

let queueInstance: { add: (name: string, payload: Record<string, unknown>) => Promise<unknown> } | null = null;

async function getQueue() {
  if (!env.redis.url) return null;
  if (queueInstance) return queueInstance;

  try {
    const [{ Queue }, { default: Redis }] = await Promise.all([import('bullmq'), import('ioredis')]);
    const connection = new Redis(env.redis.url, { maxRetriesPerRequest: null });
    queueInstance = new Queue('video-processing', { connection });
    return queueInstance;
  } catch (error) {
    console.warn('[Queue] Redis/BullMQ unavailable. Continuing without background jobs.', error);
    return null;
  }
}

export async function addVideoProcessingJob(payload: Record<string, unknown>) {
  const queue = await getQueue();
  if (!queue) return false;
  await queue.add('process-video', payload);
  return true;
}
