 
# 시스템 아키텍처 문서

## 1. 전체 시스템 구조

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 사장 관리웹 │ │ 손님 주문웹 │ │ 직원 앱 │
│ (React) │ │ (React PWA) │ │ (React Native) │
│ │ │ │ │ │
│ - 상점 관리 │ │ - QR 스캔 │ │ - 주문 알림 │
│ - 메뉴 관리 │ │ - 메뉴 조회 │ │ - 상태 변경 │
│ - 주문 현황 │ │ - 주문 생성 │ │ - 주문 처리 │
│ - QR 생성 │ │ - 상태 확인 │ │ │
└─────────────────┘ └─────────────────┘ └─────────────────┘
│ │ │
│ │ │
└───────────────────────┼───────────────────────┘
│
┌─────────────────────────────────┐
│ API Gateway │
│ (Express.js Server) │
└─────────────────────────────────┘
│
┌───────────────────────┼───────────────────────┐
│ │ │
▼ ▼ ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Authentication │ │ Business │ │ Real-time │
│ Service │ │ Logic │ │ Service │
│ │ │ │ │ │
│ - JWT 토큰 │ │ - CRUD API │ │ - Socket.IO │
│ - 권한 검증 │ │ - 비즈니스 규칙 │ │ - 실시간 알림 │
│ - 세션 관리 │ │ - 데이터 검증 │ │ - 이벤트 브로드 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
│
▼
┌─────────────────────────────┐
│ Data Layer │
├─────────────────────────────┤
│ PostgreSQL Database │
│ │
│ - 사용자/상점 데이터 │
│ - 메뉴/주문 데이터 │
│ - 관계형 데이터 무결성 │
└─────────────────────────────┘
│
▼
┌─────────────────────────────┐
│ Cache Layer │
│ (Redis - 선택) │
│ │
│ - 세션 저장 │
│ - 메뉴 캐시 │
│ - 레이트 리밋 │
└─────────────────────────────┘

## 2. 기술 스택

### Frontend
## 사장 관리웹과 손님 주문앱은 통합으로 할꺼임(시간 없음)
- **사장 관리웹**: React 18 + Vite + Ant Design + React Query + Zustand
- **손님 주문웹**: React 18 + Vite + Ant Design Mobile + React Query + Zustand + PWA
- **직원 앱**: React Native 0.81 + React Navigation + React Native Paper + React Query + Zustand

### Backend
- **API Server**: Node.js 20 + Express 4.x + TypeScript (선택)
- **Real-time**: Socket.IO 4.x
- **Authentication**: JWT (jsonwebtoken)
- **Database**: PostgreSQL 14+ + Prisma ORM
- **Cache**: Redis 6+ (선택)

### DevOps
- **배포**: Vercel (Frontend) + Render/Railway (Backend)
- **CI/CD**: GitHub Actions
- **모니터링**: 기본 로깅 + Health Check

## 3. 데이터 플로우

### 3.1 주문 생성 플로우

손님 웹 (QR 스캔)
└── GET /public/tables/:token
└── 테이블 정보 확인 ✓

손님 웹 (메뉴 조회)
└── GET /public/stores/:id/menu
└── 메뉴 목록 + 가격 + 품절 여부 ✓

손님 웹 (주문 생성)
└── POST /public/orders + Idempotency-Key
├── 주문 데이터 DB 저장 ✓
├── 멱등성 키 검증 ✓
└── Socket.IO 이벤트 브로드캐스트 ✓

직원 앱 (실시간 알림)
└── socket.on('order-created')
└── 푸시 알림 + UI 업데이트 ✓

### 3.2 메뉴 실시간 동기화 플로우
사장 웹 (메뉴 수정)
└── PUT /menu-items/:id
├── DB 업데이트 ✓
├── 캐시 무효화 ✓
└── Socket.IO 브로드캐스트 ✓

손님 웹들 (실시간 반영)
└── socket.on('menu-updated')
├── React Query 캐시 무효화 ✓
└── UI 자동 리렌더링 ✓

직원 앱 (동기화)
└── socket.on('menu-updated')
└── 로컬 상태 업데이트 ✓

## 4. 보안 아키텍처

### 4.1 인증/인가 전략
┌─────────────────────────────────────────────────────────┐
│ Client Request │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ CORS Middleware │
│ - 허용된 도메인만 접근 │
│ - 적절한 HTTP 헤더 설정 │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ Authentication Middleware │
│ - JWT 토큰 검증 │
│ - Bearer 토큰 파싱 │
│ - 토큰 만료 체크 │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ Authorization Middleware │
│ - 사용자 역할 확인 (OWNER/STAFF) │
│ - 리소스 소유권 검증 │
│ - 매장별 데이터 격리 │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ Business Logic │
└─────────────────────────────────────────────────────────┘

### 4.2 데이터 보안
- **패스워드**: bcrypt 해싱 (saltRounds: 10)
- **JWT Secret**: 환경변수로 관리
- **DB 연결**: SSL 모드 활성화
- **입력 검증**: Zod 스키마 + 서버사이드 검증

## 5. 성능 최적화 전략

### 5.1 캐싱 전략
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Client Side │ │ Server Side │ │ Database │
│ │ │ │ │ │
│ React Query │◄───┤ Memory Cache │◄───┤ PostgreSQL │
│ - API 응답 캐시 │ │ - 메뉴 목록 │ │ - 원본 데이터 │
│ - 5분 TTL │ │ - 30초 TTL │ │ - 인덱스 최적화 │
│ - 백그라운드 │ │ │ │ │
│ 자동 갱신 │ │ Redis (선택) │ │ Connection Pool │
│ │ │ - 세션 저장 │ │ - 최대 20개 연결│
│ │ │ - 레이트 리밋 │ │ │
└─────────────────┘ └─────────────────┘ └─────────────────┘

### 5.2 실시간 성능
- **Socket.IO Room**: 매장별 격리 (store:{id})
- **이벤트 필터링**: 관련된 클라이언트에만 전송
- **재연결 처리**: 자동 재연결 + 상태 복구

## 6. 확장성 고려사항

### 6.1 수평 확장 준비
┌─────────────────┐ ┌─────────────────┐
│ Load Balancer │ │ API Server 1 │
│ │────┤ (Express) │
│ - NGINX │ │ Port: 3001 │
│ - Round Robin │ └─────────────────┘
│ - Health Check │ ┌─────────────────┐
│ │────┤ API Server 2 │
└─────────────────┘ │ (Express) │
│ Port: 3002 │
└─────────────────┘
│
▼
┌─────────────────────┐
│ Shared Database │
│ (PostgreSQL) │
└─────────────────────┘

### 6.2 데이터베이스 최적화
- **인덱스 전략**: 자주 조회되는 컬럼에 복합 인덱스
- **쿼리 최적화**: N+1 문제 방지, JOIN 최소화
- **파티셔닝**: 주문 데이터 날짜별 분할 (추후)

## 7. 모니터링 및 로깅

### 7.1 로깅 전략
{
    "timestamp": "2025-08-22T14:30:00.123Z",
    "level": "info",
    "requestId": "req_abc123",
    "userId": 1,
    "method": "POST",
    "url": "/api/orders",
    "statusCode": 201,
    "responseTime": 145,
    "userAgent": "Mozilla/5.0...",
    "ip": "192.168.1.100"
}

### 7.2 헬스 체크
GET /health
Response:
{
    "status": "healthy",
    "timestamp": "2025-08-22T14:30:00Z",
    "checks": {
        "database": {
            "status": "healthy",
            "responseTime": 12
        },
        "redis": {
            "status": "healthy",
            "responseTime": 3
        },
        "memory": {
            "usage": "45%",
            "available": "2.1GB"
        }
    }
}

## 8. 배포 아키텍처

### 8.1 개발/운영 환경 분리
Development:
├── Backend: localhost:3000
├── Admin Web: localhost:3001
├── Customer Web: localhost:3002
└── Database: localhost:5432

Production:
├── Backend: api.restaurant-system.com
├── Admin Web: admin.restaurant-system.com
├── Customer Web: order.restaurant-system.com
└── Database: managed-postgres-service

### 8.2 CI/CD 파이프라인
GitHub Push
│
▼
GitHub Actions
├── 코드 품질 검사 (ESLint, Prettier)
├── 테스트 실행 (Jest, React Testing Library)
├── 빌드 (npm run build)
└── 배포
├── Backend → Render/Railway
├── Admin Web → Vercel
└── Customer Web → Vercel

## 9. 트러블슈팅 가이드

### 9.1 자주 발생하는 문제
1. **Socket.IO 연결 끊김**
   - 원인: 네트워크 불안정, 서버 재시작
   - 해결: 자동 재연결 + 상태 복구 로직

2. **중복 주문 발생**
   - 원인: 네트워크 지연으로 인한 중복 클릭
   - 해결: Idempotency-Key + 프론트엔드 버튼 비활성화

3. **메뉴 동기화 지연**
   - 원인: Socket.IO Room 미참여
   - 해결: 연결 시 자동 Room 참여 로직

### 9.2 성능 문제 대응
1. **API 응답 지연**
   - 모니터링: 응답시간 > 200ms 시 알람
   - 최적화: 쿼리 튜닝, 인덱스 추가

2. **동시 접속자 급증**
   - 모니터링: 커넥션 수 > 80% 시 알람
   - 확장: 서버 인스턴스 추가

## 10. 보안 체크리스트

- [ ] HTTPS 적용 (운영 환경)
- [ ] JWT Secret 환경변수 관리
- [ ] 입력값 서버사이드 검증
- [ ] SQL Injection 방지 (Prisma ORM 사용)
- [ ] XSS 방지 (React 기본 보호)
- [ ] CSRF 토큰 (쿠키 사용 시)
- [ ] 레이트 리밋 적용
- [ ] 민감 정보 로그 제외
- [ ] DB 연결 SSL 활성화
- [ ] API 응답에 서버 정보 숨김
