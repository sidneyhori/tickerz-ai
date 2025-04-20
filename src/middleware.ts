import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  // If the user is not logged in, redirect to the sign-in page
  if (!token && request.nextUrl.pathname.startsWith('/feeds')) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/feeds/:path*', '/api/feeds/:path*']
} 