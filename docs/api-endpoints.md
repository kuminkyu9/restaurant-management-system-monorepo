# API 엔드포인트 명세서

## 기본 정보
- **Base URL**: `http://localhost:3000/api`
- **인증 방식**: JWT Bearer Token
- **응답 형식**: JSON
- **Content-Type**: application/json

## 공통 응답 형식

### 성공 응답
{
   "success": true,
   "data": { ... },
   "message": "요청이 성공적으로 처리되었습니다"
}

### 에러 응답
{
   "success": false,
   "error": {
      "code": "VALIDATION_ERROR",
      "message": "입력값이 올바르지 않습니다",
       "details": { ... }
   }
}

## 인증 관련 API

### 1. 회원가입 (사장)
POST /auth/register
Content-Type: application/json

{
   "email": "owner@example.com",
   "password": "password123",
   "name": "김사장",
   "phone": "010-1234-5678"
}

Response: 201 Created
{
   "success": true,
   "data": {
      "user": {
         "id": 1,
         "email": "owner@example.com",
         "name": "김사장",
         "role": "OWNER"
      },
      "tokens": {
         "accessToken": "eyJhbGciOiJIUzI1NiIs...",
         "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
      }
   }
}

### 2. 로그인
POST /auth/login
Content-Type: application/json

{
   "email": "owner@example.com",
   "password": "password123"
}

Response: 200 OK (응답은 회원가입과 동일)

### 3. 토큰 갱신
POST /auth/refresh
Authorization: Bearer <refreshToken>

Response: 200 OK
{
   "success": true,
   "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
   }
}

## 상점 관리 API

### 4. 상점 생성 (사장)
POST /stores
Authorization: Bearer <accessToken>
Content-Type: application/json

{
   "name": "맛집카페",
   "description": "신선한 원두로 내린 커피",
   "address": "서울시 강남구 테헤란로 123",
   "phone": "02-1234-5678"
}

Response: 201 Created
{
   "success": true,
   "data": {
      "store": {
         "id": 1,
         "name": "맛집카페",
         "description": "신선한 원두로 내린 커피",
         "address": "서울시 강남구 테헤란로 123",
         "phone": "02-1234-5678",
         "ownerId": 1,
         "createdAt": "2025-08-22T10:00:00Z"
      }
   }
}

### 5. 상점 조회
GET /stores/:id
Authorization: Bearer <accessToken>

Response: 200 OK
{
   "success": true,
   "data": {
   "store": { ... }, // 위와 동일
   "tables": [
      {
         "id": 1,
         "name": "1번 테이블",
         "qrToken": "table_token_001",
         "capacity": 4,
         "isActive": true
      }
   ],
   "menuItems": [ ... ],
   "stats": {
      "totalOrders": 150,
      "todayOrders": 12,
      "revenue": 450000
      }
   }
}

### 6. 상점 정보 수정
PUT /stores/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
   "name": "맛집카페 강남점",
   "description": "새로운 설명"
}

Response: 200 OK (수정된 상점 정보 반환)

## 테이블 관리 API

### 7. 테이블 생성
POST /stores/:storeId/tables
Authorization: Bearer <accessToken>
Content-Type: application/json

{
   "name": "1번 테이블",
   "capacity": 4
}

Response: 201 Created
{
   "success": true,
   "data": {
   "table": {
      "id": 1,
      "storeId": 1,
      "name": "1번 테이블",
      "qrToken": "table_token_001",
      "capacity": 4,
      "qrCodeUrl": "/api/qr/table_token_001.png"
      }
   }
}

### 8. 테이블 목록 조회
GET /stores/:storeId/tables
Authorization: Bearer <accessToken>

Response: 200 OK
{
   "success": true,
   "data": {
      "tables": [
         {
            "id": 1,
            "name": "1번 테이블",
            "qrToken": "table_token_001",
            "capacity": 4,
            "isActive": true,
            "currentOrders": 0
         }
      ]
   }
}

### 9. QR 코드 재생성
PUT /tables/:id/qr
Authorization: Bearer <accessToken>

Response: 200 OK
{
   "success": true,
   "data": {
      "table": {
         "id": 1,
         "qrToken": "new_token_123",
         "qrCodeUrl": "/api/qr/new_token_123.png"
      }
   }
}

## 메뉴 관리 API

### 10. 메뉴 추가
POST /stores/:storeId/menu-items
Authorization: Bearer <accessToken>
Content-Type: application/json

{
   "categoryId": 1,
   "name": "아메리카노",
   "description": "깔끔하고 진한 원두의 맛",
   "price": 4000,
   "isPopular": true
}

Response: 201 Created
{
   "success": true,
   "data": {
   "menuItem": {
      "id": 1,
      "storeId": 1,
      "categoryId": 1,
      "name": "아메리카노",
      "description": "깔끔하고 진한 원두의 맛",
      "price": 4000,
      "isAvailable": true,
      "isPopular": true,
      "createdAt": "2025-08-22T10:00:00Z"
      }
   }
}

### 11. 메뉴 목록 조회 (사장용)
GET /stores/:storeId/menu-items
Authorization: Bearer <accessToken>
Query Parameters:

category: 카테고리 필터링

available: true/false

Response: 200 OK
{
   "success": true,
   "data": {
      "menuItems": [
         {
            "id": 1,
            "name": "아메리카노",
            "price": 4000,
            "isAvailable": true,
            "category": {
               "id": 1,
               "name": "커피"
            }
         }
      ],
      "categories": [
         {
            "id": 1,
            "name": "커피",
            "displayOrder": 1
         }
      ]
   }
}

### 12. 메뉴 수정
PUT /menu-items/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
   "price": 4200,
   "isAvailable": false
}

Response: 200 OK (수정된 메뉴 정보 반환)
Note: 실시간 브로드캐스트 발생 (Socket.IO)

### 13. 메뉴 조회 (손님용, 인증 불필요)
GET /public/stores/:storeId/menu
Query Parameters:

table: 테이블 토큰 (선택)

Response: 200 OK
{
   "success": true,
   "data": {
      "store": {
         "id": 1,
         "name": "맛집카페",
         "description": "신선한 원두로 내린 커피"
      },
      "categories": [
         {
            "id": 1,
            "name": "커피",
            "menuItems": [
               {
                  "id": 1,
                  "name": "아메리카노",
                  "description": "깔끔하고 진한 원두의 맛",
                  "price": 4000,
                  "imageUrl": null,
                  "isAvailable": true,
                  "isPopular": true
               }
            ]
         }
      ]
   }
}

## 주문 관리 API

### 14. 주문 생성 (손님용, 인증 불필요)
POST /public/orders
Content-Type: application/json
Idempotency-Key: unique_key_123 (중복 주문 방지)

{
   "storeId": 1,
   "tableToken": "table_token_001",
   "items": [
      {
         "menuItemId": 1,
         "quantity": 2,
         "unitPrice": 4000
      },
      {
         "menuItemId": 2,
         "quantity": 1,
         "unitPrice": 4500
      }
   ],
   "customerMemo": "얼음 적게 해주세요",
   "totalAmount": 12500
}

Response: 201 Created
{
   "success": true,
   "data": {
      "order": {
         "id": 1,
         "orderNumber": "#001",
         "storeId": 1,
         "tableId": 1,
         "status": "PENDING",
         "totalAmount": 12500,
         "customerMemo": "얼음 적게 해주세요",
         "items": [
            {
               "id": 1,
               "menuItemId": 1,
               "itemName": "아메리카노",
               "quantity": 2,
               "unitPrice": 4000,
               "subtotal": 8000
            }
         ],
         "createdAt": "2025-08-22T14:30:00Z"
      }
   }
}
Note: 실시간 브로드캐스트 발생 (직원에게 알림)

### 15. 주문 목록 조회 (직원용)
GET /stores/:storeId/orders
Authorization: Bearer <accessToken>
Query Parameters:

status: PENDING, COOKING, DONE

date: 2025-08-22

limit: 20

offset: 0

Response: 200 OK
{
   "success": true,
   "data": {
      "orders": [
         {
            "id": 1,
            "orderNumber": "#001",
            "status": "PENDING",
            "totalAmount": 12500,
            "table": {
               "id": 1,
               "name": "1번 테이블"
            },
            "itemsCount": 3,
            "createdAt": "2025-08-22T14:30:00Z"
         }
      ],
      "pagination": {
         "total": 45,
         "limit": 20,
         "offset": 0,
         "hasMore": true
      }
   }
}

### 16. 주문 상태 변경 (직원용)
PUT /orders/:id/status
Authorization: Bearer <accessToken>
Content-Type: application/json

{
   "status": "COOKING",
   "staffMemo": "5분 소요 예정",
   "estimatedMinutes": 5
}

Response: 200 OK
{
   "success": true,
   "data": {
      "order": {
         "id": 1,
         "status": "COOKING",
         "staffMemo": "5분 소요 예정",
         "estimatedMinutes": 5,
         "updatedAt": "2025-08-22T14:32:00Z"
      }
   }
}
Note: 실시간 브로드캐스트 발생 (손님에게 알림)

### 17. 주문 상세 조회
GET /orders/:id
Authorization: Bearer <accessToken>

Response: 200 OK
{
   "success": true,
   "data": {
      "order": {
         "id": 1,
         "orderNumber": "#001",
         "status": "COOKING",
         "totalAmount": 12500,
         "customerMemo": "얼음 적게 해주세요",
         "staffMemo": "5분 소요 예정",
         "store": {
            "id": 1,
            "name": "맛집카페"
         },
         "table": {
            "id": 1,
            "name": "1번 테이블"
         },
         "items": [
            {
               "id": 1,
               "itemName": "아메리카노",
               "quantity": 2,
               "unitPrice": 4000,
               "subtotal": 8000
            }
         ],
         "statusHistory": [
            {
               "status": "PENDING",
               "changedAt": "2025-08-22T14:30:00Z"
            },
            {
               "status": "COOKING",
               "changedAt": "2025-08-22T14:32:00Z",
               "changedBy": "이직원"
            }
         ],
         "createdAt": "2025-08-22T14:30:00Z"
      }
   }
}

## 기타 API

### 18. 테이블 토큰으로 정보 조회 (손님용)
GET /public/tables/:token
Response: 200 OK
{
   "success": true,
   "data": {
      "table": {
         "id": 1,
         "name": "1번 테이블",
         "store": {
            "id": 1,
            "name": "맛집카페"
         }
      }
   }
}

### 19. 서버 상태 체크
GET /health
Response: 200 OK
{
   "success": true,
   "data": {
      "status": "healthy",
      "timestamp": "2025-08-22T14:30:00Z",
      "database": "connected",
      "redis": "connected"
   }
}

### 20. QR 코드 이미지 다운로드
GET /qr/:token.png
Response: 200 OK
Content-Type: image/png
(QR 코드 PNG 이미지 바이너리 데이터)

## Socket.IO 이벤트

### 연결 및 인증
// 클라이언트 연결
const socket = io('http://localhost:3000', {
   auth: {
      token: 'Bearer jwt_token_here'
   }
});

// 매장별 룸 참여
socket.emit('join-store', { storeId: 1 });

### 실시간 이벤트

#### 새 주문 알림 (직원에게)
socket.on('order-created', (data) => {
// data: { orderId, orderNumber, tableId, tableName, totalAmount }
});

#### 주문 상태 변경 알림 (손님에게)
socket.on('order-status-changed', (data) => {
// data: { orderId, status, estimatedMinutes, staffMemo }
});

#### 메뉴 변경 알림 (모든 사용자에게)
socket.on('menu-updated', (data) => {
// data: { menuItemId, price, isAvailable }
});

## 에러 코드

| 코드 | 설명 | HTTP Status |
|------|------|-------------|
| VALIDATION_ERROR | 입력값 검증 실패 | 400 |
| UNAUTHORIZED | 인증 토큰 없음/만료 | 401 |
| FORBIDDEN | 권한 부족 | 403 |
| NOT_FOUND | 리소스 없음 | 404 |
| DUPLICATE_ORDER | 중복 주문 (멱등성 키) | 409 |
| INTERNAL_ERROR | 서버 내부 오류 | 500 |
