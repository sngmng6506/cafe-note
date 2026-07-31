# Cafe Note

개인용 네이버 카페 리뷰 작성 보조 PWA입니다. 카페 방문 정보를 선택형 항목과 짧은 메모로 정리하면 AI가 네이버 블로그용 초안을 만들고, 본문 흐름에 맞는 사진 종류와 삽입 위치도 텍스트로 추천합니다.

실제 사진 파일은 AI나 서버에 전송하지 않습니다. 사용자는 생성된 글과 사진 가이드를 참고해 네이버 블로그에 직접 사진을 넣고 게시합니다.

## 접속 주소

Railway 배포 주소:

```text
https://${{RAILWAY_PUBLIC_DOMAIN}}
```

Railway 웹 서비스의 **Settings → Networking → Public Networking**에서 실제 도메인을 확인한 뒤 위 주소를 실제 URL로 교체합니다.

## 주요 기능

- 환경변수 비밀번호 해시 기반 개인 로그인
- HttpOnly 세션과 로그인 실패 제한
- 카페 유형에 따라 우선 항목이 달라지는 8개 접이식 입력 섹션
- 사실, 방문 상황, 개인 평가를 구분한 구조화 입력
- LocalStorage 기반 작성 중 내용 자동 복구
- OpenRouter 텍스트 모델 기반 제목 3개, 요약, 본문, 태그 생성
- 본문 문단 사이에 들어갈 사진 종류와 순서 추천
- 결과 수정, 다시 생성, 저장, 삭제, 기록 검색
- 사진 가이드 포함 본문과 순수 본문 각각 복사
- iPhone 안전 영역과 홈 화면 실행을 지원하는 PWA

## 사용 흐름

1. 카페 정보와 방문 경험을 선택형 항목 및 짧은 메모로 입력합니다.
2. 사진 포인트에서 촬영한 대상이나 강조하고 싶은 요소를 선택합니다.
3. AI가 블로그용 제목, 본문, 태그와 사진 배치 가이드를 생성합니다.
4. 생성 결과를 검토하고 필요한 부분을 수정합니다.
5. 사진 가이드 포함 본문을 네이버 블로그에 붙여넣습니다.
6. `[사진 추천 · 외관]`, `[사진 추천 · 내부]` 같은 위치에 사진첩의 실제 사진을 직접 삽입합니다.
7. 사진 추천 문구를 삭제하고 게시합니다.

예시:

```text
연남동 골목 안쪽에 있는 카페에 다녀왔습니다.

[사진 추천 1 · 외관 · 카페 외관 정면 1장]

입구는 크지 않았지만 간판이 눈에 잘 들어오는 편이었습니다.

[사진 추천 2 · 내부 · 내부 전체 분위기 가로 사진 1장]

내부는 좌석 간격이 비교적 넉넉했고 전체적으로 차분했습니다.
```

## 기술 스택

- Next.js App Router
- TypeScript / React
- Tailwind CSS
- PostgreSQL / Prisma
- Zod
- OpenAI JavaScript SDK
- OpenRouter API
- argon2 / jose
- Vitest / React Testing Library / Playwright

## AI 구성

OpenAI JavaScript SDK를 사용하지만 요청 대상은 OpenRouter입니다.

```text
https://openrouter.ai/api/v1
```

현재 Railway 모델 설정 예시:

```env
OPENAI_MODEL=nvidia/nemotron-3-ultra-550b-a55b:free
```

환경변수 이름은 기존 코드와의 호환성을 위해 `OPENAI_API_KEY`, `OPENAI_MODEL`을 유지합니다. `OPENAI_API_KEY`에는 OpenRouter의 `sk-or-v1-...` 키를 넣습니다.

사진 파일은 AI 요청에 포함되지 않으므로 텍스트 전용 모델을 사용할 수 있습니다.

## 로컬 실행

Node.js 20 이상과 PostgreSQL이 필요합니다.

```bash
npm install
cp .env.example .env
npm run hash-password -- "사용할 비밀번호"
npx prisma migrate dev
npm run dev
```

생성된 Argon2id 해시를 `.env`의 `APP_PASSWORD_HASH`에 넣습니다.

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/cafe_note

OPENAI_API_KEY=sk-or-v1-...
OPENAI_MODEL=nvidia/nemotron-3-ultra-550b-a55b:free

APP_PASSWORD_HASH=$argon2id$...
SESSION_SECRET=
SESSION_MAX_AGE_DAYS=30
LOGIN_RATE_LIMIT_SALT=

APP_URL=http://localhost:3000
PROMPT_VERSION=cafe-review-v3-text-only
```

- `SESSION_SECRET`: 최소 32자 이상의 무작위 값
- `LOGIN_RATE_LIMIT_SALT`: 최소 16자 이상의 무작위 값
- `OPENAI_API_KEY`: 서버에서만 사용하며 `NEXT_PUBLIC_` 접두사를 붙이지 않음

## Prisma

개발 환경:

```bash
npx prisma migrate dev
npx prisma generate
```

배포 환경:

```bash
npx prisma migrate deploy
```

## 품질 확인

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Playwright 환경을 구성한 경우:

```bash
npm run test:e2e
```

## Railway 환경변수

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}

OPENAI_API_KEY=sk-or-v1-...
OPENAI_MODEL=nvidia/nemotron-3-ultra-550b-a55b:free

APP_PASSWORD_HASH=$argon2id$...
SESSION_SECRET=
SESSION_MAX_AGE_DAYS=30
LOGIN_RATE_LIMIT_SALT=

APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
PROMPT_VERSION=cafe-review-v3-text-only
```

PostgreSQL 서비스 이름이 `Postgres`가 아니라면 `DATABASE_URL` 참조의 서비스명을 실제 이름으로 변경합니다.

## Railway 배포 설정

```text
Build Command
npm ci && npm run build

Pre-deploy Command
npx prisma migrate deploy

Start Command
npm run start

Healthcheck Path
/api/health
```

`APP_URL`에는 `https://`를 포함한 실제 Railway 공개 도메인을 설정해야 Origin 검증이 정상 작동합니다.

별도 Redis, Worker, Volume, 이미지 스토리지는 필요하지 않습니다.

## iPhone 홈 화면 추가

1. Safari에서 Railway 배포 주소를 엽니다.
2. 공유 버튼을 누릅니다.
3. `홈 화면에 추가`를 선택합니다.
4. 홈 화면의 Cafe Note 아이콘으로 실행합니다.

## 데이터와 게시 정책

- 실제 사진 파일을 AI, PostgreSQL, Railway Volume 또는 외부 스토리지에 전송하거나 저장하지 않습니다.
- DB에는 사용자가 입력한 구조화 정보, 생성된 본문, 태그, 사진 추천 계획만 저장합니다.
- 네이버 로그인 자동화와 자동 게시 기능은 포함하지 않습니다.
- 사용자가 결과를 검토하고 네이버 블로그에 직접 붙여넣어 발행합니다.

## 알려진 제한사항

- OpenRouter 무료 모델은 제공 상태나 호출 제한이 변경될 수 있습니다.
- 무료 모델이 JSON 형식을 지키지 않으면 생성 요청이 실패할 수 있습니다.
- 실제 iPhone Safari의 클립보드 권한과 standalone 실행은 실제 기기에서 확인해야 합니다.
- 자동화 E2E용 OpenRouter 및 PostgreSQL mock 환경은 아직 포함하지 않았습니다.
- 이전 구조의 초기 migration을 이미 적용한 DB는 별도의 데이터 migration이 필요할 수 있습니다.
