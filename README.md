# EasyFarm (이지팜)

![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF?style=flat&logo=kotlin&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=flat&logo=android&logoColor=white)
![Arduino](https://img.shields.io/badge/Arduino-00979D?style=flat&logo=arduino&logoColor=white)
![Bluetooth](https://img.shields.io/badge/Bluetooth-0082FC?style=flat&logo=bluetooth&logoColor=white)

> IoT 기반 스마트 식물 관리 시스템

---

## 프로젝트 소개

EasyFarm은 Arduino 센서 모듈과 Android 모바일 앱을 연동하여 **실시간으로 식물의 상태를 모니터링**하고 **자동으로 관개 및 조명을 제어**하는 IoT 기반 스마트 화분 시스템입니다.

### 주요 특징
- 온습도, 조도, 토양 수분도 실시간 모니터링
- 설정값 기반 자동 급수 시스템
- Bluetooth를 통한 모바일 원격 제어
- 물 부족 시 WiFi 푸시 알림

---

## 팀 소개

| 이름 | 역할 | 담당 업무 |
|:----:|:----:|:----------|
| 나동재 | 팀장 | 프로젝트 일정 조정 및 관리 |
| 전성훈 | 팀원 | 회로 설계 및 테스트 |
| 김다은 | 팀원 | Android 앱 개발, 프로젝트 최종 발표 |
| 김단이 | 팀원 | Arduino 하드웨어 개발 |
| 류윤성 | 팀원 | 회로 설계 및 테스트 |

---

## 기술 스택

### Android Application
| 기술 | 설명 |
|:----:|:-----|
| **Kotlin** | 메인 개발 언어 |
| **Jetpack Compose** | 선언형 UI 프레임워크 |
| **Bluetooth API** | Arduino와 실시간 통신 |
| **Gradle** | 빌드 도구 |

### Arduino Embedded
| 기술 | 설명 |
|:----:|:-----|
| **C++** | 펌웨어 개발 언어 |
| **DHT.h** | 온습도 센서 라이브러리 |
| **SoftwareSerial** | Bluetooth 시리얼 통신 |
| **WiFiEsp** | WiFi 모듈 통신 |

---

## 프로젝트 구조

```
6조 소스코드/
├── EasyFarm_Android/           # Android 모바일 애플리케이션
│   ├── easyfarm/               # Kotlin 소스 코드
│   │   ├── MainActivity.kt     # 메인 화면
│   │   ├── PlantActivity.kt    # 식물 모니터링 및 제어
│   │   ├── InfoActivity.kt     # 식물 정보 표시
│   │   ├── SplashActivity.kt   # 스플래시 화면
│   │   └── Bluetooth/          # Bluetooth 관련 클래스
│   │       ├── Beacon.kt
│   │       └── Paired.kt
│   └── res/                    # 리소스 파일
│       ├── drawable/           # 이미지 리소스
│       ├── font/               # 커스텀 폰트
│       ├── layout/             # XML 레이아웃
│       └── values/             # 색상, 문자열, 테마
│
└── EasyFarm_Aduino/            # Arduino 임베디드 시스템
    └── easyfarm.ino            # 메인 펌웨어 코드
```

---

## 주요 기능

### 하드웨어 (Arduino)

| 기능 | 설명 |
|:----:|:-----|
| **센서 데이터 수집** | DHT11 온습도, 토양 수분도, 조도 실시간 측정 |
| **자동 급수 제어** | 설정 습도 이하 시 펌프 자동 작동 (1초 급수 → 5분 대기 → 재측정) |
| **LED 조명 제어** | 조도 300 미만 시 자동 점등, 수동 제어 가능 |
| **알림 서비스** | 물 부족 감지 시 PushingBox API를 통한 푸시 알림 |

### 소프트웨어 (Android)

| 화면 | 기능 |
|:----:|:-----|
| **메인 화면** | 내 식물 / 식물 정보 네비게이션 |
| **식물 모니터링** | 실시간 온도, 습도, LED 상태 표시 |
| **원격 제어** | 습도 설정값 조절 (5~100%), LED ON/OFF |
| **식물 정보** | 식물별 적정 온습도, 계절별 관리 정보 |

---

## 하드웨어 구성

### 부품 목록

| 부품명 | 수량 | 용도 |
|:------:|:----:|:-----|
| Arduino (Mega/Uno) | 1 | 메인 제어 보드 |
| DHT11 | 1 | 온습도 센서 |
| 토양 수분 센서 | 1 | 흙 습도 측정 |
| 조도 센서 (CDS) | 1 | 빛 세기 측정 |
| HC-05/HC-06 | 1 | Bluetooth 모듈 |
| WiFi 모듈 (ESP) | 1 | 알림 전송용 |
| 워터 펌프 | 1 | 자동 급수 |
| LED | 1 | 조명 제어 |
| 릴레이 모듈 | 1 | 펌프 제어 |

### 핀 배치

| 핀 번호 | 연결 | 용도 |
|:-------:|:----:|:-----|
| A0 | DHT11 | 온습도 센서 입력 |
| A3 | 수분 센서 | 토양 수분도 입력 |
| A5 | CDS | 조도 센서 입력 |
| D5 | LED | LED 제어 출력 (PWM) |
| D10 | 릴레이 | 워터 펌프 제어 |
| D7, D8 | HC-05 | Bluetooth TX/RX |
| D2, D3 | ESP | WiFi TX/RX |

---

## 앱 화면

### 식물 정보 차트
<p align="center">
  <img src="source-code/EasyFarm_Android/res/drawable-v24/info_chart.jpg" width="300" alt="식물 온습도 차트"/>
</p>

### 계절별 습도 정보
<p align="center">
  <img src="source-code/EasyFarm_Android/res/drawable-v24/info_plant.jpg" width="300" alt="계절별 습도"/>
</p>

### 식물별 적정 습도
<p align="center">
  <img src="source-code/EasyFarm_Android/res/drawable-v24/info_hum.jpg" width="300" alt="식물별 적정습도"/>
</p>

---

## 설치 및 실행 방법

### Arduino 설정

1. **Arduino IDE 설치**
   - [Arduino 공식 사이트](https://www.arduino.cc/en/software)에서 다운로드

2. **라이브러리 설치**
   ```
   스케치 → 라이브러리 포함하기 → 라이브러리 관리
   - DHT sensor library 검색 후 설치
   - WiFiEsp 검색 후 설치
   ```

3. **코드 업로드**
   ```
   1. EasyFarm_Aduino/easyfarm.ino 파일 열기
   2. 보드 및 포트 선택
   3. 업로드 버튼 클릭
   ```

### Android 설정

1. **Android Studio 설치**
   - [Android Studio 공식 사이트](https://developer.android.com/studio)에서 다운로드

2. **프로젝트 열기**
   ```
   File → Open → EasyFarm_Android 폴더 선택
   ```

3. **빌드 및 실행**
   ```
   1. Gradle Sync 완료 대기
   2. 실제 기기 연결 (Bluetooth 사용을 위해 에뮬레이터 불가)
   3. Run 버튼 클릭
   ```

### 앱 사용법

1. 앱 실행 후 Bluetooth 권한 허용
2. Arduino와 페어링된 Bluetooth 기기 선택
3. 연결 완료 후 실시간 데이터 확인
4. 습도 설정값 조절 및 LED 제어

---

## 통신 프로토콜

### Bluetooth 데이터 포맷

**Arduino → Android (센서 데이터)**
```
[1 byte: 온도] [1 byte: 습도] [1 byte: LED 상태]

예시: 25 60 1  →  온도 25°C, 습도 60%, LED ON
```

**Android → Arduino (제어 명령)**
```
LED 제어:
  't' → LED ON
  'f' → LED OFF

습도 설정:
  "05\n" ~ "100\n"  →  목표 습도 5% ~ 100%
```

### WiFi 알림 (PushingBox)
```
물 부족 감지 시:
GET http://api.pushingbox.com/pushingbox?devid={DEVICE_ID}
```

---

## 개발 기간

**2022.08.29 ~ 2022.10.31**

---

## 참고 자료

- [DHT 센서 라이브러리](https://github.com/adafruit/DHT-sensor-library)
- [WiFiEsp 라이브러리](https://github.com/bportaluri/WiFiEsp)
- [Android Bluetooth 가이드](https://developer.android.com/guide/topics/connectivity/bluetooth)
- [Jetpack Compose 문서](https://developer.android.com/jetpack/compose)
- [PushingBox API](https://www.pushingbox.com/)

---

## 라이선스

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2022 EasyFarm Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```