import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

console.log('Initializing OpenAI client...');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
console.log('OpenAI client initialized');

export class OpenAIService {
  private static instance: OpenAIService;

  private constructor() {
    console.log('Creating new OpenAIService instance');
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      console.log('Creating new OpenAIService singleton instance');
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
      console.log('Sending request to OpenAI API...');
      console.log('Content length:', content.length);
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that summarizes content. Return a concise summary (not just the word 'Summary:'), 3-5 key points, and the overall sentiment (positive, negative, or neutral). Return the response in JSON format with the following structure: { summary: string, keyPoints: string[], sentiment: 'positive' | 'negative' | 'neutral' }. The summary must be a real, meaningful summary of the content.`
          },
          {
            role: "user",
            content: `Please summarize the following content and provide key points and sentiment analysis:\n\n${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });
      console.log('Received response from OpenAI API');

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      console.log('OpenAI Response:', response);

      try {
        const parsedResponse = JSON.parse(response);
        // Check for valid, non-placeholder summary
        if (!parsedResponse.summary || parsedResponse.summary.trim().toLowerCase() === 'summary:') {
          console.error('OpenAI returned an empty or placeholder summary:', parsedResponse.summary);
          throw new Error('OpenAI returned an empty or placeholder summary');
        }
        console.log('Successfully parsed OpenAI response:', {
          summary: parsedResponse.summary,
          keyPoints: parsedResponse.keyPoints,
          sentiment: parsedResponse.sentiment,
          summaryLength: parsedResponse.summary.length,
          keyPointsCount: parsedResponse.keyPoints.length
        });

        return {
          summary: parsedResponse.summary,
          keyPoints: parsedResponse.keyPoints,
          sentiment: parsedResponse.sentiment
        };
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        throw new Error('Failed to parse OpenAI response as JSON');
      }
    } catch (error) {
      console.error('Error in OpenAI summarization:', error);
      throw error;
    }
  }
} 