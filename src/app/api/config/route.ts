import { NextResponse } from 'next/server';
import { AUDIENCE_THEMES, THEME_STEPS } from '@/utils/themeConfig';

export async function GET() {
  return NextResponse.json({
    AUDIENCE_THEMES,
    THEME_STEPS
  });
}
