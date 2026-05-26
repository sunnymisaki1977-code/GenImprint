import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // 如果沒有設定環境變數 SITE_PASSWORD，則不啟用密碼保護
  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get('authorization');
  const url = req.nextUrl;

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // 帳號預設為 admin，密碼對比環境變數 SITE_PASSWORD
    if (user === 'admin' && pwd === sitePassword) {
      return NextResponse.next();
    }
  }

  // 驗證失敗或未提供帳號密碼，跳出輸入視窗
  url.pathname = '/api/auth'; // 這裡只是一個佔位，主要靠 header 觸發瀏覽器的密碼框
  return new NextResponse('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="Secure Area"`,
    },
  });
}

// 設定哪些路徑需要被保護（這裡設定為全站所有路徑）
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
