import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import Message from '../models/Message.js';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';
// Import SMPP client function later when we implement smpp bindings
// import { sendSmppMessage } from '../smpp/client.js';

export const smsQueue = new Queue('sms-dispatch', { connection: redisConnection });

// Worker that processes the queue
const worker = new Worker('sms-dispatch', async (job) => {
  const { messageId, to, text, senderId, campaignId, userId } = job.data;
  
  try {
    // 1. Mock SMPP Dispatch (To be replaced with real SMPP bind)
    console.log(`[Queue] Dispatching SMS to ${to} from ${senderId}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50)); 
    
    // 2. Update Message status to 'delivered' (or 'submitted' depending on DLR)
    await Message.findByIdAndUpdate(messageId, {
      status: 'delivered',
      providerMessageId: `smpp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dlrReceivedAt: new Date()
    });

    // 3. Increment campaign delivered count if it belongs to a campaign
    if (campaignId) {
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: { deliveredCount: 1 }
      });
    }

  } catch (error) {
    console.error(`[Queue] Failed to dispatch message ${messageId}:`, error);
    
    // Update status to failed
    await Message.findByIdAndUpdate(messageId, {
      status: 'failed',
      errorMessage: error.message
    });

    if (campaignId) {
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: { failedCount: 1 }
      });
    }
  }
}, { 
  connection: redisConnection,
  concurrency: 50 // Process 50 messages concurrently
});

worker.on('completed', job => {
  // console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with ${err.message}`);
});
