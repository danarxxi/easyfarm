import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  const { stats, plants, alerts } = await req.json()

  const warningPlants = plants.filter((p: { status: string }) => p.status === 'warning')
  const dangerPlants = plants.filter((p: { status: string }) => p.status === 'danger')
  const unresolvedAlerts = alerts.filter((a: { resolved: boolean }) => !a.resolved)

  const prompt = `
당신은 식물 운영 관리 시스템의 AI 분석가입니다. 아래 현황 데이터를 바탕으로 운영 요약 리포트를 작성해주세요.

[전체 현황]
- 전체 식물: ${stats.total}개
- 정상: ${stats.normal}개 / 주의: ${stats.warning}개 / 위험: ${stats.danger}개
- 오늘 자동 급수 횟수: ${stats.todayWateringCount}회
- 현재 LED 가동 중: ${stats.activeLedCount}개

[주의 식물 목록]
${warningPlants.length > 0 ? warningPlants.map((p: { name: string; currentSensor: { temperature: number; soilMoisture: number; humidity: number }; targetHumidity: number }) =>
  `- ${p.name}: 온도 ${p.currentSensor.temperature}°C, 토양수분 ${p.currentSensor.soilMoisture}% (목표: ${p.targetHumidity}%)`
).join('\n') : '없음'}

[위험 식물 목록]
${dangerPlants.length > 0 ? dangerPlants.map((p: { name: string; currentSensor: { temperature: number; soilMoisture: number; humidity: number }; targetHumidity: number }) =>
  `- ${p.name}: 온도 ${p.currentSensor.temperature}°C, 토양수분 ${p.currentSensor.soilMoisture}% (목표: ${p.targetHumidity}%)`
).join('\n') : '없음'}

[미해결 알림 ${unresolvedAlerts.length}건]
${unresolvedAlerts.length > 0 ? unresolvedAlerts.map((a: { plantName: string; message: string }) =>
  `- ${a.plantName}: ${a.message}`
).join('\n') : '없음'}

아래 규칙에 맞게 답변해주세요:
- 친근하고 따뜻한 말투로 작성해주세요 (예: "~해요", "~네요")
- ##, **, __ 같은 마크다운 기호는 절대 사용하지 마세요
- 이모지를 자연스럽게 섞어서 읽기 편하게 작성해주세요
- 전체 운영 상태 요약 → 즉시 조치 필요 항목 → 오늘의 특이사항 순서로 작성해주세요
- 5~7문장 이내로 작성해주세요
- 가독성을 위해 적절히 줄바꿈을 넣어주세요
`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const report = result.response.text()

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json({ error: 'AI 리포트 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
