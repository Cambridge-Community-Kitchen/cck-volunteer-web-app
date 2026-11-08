import { Ratelimit }        from '@upstash/ratelimit';
import { Redis }            from '@upstash/redis';
import { NextResponse }     from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserContext }   from '@/components/api-helpers';

type RouteMatcher = {
  path?: RegExp;
  methods?: Request["method"][];
}

const requestMatches = (
  request: NextRequest,
  { path, methods }: RouteMatcher
): boolean => {
  if (path && !path.test(request.nextUrl.pathname)) {
    return false;
  }

  if (methods && !methods.includes(request.method)){
    return false;
  }

  return true;
}

/**
 *
 */
export async function middleware(request: NextRequest) {
  const rateLimited = [
    { path: /^\/api\/auth\/totp\/request/ },
    { path: /^\/api\/auth\/register/ },
  ];

  if (
    process.env.UPSTASH_REDIS_REST_URL && rateLimited.some(
      matcher => requestMatches(request, matcher)
    )
  ) {
    // You can only request a totp up to 25 times a day from a single IP address.
    const ratelimit = new Ratelimit({
      redis   : Redis.fromEnv(),
      limiter : Ratelimit.slidingWindow(25, '1 d'),
    });

    const identifier  = request.headers.get('X-Forwarded-for') || '127.0.0.1';
    const { success } = await ratelimit.limit(identifier);

    if (!success) {
      return NextResponse.rewrite(new URL('/api/auth/unauthorized', request.url));
    }
  }

  const allowedWithoutAuth = [
    { path: /^\/log(in|out)$/ },
    { path: /^\/register$/ },
    { path: /^\/route$/ },
    { path: /^\/_next\// },
    { path: /\.(png|ico|json)$/ },
    { path: /^\/api\/auth\// },
    { path: /^\/api\/cck\/route/ },
    { path: /^\/api\/cck\/event/, methods: ['GET', 'OPTIONS', 'HEAD'] },
    { path: /^\/event/, methods: ['GET', 'OPTIONS', 'HEAD'] },
  ];

  const isAuthRequired = !allowedWithoutAuth.some(
    matcher => requestMatches(request, matcher)
  );

  if (isAuthRequired) {
    try {
      await getUserContext(request);

      return NextResponse.next();
    } catch (_err) {
      if (requestMatches(request, { path: /^\/api/ })) {
        return NextResponse.rewrite(new URL('/api/auth/unauthorized', request.url));
      }

      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (requestMatches(request, { path: /^\/api/ })) {
    if (request.method === 'POST') {
      const contentType = request.headers.get('content-type');

      if (!contentType || contentType.indexOf('application/json') == -1) {
        console.log('TODO: Return 400 due to lack of JSON');
      }
    }
  }
}
