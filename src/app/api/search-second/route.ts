import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const webhookUrl = process.env.NEXT_PUBLIC_SECOND_N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { error: 'Second Webhook URL is not configured' },
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

    if (!response.ok) {
      // n8n에서 에러 응답이 왔을 때, 응답 본문을 텍스트로 우선 읽어봅니다.
      const errorText = await response.text();
      try {
        // 텍스트가 JSON 형식이면 파싱합니다.
        const errorData = JSON.parse(errorText);
        // n8n의 '결과 없음' 메시지인지 확인하고 정상 처리
        if (errorData && errorData.message === "No item to return got found") {
          return NextResponse.json([]);
        }
        // 그 외의 JSON 에러는 그대로 전달
        return NextResponse.json(errorData, { status: response.status });
      } catch (_e) {
        // JSON 파싱 실패 시, 텍스트로 받은 에러 내용을 그대로 반환합니다.
        return NextResponse.json({ error: 'n8n webhook returned non-JSON response', details: errorText }, { status: response.status });
      }
    }

    // 응답이 성공적인 경우
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
