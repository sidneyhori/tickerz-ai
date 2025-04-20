import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAIService {
  private static instance: OpenAIService;

  private constructor() {}

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  public async summarizeContent(content: string): Promise<{
    summary: string;
    keyPoints: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
  }> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that summarizes content. Provide a concise summary, 3-5 key points, and the overall sentiment (positive, negative, or neutral)."
          },
          {
            role: "user",
            content: `Please summarize the following content and provide key points and sentiment analysis:\n\n${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse the response to extract summary, key points, and sentiment
      const lines = response.split('\n');
      const summary = lines[0];
      const keyPoints = lines
        .slice(1)
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.trim().substring(1).trim());
      
      const sentimentLine = lines.find(line => 
        line.toLowerCase().includes('sentiment:') || 
        line.toLowerCase().includes('overall sentiment:')
      );
      
      const sentiment = sentimentLine 
        ? (sentimentLine.toLowerCase().includes('positive') ? 'positive' :
           sentimentLine.toLowerCase().includes('negative') ? 'negative' : 'neutral')
        : 'neutral';

      return {
        summary,
        keyPoints,
        sentiment
      };
    } catch (error) {
      console.error('Error in OpenAI summarization:', error);
      throw error;
    }
  }
} 