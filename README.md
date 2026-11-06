# 미망서재 — 공개 배포용 시작 프로젝트

## 구성
- `index.html`: 미망서재 웹 화면
- `api/poem.js`: 서버에서 OpenAI Responses API를 호출하는 Vercel 함수

## 배포 전 꼭 확인
1. 보호자와 함께 계정, 결제, 개인정보 처리 및 공개 운영 여부를 확인하세요.
2. OpenAI API 키를 브라우저 코드나 GitHub 파일에 넣지 마세요.
3. Vercel 프로젝트의 Settings → Environment Variables에 `OPENAI_API_KEY`를 등록하세요.
4. 필요하면 `OPENAI_MODEL`에 계정에서 사용할 수 있는 모델명을 지정하세요. 기본값은 `gpt-6-astra`입니다.
5. 환경변수 등록 후 새로 배포하세요.
6. 공개 전 CAPTCHA와 서버 측 IP별 rate limit/사용량 한도를 추가하고, 미성년자 보호·개인정보 처리방침을 검토하세요.

## 주의
이 프로젝트는 공개 배포를 위한 시작 코드입니다. 아직 실제 배포, 결제 설정, CAPTCHA, 영구 저장, 주문 기능은 완료되지 않았습니다. 보호자 검토와 비용 제한·남용 방지 설정을 마치기 전에는 공개 링크를 널리 공유하지 마세요.
