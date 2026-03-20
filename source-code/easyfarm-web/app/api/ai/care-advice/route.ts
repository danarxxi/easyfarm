import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  const { plant } = await req.json()

  const prompt = `
당신은 식물 관리 전문가입니다. 아래 식물의 현재 센서 데이터를 분석하고 지금 당장 필요한 케어 액션을 알려주세요.

[식물 정보]
- 이름: ${plant.name}
- 종류: ${plant.species}
- 위치: ${plant.location}

[현재 센서 데이터]
- 온도: ${plant.currentSensor.temperature}°C
- 습도: ${plant.currentSensor.humidity}%
- 토양 수분: ${plant.currentSensor.soilMoisture}%
- 목표 토양 수분: ${plant.targetHumidity}%
- LED 상태: ${plant.currentSensor.ledState ? 'ON (켜짐)' : 'OFF (꺼짐)'}
- 현재 상태: ${plant.status === 'normal' ? '정상' : plant.status === 'warning' ? '주의' : '위험'}

아래 규칙에 맞게 답변해주세요:
- 친근하고 따뜻한 말투로 작성해주세요 (예: "~해요", "~네요")
- ##, **, __ 같은 마크다운 기호는 절대 사용하지 마세요
- 이모지를 자연스럽게 섞어서 읽기 편하게 작성해주세요
- 전체 상태 요약 → 지금 당장 해야 할 조치 → 주의사항 순서로 작성해주세요
- 3~5문장 이내로 간결하게 작성해주세요
- 가독성을 위해 적절히 줄바꿈을 넣어주세요
`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const advice = result.response.text()

    return NextResponse.json({ advice })
  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json({ error: 'AI 분석 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
