# Tickerz AI

A Next.js application with MongoDB, Redis, and NextAuth.js integration.

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- MongoDB with Mongoose
- Redis for caching
- NextAuth.js for authentication
- TailwindCSS for styling
- Railway for deployment

## Prerequisites

- Node.js 18+ and npm
- MongoDB instance
- Redis instance
- GitHub OAuth credentials (optional)

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
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

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

- `MONGODB_URI`: Your MongoDB connection string
- `REDIS_URL`: Your Redis connection string
- `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET`: A random string for session encryption
- `GITHUB_ID`: GitHub OAuth App ID (optional)
- `GITHUB_SECRET`: GitHub OAuth App Secret (optional)

## Deployment

This project is configured for deployment on Railway. To deploy:

1. Create a new project on Railway
2. Connect your GitHub repository
3. Add the required environment variables
4. Deploy!

## Features

- User authentication with email/password and GitHub
- MongoDB integration for data persistence
- Redis for caching and job processing
- Modern UI with TailwindCSS
- Type-safe development with TypeScript

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check
