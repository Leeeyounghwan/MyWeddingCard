<div align="center">

# 💌 My Wedding Card

**직접 만든 모바일 청첩장 — 이영환 ♥ 오은진**

2027. 04. 25 SUN 12:00 · 웨스턴팰리스웨딩 7층 웨스턴홀

![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222?logo=github&logoColor=white)

</div>

---

## 🤔 어떤 프로젝트인가요?

결혼을 준비하면서 "청첩장, 그냥 내가 만들어 볼까?" 하는 생각에서 시작한 **토이 프로젝트**입니다.
링크 하나로 공유하는 모바일 청첩장이고, 서버 없이 **정적 사이트**로 배포하면서도 방명록·참석 여부(RSVP)까지 받을 수 있게 만들었습니다.

## ✨ 주요 기능

- 🎬 **인트로 & 스크롤 애니메이션** — 스크롤에 맞춰 섹션이 부드럽게 등장
- 💍 **초대글 · 신랑/신부 소개 · 혼주 정보**
- ⏳ **예식일 카운트다운 & 달력**
- 🖼️ **갤러리(캐러셀 + 확대 보기)**
- 📍 **오시는 길** — 카카오/네이버 지도 + 길찾기 시트, 교통 안내
- ✍️ **방명록** · 🙋 **참석 여부(RSVP)** — Supabase 에 저장
- 💳 **계좌번호 복사** · 📞 **연락처(전화/문자)**
- 🎵 **배경음악** on/off
- 📤 **공유** — 카카오톡 미리보기(OG), 링크 복사, 초대장 이미지 저장

## 🛠 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| UI | React 19, TypeScript |
| 빌드 | Vite |
| 애니메이션 | Framer Motion (`LazyMotion`) |
| 스타일 | CSS Modules + CSS 변수(디자인 토큰) |
| 아이콘 | lucide-react |
| 백엔드(BaaS) | Supabase (PostgreSQL, RLS, RPC) |
| 지도 | Kakao Maps / Naver Maps |
| 이미지 저장 | html-to-image |
| 배포 | GitHub Actions → GitHub Pages |

## 🧩 어떻게 구현했나요?

- **콘텐츠와 코드 분리** — 이름·일정·장소·계좌 등은 전부 `src/data/` 에 모아 두어, 데이터 파일만 고치면 청첩장이 바뀝니다. 같은 데이터를 `vite.config.ts` 가 읽어 OG 메타태그도 빌드 시 자동 생성합니다.
- **섹션 단위 컴포넌트 + 지연 로딩** — 첫 화면(Hero, 초대글)만 먼저 불러오고 나머지는 `BelowFold` 청크로 늦게 로드해 모바일 첫 진입을 빠르게 했습니다.
- **정적 사이트에서 안전하게 DB 쓰기** — 서버가 없으므로 브라우저에서 Supabase 를 직접 호출하되, **RLS(행 수준 보안)** 로 권한을 막고 쓰기·삭제는 **RPC 함수**로만 허용했습니다. 브라우저에는 공개 가능한 anon 키만 사용합니다. (`supabase/schema.sql`)
- **가벼운 번들** — Framer Motion 은 필요한 기능만, 아이콘은 트리셰이킹, 지도·이미지 저장 라이브러리는 필요할 때만 로드합니다.
- **키가 없어도 동작** — 지도/Supabase 키가 없으면 해당 기능만 주소 카드 등으로 대체됩니다.
- **자동 배포** — `main` 에 push 하면 GitHub Actions 가 빌드해 GitHub Pages 에 배포합니다.

## 📁 폴더 구조

```text
├─ .github/workflows/deploy.yml   GitHub Pages 자동 배포
├─ supabase/schema.sql            DB 스키마 · RLS · RPC
├─ scripts/                       임시 이미지 생성 스크립트
├─ public/                        이미지 · 오디오 · OG 이미지
├─ docs/SETUP.md                  상세 설정/커스터마이징 가이드
└─ src/
   ├─ data/         ✏️ 콘텐츠 설정 (여기만 고치면 됨)
   ├─ components/   섹션별 컴포넌트
   ├─ hooks/  lib/  공통 훅 · 유틸(Supabase, 지도, 공유 등)
   └─ styles/       디자인 토큰 · 전역 스타일
```

## 🚀 실행 방법

```bash
npm install
cp .env.example .env    # 값 채우기 (없어도 기본 화면은 동작)
npm run dev             # 개발 서버
npm run build           # 프로덕션 빌드
```

환경변수, Supabase·지도 설정, 사진/BGM 교체, 배포 방법은 **[docs/SETUP.md](docs/SETUP.md)** 를 참고하세요.

## 🔐 보안 메모

`VITE_` 로 시작하는 환경변수는 빌드 결과물에 포함되어 공개됩니다. 그래서 `.env` 는 커밋하지 않고(`.gitignore`), 공개해도 되는 키(anon / JavaScript 키)만 사용합니다.

---

<div align="center">
Made with ♥ by <a href="https://github.com/Leeeyounghwan">Leeeyounghwan</a>
</div>
