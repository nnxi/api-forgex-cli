# api-forgex-cli

[![NPM Version](https://img.shields.io/npm/v/api-forgex-cli.svg)](https://www.npmjs.com/package/api-forgex-cli)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-black.svg?logo=github)](https://github.com/nnxi/api-forgex-cli)

확장 가능하고 모듈화된 Node.js(Express / Fastify) 백엔드 서버를 빠르게 구축하기 위한 스캐폴딩 CLI 도구입니다.  
대화형 프롬프트를 통해 **프레임워크(Express / Fastify)**, **데이터베이스(MySQL / PostgreSQL)**, **JWT 인증**, **회원(Users) API**, **자동 API 문서화(Express 전용)** 구성을 선택하면 필요한 코드와 환경을 즉시 생성합니다.

## 주요 기능

* **대화형 설정 (Interactive Setup):** 직관적인 CLI 프롬프트로 프로젝트 구성을 손쉽게 선택할 수 있습니다.
* **멀티 프레임워크 지원:** **Express** 또는 **Fastify** 중 원하는 백엔드 프레임워크를 선택해 스캐폴딩할 수 있습니다.
* **멀티 데이터베이스 지원:** **MySQL 8.0**(`mysql2`) 또는 **PostgreSQL 16**(`pg`) 중 원하는 DB를 선택하거나, DB 없이 생성할 수 있습니다.
* **모듈형 아키텍처:** 필요한 애드온(Database, JWT 인증, Users 도메인)만 선택하여 깔끔한 코드베이스를 유지합니다.
* **Docker Compose 자동 구성:** DB 선택 시 선택한 엔진에 맞춘 `docker-compose.yml`과 초기 스키마(`init.sql`)를 자동으로 생성합니다.
* **API 자동 문서화:** `nodejs-api-docgen` 연동을 통해 서버 실행 시 API 문서를 자동으로 생성하고 서빙합니다.
* **자동 패키지 설치:** 선택한 옵션에 필요한 의존성 패키지만 추출하여 자동으로 설치합니다.

## 사전 요구사항 (Prerequisites)

실행 전 아래 도구들이 설치되어 있어야 합니다.

* **Node.js:** `v20.0.0` 이상
* **Git:** 템플릿 클론에 필요
* **Docker & Docker Compose V2:** 데이터베이스(MySQL / PostgreSQL) 옵션 선택 시 필수

## 빠른 시작 (Quick Start)

전역 설치 없이 `npx`로 현재 디렉토리에서 바로 프로젝트를 생성할 수 있습니다.

```bash
# 새 프로젝트 생성
npx api-forgex-cli

# 버전 및 도움말 확인
npx api-forgex-cli -v
npx api-forgex-cli -h
```

## 실행 방법 및 스크립트

프로젝트 생성이 완료되면 해당 폴더로 이동하여 아래 명령어로 서버를 실행합니다.

```bash
cd my-project

# 데이터베이스 컨테이너 실행 (DB 옵션을 선택한 경우)
docker compose up -d

# 서버 실행 (기본 포트: 8080)
npm start

# 개발 모드 실행 (파일 변경 감지 --watch)
npm run dev

# API 문서 수동 생성 (nodejs-api-docgen 옵션을 선택한 경우)
npm run api-docgen
```

*참고: API 문서화 옵션을 선택한 경우 `npm start` 실행 시 `prestart` 훅을 통해 문서(`api-docs.html`)가 자동으로 생성됩니다.*

## 기본 제공 엔드포인트

| 메서드 | 경로 | 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | 기본 제공 | 서버 상태 확인 (`200 OK`) |
| `GET` | `/api-docs` | API 문서화 선택 시 | 생성된 API 문서 HTML 페이지 조회 |
| `POST` | `/api/users/register` | Users 도메인 선택 시 | 신규 회원가입 |
| `POST` | `/api/users/login` | Users 도메인 선택 시 | 이메일/비밀번호 로그인 및 JWT 발급 |
| `GET` | `/api/users/me` | Users 도메인 선택 시 | 내 프로필 조회 (`Bearer` 토큰 필요) |

## 기본 테스트 계정 (Users 도메인)

**Database**와 **Users 도메인** 옵션을 함께 선택하면 초기 데이터베이스(`init.sql`)에 5개의 테스트 계정이 자동으로 생성됩니다. 로그인 시에는 **`email`과 `password`**를 사용합니다.

> **모든 테스트 계정의 비밀번호는 `password` 입니다.**

| ID | Name / Nickname | Email (로그인 ID) | Status | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| `1` | `nnxi` | `nnxi@test.com` | `ACTIVE` | 정상 활성 계정 |
| `2` | `test1` | `test1@test.com` | `ACTIVE` | 정상 활성 계정 |
| `3` | `test2` | `test2@test.com` | `SUSPENDED` | 정지된 계정 (로그인 차단) |
| `4` | `test3` | `test3@test.com` | `ACTIVE` | 탈퇴 처리된 계정 (Soft-deleted, 로그인 차단) |
| `5` | `test4` | `test4@test.com` | `SUSPENDED` | 정지 및 탈퇴 처리된 계정 (로그인 차단) |

## 프론트엔드 데모 클라이언트

프론트엔드와 백엔드의 연동 흐름을 바로 테스트해 볼 수 있는 가벼운 데모 클라이언트를 제공합니다. 아래 저장소를 클론하여 기본 테스트 계정으로 JWT 인증 및 사용자 API를 손쉽게 테스트해 보세요.

* **데모 클라이언트 저장소:** [nnxi/api-forgex-demo](https://github.com/nnxi/api-forgex-demo)

## 라이선스

[MIT](LICENSE)