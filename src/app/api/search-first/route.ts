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
        // UTF-8 명시로 한글이 물음표(????)로 깨지는 문제 방지
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
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

    // n8n이 에러를 value 배열 안에 담아 200으로 반환하는 케이스 방어
    // 형태: { value: [ { message: string, error: {...} } ], Count: number }
    if (data && typeof data === 'object' && Array.isArray((data as any).value)) {
      const value = (data as any).value;
      if (value.length > 0) {
        const first = value[0];
        if (first && typeof first === 'object' && 'message' in first && 'error' in first) {
          // 에러 메시지 추출하여 502로 전달
          const msg = String((first as any).message || 'Upstream error');
          return NextResponse.json({ error: msg }, { status: 502 });
        }
      }
      // value가 정상 데이터면 언래핑하여 반환
      return NextResponse.json(value);
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
