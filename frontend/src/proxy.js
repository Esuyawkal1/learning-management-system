import { NextResponse } from 'next/server';

export function proxy(request) {
  if (
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/instructor') ||
    request.nextUrl.pathname.startsWith('/student')
  ) {
    const token = request.cookies.get('token')?.value 
      || request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/instructor/:path*', '/student/:path*'],
};

