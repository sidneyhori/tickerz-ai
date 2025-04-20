import { QueueManager } from '@/lib/queue/queue-manager';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function addFeedJob() {
  try {
    const queueManager = QueueManager.getInstance();
    
    // Add a job to process the TechCrunch feed
    const job = await queueManager.addFeedFetchJob(
      '68054223df62b90069f467f7',
      'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml'
    );
    
    console.log('Added feed job:', job.id);
  } catch (error) {
    console.error('Error:', error);
  }
}

addFeedJob(); 