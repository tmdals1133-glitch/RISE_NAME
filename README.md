
# Kakao Skill Server (Render)

Node.js + Express 기반 카카오 오픈빌더 스킬 서버 템플릿입니다.

## 로컬 실행
```bash
npm install
npm run start
# 또는
npm run dev
```

## 엔드포인트
- `POST /api/majorCounsel` : 학과 상담 카드 응답
- `POST /api/sayHello` : "안녕" 텍스트 응답
- `POST /api/showHello` : 라이언 이미지 응답
- `GET /health` : 헬스체크

## 요청 예시
```bash
curl -X POST http://localhost:3000/api/majorCounsel   -H "Content-Type: application/json"   -d '{"action":{"params":{"RISE_name":"AI웹툰애니계열"}}}'
```

## Render 배포
1. 이 폴더를 GitHub에 새 저장소로 푸시
2. Render → New → Web Service
3. 저장소 선택 → Build Command: `npm install` → Start Command: `npm start`
4. 생성 후 배포 완료되면, HTTPS 도메인으로 스킬 URL 설정
