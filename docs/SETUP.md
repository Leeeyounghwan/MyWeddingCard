# 이영환 ♥ 오은진 — 모바일 청첩장

2027. 04. 25 SUN · 웨스턴팰리스웨딩 (인천 부평구 부평대로278번길 16)

React + TypeScript + Vite 로 만든 모바일 청첩장입니다. GitHub Pages 에 정적 사이트로 배포하고, 방명록과 RSVP 는 Supabase(PostgreSQL)에 저장합니다.

> **처음 수정하는 경우**
> 거의 모든 내용은 `src/data/` 폴더에서 바꿉니다. 코드 안의 `✏️` 표시가 수정할 곳이고, 화면에 보이는 `✏️` 문구는 아직 채우지 않은 임시 문구입니다.

---

## 1. 프로젝트 구조

```text
.
├─ .github/workflows/deploy.yml   GitHub Pages 자동 배포
├─ supabase/schema.sql            DB 스키마 · RLS · RPC 함수 (SQL Editor 에서 실행)
├─ scripts/generate-placeholders.mjs  임시 이미지 생성기
├─ public/                        정적 파일 (URL 경로 그대로 서빙)
│  ├─ images/                     hero · ending · couple/ · gallery/ · story/
│  ├─ audio/bgm.mp3               배경음악 (직접 추가)
│  ├─ og-image.png                카카오톡 공유 미리보기 이미지 (1200×630)
│  ├─ favicon.svg · apple-touch-icon.png
├─ index.html                     메타태그 (빌드 시 wedding.ts 값으로 자동 치환)
├─ vite.config.ts                 base 경로 · OG 메타 주입
└─ src/
   ├─ data/            ✏️ 콘텐츠 설정 (여기만 고치면 됨)
   │  ├─ wedding.ts        신랑·신부·혼주·예식 일시·예식장·초대글·공유문구·기능 on/off
   │  ├─ gallery.ts        갤러리 사진 목록
   │  ├─ timeline.ts       Our Story
   │  ├─ transportation.ts 교통 안내
   │  ├─ information.ts    식사·화환 등 안내
   │  ├─ accounts.ts       계좌번호
   │  └─ types.ts          데이터 타입
   ├─ components/
   │  ├─ intro/ hero/ invitation/ couple/ wedding-day/ countdown/ timeline/
   │  ├─ gallery/ (Gallery, Carousel)  location/ (Location, DirectionsSheet, map/)
   │  ├─ information/ rsvp/ guestbook/ account/ contact/ ending/
   │  ├─ share/ (InvitationCard, CardSheet)  music/  floating/
   │  └─ common/ (Section, Reveal, Sheet, Button, Photo, Segment, Toast, Form 스타일)
   ├─ hooks/           useScrollLock, useDisclosure
   ├─ lib/             supabase · guestbook · rsvp · map · share · music · date · validation ...
   ├─ styles/          tokens.css (디자인 토큰) · global.css
   ├─ App.tsx          인트로 · 첫 화면 (Hero, Invitation)
   ├─ BelowFold.tsx    나머지 섹션 (별도 청크로 지연 로딩, 섹션 순서도 여기서 변경)
   └─ main.tsx
```

## 2. 기술 스택

| 영역 | 사용 | 이유 |
| --- | --- | --- |
| UI | React 19 + TypeScript | 섹션별 컴포넌트 분리, 타입이 있는 데이터 설정 |
| 빌드 | Vite | 빠른 개발 서버, 코드 스플리팅, `base` 로 GitHub Pages 하위 경로 대응 |
| 애니메이션 | Framer Motion (`LazyMotion` + `m`) | IntersectionObserver 기반 `whileInView`, 필요한 기능만 번들에 포함 |
| 스타일 | CSS Modules + CSS 변수 | 추가 런타임 없이 컴포넌트 단위 스타일, 테마는 변수로 교체 |
| 아이콘 | lucide-react | 트리셰이킹되어 사용한 아이콘만 포함 |
| DB | Supabase (PostgreSQL) | RLS 와 RPC 로 정적 사이트에서도 안전하게 쓰기 가능 |
| 이미지 저장 | html-to-image | 전용 `InvitationCard` 레이아웃을 PNG 로 변환 (클릭 시에만 로드) |

Swiper, date-fns, react-intersection-observer 는 **쓰지 않았습니다.** 화보 캐러셀 스와이프는 Pointer Events 로 직접 처리하고, 날짜 계산은 `Intl`, 뷰포트 감지는 Framer Motion 내장 기능으로 대신했습니다.

**번들 (gzip 기준)**

- 첫 로딩 JS: 약 110KB (React, Framer Motion, 인트로, 히어로 포함)
- 아래쪽 섹션: 14KB 청크로 분리되어 인트로가 재생되는 동안 미리 받습니다.
- Supabase SDK(55KB)와 html-to-image(5KB): 처음 사용할 때만 받습니다.
- 지도 SDK: 지도 영역이 화면 가까이 왔을 때만 받습니다.

## 3. 주요 컴포넌트

| 컴포넌트 | 설명 |
| --- | --- |
| `Intro` | 아이보리 배경에 Wedding Invitation, 영문 이름, 한글 이름, 날짜가 순서대로 나타난 뒤 **버튼 없이 자동으로** 청첩장 메인으로 전환됩니다. 화면을 탭하면 바로 건너뛸 수 있습니다(그 탭이 사용자 제스처이므로 이때는 BGM 자동재생도 함께 시도됩니다 — 타이머로 자동 전환될 때는 모바일 정책상 BGM 이 막힐 수 있고, 이 경우 우측 상단 음악 버튼으로 직접 재생하면 됩니다). 인트로는 세션당 1회만 보이며, 본문은 인트로 뒤에서 이미 로딩됩니다. |
| `Hero` | 100svh 풀스크린 사진입니다. 인트로가 끝나면 줌아웃 · 텍스트 stagger · 스크롤 패럴랙스 · SCROLL 표시가 이어집니다. |
| `Invitation` | 초대 문구가 문단별로 순차 등장하고, 혼주 표기와 `연락하기` 시트가 이어집니다. |
| `Couple` | 좌우로 엇갈린 매거진형 소개입니다. 사진은 마스크 리빌로 나타나고, 프로필 항목을 확장할 수 있습니다. |
| `WeddingDay` + `Countdown` | 직접 디자인한 달력(예식일에 원이 그려지는 애니메이션)과 카운트다운입니다. 예식 시작 후와 종료 후에는 문구가 바뀝니다. |
| `Timeline` | 스크롤에 맞춰 세로선이 채워지고 이야기가 하나씩 등장합니다. 데이터가 없으면 섹션이 숨겨집니다. |
| `Gallery` (`Carousel`) | 그리드가 아니라 웨딩화보 사진을 한 장씩 크게 보여주는 캐러셀입니다. 스와이프 · 좌우 화살표 버튼 · 키보드(←, →)로 넘길 수 있고 현재 장수(`n / 총`)를 표시합니다. |
| `Location` | 지도(카카오/네이버 교체 가능, 키가 없으면 대체 카드) · 주소 복사 · 네이버/카카오/티맵 버튼 · 현재 위치 길찾기 · 교통 안내로 구성됩니다. |
| `Information` | 식사 · 화환 등 안내 카드입니다. |
| `Rsvp` | 하단 시트 폼입니다. 신랑/신부측, 이름, 참석, 인원, 식사, (선택)연락처, (선택)메모와 개인정보 동의를 받습니다. |
| `Guestbook` | 최근 4개를 미리 보여줍니다. 전체보기(페이지 단위), 작성, 비밀번호로 삭제할 수 있습니다. |
| `Account` | 접힌 아코디언입니다. 계좌 복사와 카카오페이 링크(선택)를 제공합니다. |
| `Ending` | 사진 위에 글자 단위 레터링이 나타나고, 공유 · 링크 복사 · **청첩장 이미지 저장** 버튼이 있습니다. |
| `InvitationCard` / `CardSheet` | 이미지 저장 전용 360×640 레이아웃을 3배율 PNG(1080×1920)로 만듭니다. |
| `MusicButton` / `FloatingNav` | 우측 상단 음악 버튼, 우측 하단 공유와 맨 위로 버튼입니다. FloatingNav 는 히어로를 지난 뒤에만 보입니다. |

## 4. 실행 방법

```bash
npm install
npm run dev          # http://localhost:5173  (같은 Wi-Fi 의 휴대폰에서도 접속 가능)
npm run build        # dist/ 생성 (타입체크 포함)
npm run preview      # 빌드 결과 확인
```

- 인트로 다시 보기: `http://localhost:5173/?intro`
- 인트로 건너뛰기: `?nointro`
- Supabase 를 설정하지 않은 개발 모드에서는 방명록과 RSVP 가 **이 브라우저의 localStorage 에만** 저장되어 UI 를 확인할 수 있습니다. 이때 화면에 '개발 모드' 안내가 표시됩니다.
- 배포 빌드에서 Supabase 설정이 없으면 두 섹션은 자동으로 숨겨집니다.

## 5. 환경변수

```bash
cp .env.example .env
```

| 변수 | 공개 여부 | 설명 |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | 공개 OK | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | 공개 OK | anon(publishable) 키입니다. 권한은 RLS 와 RPC 가 통제합니다. |
| `VITE_MAP_PROVIDER` | 공개 OK | `kakao` 또는 `naver` |
| `VITE_KAKAO_MAP_KEY` | 공개 OK | 카카오 **JavaScript 키**. 등록한 도메인에서만 동작합니다. |
| `VITE_NAVER_MAP_CLIENT_ID` | 공개 OK | 네이버 지도 Client ID. 등록한 URL 에서만 동작합니다. |
| `VITE_SITE_URL` | 공개 OK | 배포 주소(OG 이미지 절대경로용). GitHub Actions 에서는 자동으로 설정됩니다. |

**`VITE_` 로 시작하는 값은 빌드된 JS 에 그대로 들어가 누구나 볼 수 있습니다.** 다음 값은 어디에도 `VITE_` 로 넣지 마세요.

- Supabase **service_role / secret key**
- DB 비밀번호
- 카카오 REST API 키 · Admin 키
- 네이버 Client Secret
- GitHub Personal Access Token

## 6. Supabase 설정

1. [supabase.com](https://supabase.com) 에서 새 프로젝트를 만듭니다. 리전은 Northeast Asia(Seoul)를 권장합니다.
2. **SQL Editor** 에 `supabase/schema.sql` 전체를 붙여넣고 **Run** 합니다. 여러 번 실행해도 안전합니다.
3. **Project Settings → API** 에서 `Project URL` 과 `anon public` 키를 `.env` 와 GitHub 저장소 변수에 넣습니다.
4. 데이터 확인과 관리
   - 방명록: Table Editor → `guestbook`. 부적절한 글은 `is_visible` 을 `false` 로 바꾸면 숨겨집니다.
   - RSVP: Table Editor → `rsvp`
   - 집계: SQL Editor 에서 `select * from private.rsvp_summary;`
   - 금칙어 추가: `insert into private.blocked_words(word) values ('단어');`
5. 예식이 끝나고 한 달 안에 RSVP 연락처를 삭제하세요. RSVP 동의 문구에 이 보유 기간을 약속했습니다.
   ```sql
   update public.rsvp set phone = null;
   ```

## 7. Supabase SQL Schema

전체 내용은 [`supabase/schema.sql`](supabase/schema.sql) 에 있습니다. 요약:

| 객체 | 역할 |
| --- | --- |
| `public.guestbook` | `id, name, message, password_hash, ip_hash, is_visible, created_at` |
| `public.rsvp` | `id, side, name, attending, party_size, meal, phone, memo, ip_hash, created_at` |
| `private.rate_limit_events` · `blocked_words` · `settings` | 속도 제한 · 금칙어 · IP 해시 salt. `private` 스키마는 API 에 노출되지 않습니다. |
| `get_guestbook(limit, offset)` | 보이는 글만 반환하고 해시 컬럼은 반환하지 않습니다. 최대 50개입니다. |
| `add_guestbook(name, message, password)` | 길이 검증, 링크 차단, 금칙어, 10분 내 중복을 검사합니다. IP 당 10분 3회, 전체 1시간 60회로 제한하고 비밀번호는 bcrypt 로 저장합니다. |
| `delete_guestbook(id, password)` | 비밀번호가 맞으면 숨김 처리(soft delete)합니다. 시도는 IP 당 10분 10회로 제한합니다. |
| `submit_rsvp(...)` | 입력을 검증하고 IP 당 10분 5회로 제한합니다. **조회 함수는 없습니다.** |

두 테이블 모두 RLS 가 켜져 있고 정책은 없습니다. anon 과 authenticated 의 테이블 권한도 모두 회수했으므로, 브라우저에서 테이블에 직접 접근할 수 없습니다.

## 8. 지도 API 설정

지도 제공자는 `src/components/location/map/MapProvider.ts` 에서 선택합니다. 키가 없으면 지도 대신 주소 카드가 표시되고, 길찾기 버튼은 그대로 동작합니다.

**카카오 (권장)**

1. [Kakao Developers](https://developers.kakao.com) → 애플리케이션을 추가합니다.
2. **앱 키 → JavaScript 키**를 `VITE_KAKAO_MAP_KEY` 에 넣습니다.
3. **플랫폼 → Web → 사이트 도메인**에 `http://localhost:5173` 과 `https://<아이디>.github.io` 를 등록합니다.
4. 제품 설정에서 **카카오맵** 사용을 켭니다.

카카오 키가 있으면 주소로 좌표를 자동 보정하므로, 핀과 길찾기 링크가 정확한 위치를 가리킵니다.

**네이버**

1. NAVER Cloud Platform → AI·NAVER API → Maps → Application 을 등록합니다(Dynamic Map).
2. Client ID 를 `VITE_NAVER_MAP_CLIENT_ID` 에, `naver` 를 `VITE_MAP_PROVIDER` 에 넣습니다.
3. **Web 서비스 URL** 에 위와 같은 도메인을 등록합니다.

좌표는 `src/data/wedding.ts → venue.lat/lng` 에 있습니다. 현재 값은 갈산역 2번 출구 근처의 **대략값**입니다. 카카오맵에서 예식장을 검색해 정확한 좌표로 바꿔주세요. 티맵 · 네이버 앱 딥링크가 이 값을 사용합니다.

## 9. GitHub Pages 배포

1. GitHub 에 저장소를 만들고 push 합니다. 이름은 예를 들어 `wedding` 으로 합니다.
2. **Settings → Pages → Source: GitHub Actions** 를 선택합니다.
3. **Settings → Secrets and variables → Actions → Variables** 에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_MAP_PROVIDER`, `VITE_KAKAO_MAP_KEY` 를 등록합니다. Secrets 에 넣어도 동작합니다.
4. `main` 에 push 하면 `.github/workflows/deploy.yml` 이 빌드하고 배포합니다.
   - `BASE_PATH` 와 `VITE_SITE_URL` 은 워크플로가 자동으로 넣습니다. 프로젝트 사이트는 `/wedding/`, 사용자 사이트와 커스텀 도메인은 `/` 가 됩니다.
5. 배포 주소는 `https://<아이디>.github.io/wedding/` 입니다.
6. 카카오톡 미리보기가 예전 것으로 보이면 [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 캐시를 초기화하세요.

라우터가 없는 한 페이지 앱이라 GitHub Pages 의 SPA 404 문제는 생기지 않습니다. 검색엔진 노출을 막기 위해 `index.html` 에 `noindex` 가 들어 있습니다.

## 10. 사진 교체

사진은 **WebP 형식을 쓰고 긴 변을 1600px 이하로** 줄여 주세요. [squoosh.app](https://squoosh.app) 으로 품질 75~80 정도로 변환하면 됩니다.

| 위치 | 파일 | 설정 |
| --- | --- | --- |
| 메인 | `public/images/hero.webp` (세로 2:3) | `wedding.ts → media.heroImage` |
| 엔딩 | `public/images/ending.webp` | `wedding.ts → ending.photo` |
| 신랑/신부 | `public/images/couple/groom.webp`, `bride.webp` (3:4) | `wedding.ts → groom.photo / bride.photo` |
| 갤러리 | `public/images/gallery/01.webp …` | `gallery.ts` (src, width, height, alt) |
| 스토리 | `public/images/story/01.webp …` (4:3) | `timeline.ts → image` |
| 저장용 카드 | 비우면 hero 사용 | `wedding.ts → media.cardImage` |
| 공유 미리보기 | `public/og-image.png` 또는 `.jpg` (1200×630) | `wedding.ts → meta.ogImage` |

- 갤러리 목록은 `gallery.ts` 의 `placeholder(...)` 대신 `{ src: 'images/gallery/01.webp', width: 1200, height: 1600, alt: '...' }` 형식으로 적습니다.
- 임시 SVG 파일은 교체가 끝나면 삭제해도 됩니다.
- 히어로 사진은 `index.html` 에서 자동으로 preload 됩니다.

## 11. BGM 교체

`public/audio/bgm.mp3` 에 파일을 넣으면 됩니다. 파일이 없으면 음악 버튼이 자동으로 숨겨집니다.

- 권장: 128kbps 이하, 3MB 이내, 저작권 문제가 없는 음원
- 볼륨 조절: `wedding.ts → media.bgm.volume` (0~1)
- 음악을 완전히 끄려면: `features.music = false`

## 12. 신랑/신부 정보 수정

`src/data/wedding.ts`

- `groom` / `bride`: 이름, 영문 이름, 관계(장남·차녀 등), 연락처, 사진, 한 줄 소개, `profile`(MBTI · 직업 등)
- `father` / `mother`: 혼주 성함과 연락처. 고인이면 `deceased: true`. 이름이 비어 있으면 '신랑 이영환' 형식으로 표시됩니다.
- `invitation.lines`: 초대 문구. 빈 문자열은 문단 사이의 간격이 됩니다.
- `meta`: 카카오톡 공유 제목과 설명
- `features`: 섹션 on/off, RSVP 마감일

## 13. 예식 시간 수정

```ts
// src/data/wedding.ts
export const ceremony = {
  dateTime: '2027-04-25T12:30:00+09:00', // 시간 부분만 변경
  timeConfirmed: true,                   // true 로 바꾸면 '오후 12시 30분' 이 표시됨
  durationMinutes: 90,                   // 예식 후 '감사합니다' 문구로 바뀌는 시점
}
```

카운트다운, 달력, 히어로, 저장 이미지에 모두 자동으로 반영됩니다. 방문자 기기의 시간대와 관계없이 한국 시간으로 계산합니다.

## 14. 계좌번호 · 연락처 등록 위치

- 계좌번호: `src/data/accounts.ts` 의 `bank`, `number`, `holder`, 선택 항목인 `kakaoPayUrl`. 비어 있으면 '등록 예정'으로 표시되고 복사 버튼이 비활성화됩니다.
- 연락처: `src/data/wedding.ts` 의 `groom.phone`, `groom.father.phone` 등. 비어 있으면 '등록 예정'으로 표시됩니다.
- 교통 · 주차: `src/data/transportation.ts`
- 안내 사항: `src/data/information.ts`

## 15. 보안 주의사항

- [ ] **Service Role Key 는 절대 프론트엔드나 GitHub 에 넣지 않습니다.** 모든 접근은 anon 키와 RPC 로만 이루어집니다.
- [ ] `.env` 는 커밋하지 않습니다(`.gitignore` 처리됨). `.env.example` 만 커밋합니다.
- [ ] **RLS**: 두 테이블 모두 RLS 가 켜져 있고 정책이 없으며 권한도 회수되어 있습니다. Table Editor 에서 정책을 임의로 추가하지 마세요.
- [ ] **XSS**: 방명록은 React 텍스트 노드로만 렌더링합니다. `dangerouslySetInnerHTML` 은 쓰지 않습니다.
- [ ] **SQL Injection**: 파라미터 바인딩(RPC)만 사용하고, 문자열로 SQL 을 조립하지 않습니다.
- [ ] **입력 검증**: 클라이언트와 서버에서 두 번 검사합니다. 길이, 제어문자, 링크, 금칙어, 중복을 확인합니다.
- [ ] **스팸·봇**: 클라이언트에는 허니팟 필드, 3초 최소 작성 시간, 30초 쿨다운이 있습니다. 서버에는 IP 해시 기반 rate limit 과 전역 limit 이 있습니다.
- [ ] **비밀번호**: bcrypt 로 해시하고, 삭제 시도 횟수를 제한합니다.
- [ ] **개인정보**: 공개 저장소라면 `accounts.ts` 와 연락처가 GitHub 에서 그대로 보입니다. 청첩장 페이지 자체도 공개이므로 결과는 같지만, 원치 않으면 저장소를 **Private** 으로 두세요. GitHub Pages 는 Pro 요금제에서 Private 저장소로도 배포할 수 있습니다.
- [ ] 지도 키는 반드시 **도메인을 제한**해 두세요(카카오 플랫폼 등록, 네이버 서비스 URL).
- [ ] 정교한 봇 공격이 생기면 Cloudflare Turnstile 을 붙이세요. Supabase Edge Function 에서 토큰을 검증한 뒤 RPC 를 호출하는 구조로 바꾸면 됩니다. 폼 제출 로직은 `lib/guestbook.ts` 한 곳에 모여 있습니다.

---

## 디자인 시스템

`src/styles/tokens.css` 한 파일에서 전체 테마를 바꿀 수 있습니다.

- **Color**: 4월 예식에 맞춘 봄 팔레트입니다. Clean white `#fbfaf6` / Pale sage `#f2f6ee` / Spring green `#4f724f` / Cherry blossom pink `#f4c9d6` (텍스트용 `#a8456a`) / Text `#2f332c`
- **Typography**: 본문 Pretendard, 한글 제목과 초대글은 Gowun Batang, 영문 레터링은 Cormorant Garamond(이탤릭 포함). `--font-*` 변수로 교체할 수 있습니다.
- **Spacing**: 4px 기반 스케일, 좌우 여백 28px, 섹션 상하 112px (360px 이하 화면에서는 22px / 96px)
- **Motion**: `cubic-bezier(.22,1,.36,1)`, 0.5~1.0초. 뷰포트 하단 12% 지점에서 1회 재생하며, `prefers-reduced-motion` 이 켜져 있으면 이동 효과 없이 페이드만 합니다.
- **Radius**: 2 / 6 / 12 / 20 / pill. 에디토리얼 느낌을 위해 사진은 직각입니다.
- **Shadow**: sm / md / lg / page (데스크톱 중앙 카드)

## 환경별 점검 결과 · 주의사항

| 환경 | 확인 / 대응 |
| --- | --- |
| **Desktop** | 콘텐츠가 440px 폭으로 가운데 정렬되고 바깥은 옅은 세이지 배경입니다. 플로팅 버튼은 콘텐츠 영역 안쪽에 붙습니다. 화보 캐러셀은 키보드(←, →)로도 넘길 수 있습니다. 티맵은 모바일 전용이라 안내 토스트를 띄웁니다. |
| **iPhone Safari** | `100svh` 로 주소창 높이 변화에 대응하고 `safe-area-inset` 을 반영했습니다. 입력창은 16px 이라 확대되지 않습니다. 시트가 열리면 `position: fixed` 로 배경 스크롤을 잠급니다. 이미지 저장은 공유 시트의 '이미지 저장'으로 사진 앱에 들어갑니다. html-to-image 의 Safari 첫 렌더 누락 버그를 막기 위해 한 번 예열합니다. BGM 은 '초대장 열기' 탭 안에서 재생합니다. |
| **Android Chrome** | 파일 공유(Web Share Level 2)를 지원합니다. 네이버 · 티맵은 앱 스킴을 먼저 시도하고, 1.6초 안에 앱이 열리지 않으면 웹 지도나 스토어로 이동합니다. |
| **카카오톡 인앱 브라우저** | 다운로드가 막히는 경우가 있어, 생성된 이미지를 화면에 띄우고 '길게 눌러 저장' 안내를 함께 보여줍니다. `navigator.share` 가 없으면 URL 복사로 대체합니다. 자동재생 정책은 사파리와 같습니다. |
| **Safari 구버전** | `:has()` 를 지원하지 않는 버전을 위해 세그먼트 선택 상태를 `data-checked` 로도 표시합니다. `overflow: clip` 이 없으면 `hidden` 으로 대체합니다. |
| **위치 권한 거부 · HTTP** | 길찾기 시트가 '지도 앱에서 선택' 상태로 바뀌고, 앱이 현재 위치를 출발지로 잡습니다. geolocation 은 HTTPS 에서만 동작하며 github.io 는 HTTPS 입니다. |
| **느린 네트워크** | 웹폰트는 비동기로 불러와 렌더링을 막지 않습니다. 사진은 lazy load 하고 비율 공간을 미리 잡아 레이아웃이 흔들리지 않습니다. 아래쪽 섹션 JS 는 인트로가 재생되는 동안 미리 받습니다. |

**사진 보호 · 확대 방지**

요청에 따라 사이트의 모든 사진(히어로 · 화보 캐러셀 · 신랑신부 · 스토리 · 엔딩)은 드래그 저장, 길게 눌러 저장, 우클릭 저장이 되지 않도록 막아 두었고, 페이지 전체의 핀치·더블탭 확대도 꺼두었습니다(`index.html` 뷰포트 `user-scalable=no`, `src/styles/global.css`, `src/main.tsx`). 단, **청첩장 이미지 저장** 기능으로 만든 결과 이미지는 원래 저장·공유하도록 만든 것이므로 이 제한에서 제외했습니다(`data-allow-save` 속성). 화면 확대가 막혀 있으므로 저시력 사용자의 접근성이 다소 떨어질 수 있다는 점은 참고해 주세요.

**알려진 한계**

- 화보 캐러셀은 핀치 줌을 지원하지 않습니다(위 사진 보호 정책과 일치하도록 의도적으로 뺐습니다). 스와이프로 사진을 넘기는 것에 집중했습니다.
- 카카오 · 네이버 지도 키가 도메인에 등록되지 않으면 SDK 가 회색 타일을 보여줄 수 있습니다. 배포 후 한 번 확인하세요.
- `og:image` 는 절대 URL 이 필요합니다. GitHub Actions 로 배포하면 자동으로 설정되지만, 로컬에서 빌드해 다른 곳에 올린다면 `VITE_SITE_URL` 을 설정하세요.
