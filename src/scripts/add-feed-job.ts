import { QueueManager } from '@/lib/queue/queue-manager';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function addFeedJob() {
  try {
    const queueManager = QueueManager.getInstance();
    
    // Add a job to process the TechCrunch feed
    const job = await queueManager.addFeedFetchJob(
      '68043ec31f8d03a8d5b9d5e0',
      'https://techcrunch.com/feed/'
    );
    
    console.log('Added feed job:', job.id);
  } catch (error) {
    console.error('Error:', error);
  }
}

addFeedJob(); 