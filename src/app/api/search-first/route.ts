import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { error: 'Webhook URL is not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // n8n의 '결과 없음' 메시지인지 확인하고 정상 처리
      if (data && data.message === "No item to return got found") {
        return NextResponse.json([]);
      }
      // 그 외의 에러는 그대로 전달
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
