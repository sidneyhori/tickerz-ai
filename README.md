# Tickerz AI

A real-time news and stock market analysis platform powered by AI.

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tickerz-ai.git
cd tickerz-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Then edit `.env.local` with your configuration values.

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

The following environment variables are required in `.env.local`:

- `MONGODB_URI`: Your MongoDB connection string
- `REDIS_HOST`: Redis host (default: localhost)
- `REDIS_PORT`: Redis port (default: 6379)
- `REDIS_PASSWORD`: Redis password
- `NEXTAUTH_URL`: NextAuth.js URL (default: http://localhost:3000)
- `NEXTAUTH_SECRET`: NextAuth.js secret
- `OPENAI_API_KEY`: Your OpenAI API key
- `ALPHA_VANTAGE_API_KEY`: Your Alpha Vantage API key

Optional OAuth provider variables:
- `GITHUB_ID`: GitHub OAuth client ID
- `GITHUB_SECRET`: GitHub OAuth client secret
- `GOOGLE_ID`: Google OAuth client ID
- `GOOGLE_SECRET`: Google OAuth client secret

## Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application
- `npm run start`: Start the production server
- `npm run start:workers`: Start the RSS feed processing workers
- `npm run test`: Run tests
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## Features

- Real-time stock market data
- AI-powered news analysis
- RSS feed aggregation
- Content summarization
- Sentiment analysis
- User authentication
- Customizable news feeds

## Architecture

- Next.js for the frontend and API routes
- MongoDB for data storage
- Redis for caching and job queues
- Bull for job processing
- OpenAI for content analysis
- Alpha Vantage for stock market data
- NextAuth.js for authentication

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
