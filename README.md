# Cafe Note

개인용 네이버 카페 리뷰 작성 보조 PWA입니다. 카페 방문 정보를 선택형 항목과 짧은 메모로 정리하고 사진을 선택하면, OpenAI가 네이버 블로그용 초안을 만듭니다. 결과는 사용자가 수정하고 직접 복사해 게시합니다.

## 주요 기능

- 환경변수 비밀번호 해시 기반 개인 로그인, HttpOnly 세션, 로그인 실패 제한
- 카페 유형에 따라 우선 항목이 달라지는 8개 접이식 입력 섹션
- 사실, 방문 상황, 개인 평가를 구분한 구조화 입력과 LocalStorage 자동 복구
- iPhone HEIC/HEIF 사진의 브라우저 JPEG 변환, 1,280px 축소, 썸네일
- OpenAI Responses API 기반 제목 3개, 요약, 본문, 태그, 사진 계획 생성
- 결과 수정, 텍스트 다시 생성, 저장, 삭제, 기록 검색
- 제목, 본문, 사진 표시 포함 본문, 태그, 전체 복사
- iPhone 안전 영역과 홈 화면 실행을 지원하는 PWA

## 기술 스택

Next.js App Router, TypeScript, React, Tailwind CSS, PostgreSQL, Prisma, Zod, OpenAI JavaScript SDK, argon2, jose, Vitest, React Testing Library, Playwright를 사용합니다.

## 로컬 실행

Node.js 20 이상과 PostgreSQL이 필요합니다.

```bash
npm install
cp .env.example .env
npm run hash-password -- "사용할 비밀번호"
npx prisma migrate dev
npm run dev
```

생성된 Argon2id 해시를 `.env`의 `APP_PASSWORD_HASH`에 넣습니다. `SESSION_SECRET`은 최소 32바이트, `LOGIN_RATE_LIMIT_SALT`는 최소 16자의 무작위 값으로 설정합니다.

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/cafe_note
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-luna
APP_PASSWORD_HASH=
SESSION_SECRET=
LOGIN_RATE_LIMIT_SALT=
APP_URL=http://localhost:3000
```

`OPENAI_API_KEY`는 서버에서만 읽으며 `NEXT_PUBLIC_` 접두사를 사용하지 않습니다. 전체 설정은 [.env.example](./.env.example)을 기준으로 합니다.

## Prisma

```bash
npx prisma migrate dev
npx prisma generate
```

배포 환경에서는 다음 명령으로 기존 migration만 적용합니다.

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

Playwright 환경을 구성한 경우 `npm run test:e2e`로 E2E를 실행할 수 있습니다.

## Railway 배포

1. GitHub 저장소를 Railway 웹 서비스에 연결합니다.
2. 같은 프로젝트에 Railway PostgreSQL을 추가합니다.
3. 웹 서비스에 PostgreSQL의 `DATABASE_URL` reference variable을 연결합니다.
4. `OPENAI_API_KEY`, `OPENAI_MODEL`, `APP_PASSWORD_HASH`, `SESSION_SECRET`, `SESSION_MAX_AGE_DAYS`, `LOGIN_RATE_LIMIT_SALT`, `APP_URL`, `PROMPT_VERSION`을 설정합니다.
5. 배포 전 명령으로 `npx prisma migrate deploy`를 실행합니다.
6. 빌드는 `npm ci && npm run build`, 시작은 `npm run start`를 사용합니다.
7. Health check 경로를 `/api/health`로 설정합니다.
8. 배포 도메인으로 로그인과 AI 생성을 확인한 뒤 iPhone 홈 화면에 추가합니다.

Railway의 `APP_URL`에는 `https://`를 포함한 실제 배포 도메인을 입력해야 Origin 검증이 정상 동작합니다. 별도 Redis, Worker, Volume은 필요하지 않습니다.

## iPhone 홈 화면 추가

Safari에서 배포 URL을 열고 공유 버튼을 누른 뒤 `홈 화면에 추가`를 선택합니다. 앱 내부에서도 로그인 후 최초 한 번 설치 안내를 표시합니다.

## 데이터와 게시 정책

사진 원본과 변환 이미지 바이너리는 PostgreSQL, Railway Volume, 프로젝트 디렉터리, 외부 스토리지에 영구 저장하지 않습니다. 생성 요청 중 메모리에서 OpenAI API로 전달한 뒤 폐기하며, DB에는 AI가 만든 사진 설명과 추천 순서만 저장합니다.

네이버 로그인 자동화, 블로그 자동 게시, 브라우저 매크로는 포함하지 않습니다. 사용자가 결과를 검토하고 네이버 블로그에 직접 붙여넣어 발행합니다.

## 알려진 제한사항

- 상세 화면의 다시 생성은 저장된 구조화 텍스트만 사용하며, 원본 사진은 브라우저에 남지 않으므로 사진 계획이 초기화됩니다.
- 실제 iPhone Safari의 HEIC 변환, 음성 입력, 클립보드 권한, standalone 실행은 실제 기기에서 수동 확인해야 합니다.
- 자동화 E2E용 OpenAI·PostgreSQL mock 환경은 아직 포함하지 않았습니다.
- 이미 이전 형태의 초기 migration을 적용한 DB가 있다면 새 구조에 맞춘 별도 데이터 migration이 필요합니다.
