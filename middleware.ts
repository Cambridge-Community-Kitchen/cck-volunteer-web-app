import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserContext } from '@/components/api-helpers';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export async function middleware(request: NextRequest) {

  const rateLimited = [
    /^\/api\/auth\/totp\/request/,
    /^\/api\/auth\/register/
  ];
  
  if(rateLimited.some(rx => rx.test(request.nextUrl.pathname)) && process.env.UPSTASH_REDIS_REST_URL) {

    // You can only request a totp up to 25 times a day from a single IP address.
    const ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(25, "1 d"),
    });

    const identifier = request.ip ? request.ip : "127.0.0.1"
    const { success } = await ratelimit.limit(identifier);
    if (!success) {
      return NextResponse.rewrite(new URL('/api/auth/unauthorized', request.url));
    }
  }

  const allowedWithoutAuth = [
    /^\/log(in|out)$/,
    /^\/register$/,
    /^\/route$/,
    /^\/_next\//,
    /\.(png|ico|json)$/,
    /^\/api\/auth\//,
    /^\/api\/cck\/route/
  ];

  const isAuthRequired = !allowedWithoutAuth.some(rx => rx.test(request.nextUrl.pathname));
  if (isAuthRequired) {
    try {
      await getUserContext(request);
      return NextResponse.next();
    } catch (err) {
      if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.rewrite(new URL('/api/auth/unauthorized', request.url))
      } else {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  if (request.nextUrl.pathname.startsWith('/api')) {
  	
    if (request.method == 'POST') {
      let contentType = request.headers.get('content-type')

      if (!contentType || contentType.indexOf("application/json") == -1) {
        console.log('TODO: Return 400 due to lack of JSON');
      }
    }
  }
}