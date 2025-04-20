import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        // For demo purposes, we'll accept any email
        if (credentials?.email) {
          return {
            id: credentials.email,
            email: credentials.email,
          }
        }
        return null
      }
    })
  ],
  callbacks: {
    async session({ session }) {
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
} 