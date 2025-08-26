 
-- 상점 통합 관리 시스템 데이터베이스 스키마
-- 작성일: 2025.08.22
-- DB: PostgreSQL 14+

-- 사용자 테이블 (사장, 직원 통합)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'STAFF')),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 상점 테이블
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    address VARCHAR(500),
    phone VARCHAR(50),
    business_hours JSONB, -- {"open": "09:00", "close": "22:00"}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 직원-상점 관계 테이블 (다대다)
CREATE TABLE staff_stores (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    hourly_wage INTEGER DEFAULT 0, -- 시급 (원 단위)
    start_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(staff_id, store_id)
);

-- 테이블 관리
CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- "1번 테이블", "창가 A석" 등
    qr_token VARCHAR(255) UNIQUE NOT NULL,
    capacity INTEGER DEFAULT 4, -- 수용 인원
    is_active BOOLEAN DEFAULT true,
    position_x INTEGER DEFAULT 0, -- 매장 레이아웃 좌표 (추후 확장용)
    position_y INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 메뉴 카테고리
CREATE TABLE menu_categories (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- "커피", "디저트", "브런치" 등
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 메뉴 아이템
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES menu_categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price >= 0), -- 원 단위
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT true, -- 품절 여부
    is_popular BOOLEAN DEFAULT false, -- 인기 메뉴 표시
    display_order INTEGER DEFAULT 0,
    options JSONB, -- 사이즈, 온도 등 옵션 (추후 확장)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 주문
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    table_id INTEGER REFERENCES tables(id) ON DELETE SET NULL,
    order_number VARCHAR(50) NOT NULL, -- "#001", "#002" 형태
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'COOKING', 'DONE', 'CANCELLED')),
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
    customer_memo TEXT, -- 고객 요청사항
    staff_memo TEXT, -- 직원 메모
    estimated_minutes INTEGER, -- 예상 조리 시간
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 주문 아이템
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0), -- 주문 당시 가격 스냅샷
    item_name VARCHAR(200) NOT NULL, -- 주문 당시 메뉴명 스냅샷
    item_options JSONB, -- 선택된 옵션들 스냅샷
    subtotal INTEGER GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 멱등성 키 관리 (중복 주문 방지)
CREATE TABLE idempotency_keys (
    id SERIAL PRIMARY KEY,
    key_value VARCHAR(255) UNIQUE NOT NULL,
    scope VARCHAR(50) NOT NULL, -- "order_creation", "status_change" 등
    resource_type VARCHAR(50) NOT NULL, -- "order", "menu_item" 등
    resource_id INTEGER, -- 생성된 리소스 ID
    request_hash VARCHAR(255), -- 요청 데이터 해시
    response_data JSONB, -- 응답 데이터 저장
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL -- 24시간 후 자동 만료
);

-- 주문 상태 변경 이력 (추후 분석용)
CREATE TABLE order_status_logs (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    memo TEXT
);

-- 인덱스 생성
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_tables_store_id ON tables(store_id);
CREATE INDEX idx_tables_qr_token ON tables(qr_token);
CREATE INDEX idx_menu_items_store_id ON menu_items(store_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_idempotency_keys_expires_at ON idempotency_keys(expires_at);

-- 샘플 데이터 (개발/테스트용)
-- 사장 계정
INSERT INTO users (email, password_hash, role, name, phone) VALUES 
('owner@test.com', '$2b$10$example_hash', 'OWNER', '김사장', '010-1234-5678');

-- 직원 계정  
INSERT INTO users (email, password_hash, role, name, phone) VALUES 
('staff@test.com', '$2b$10$example_hash', 'STAFF', '이직원', '010-9876-5432');

-- 상점
INSERT INTO stores (owner_id, name, description, address, phone) VALUES 
(1, '맛집카페', '신선한 원두로 내린 커피와 수제 디저트', '서울시 강남구 테헤란로 123', '02-1234-5678');

-- 테이블
INSERT INTO tables (store_id, name, qr_token, capacity) VALUES 
(1, '1번 테이블', 'table_token_001', 4),
(1, '2번 테이블', 'table_token_002', 2),
(1, '3번 테이블', 'table_token_003', 6);

-- 메뉴 카테고리
INSERT INTO menu_categories (store_id, name, display_order) VALUES 
(1, '커피', 1),
(1, '음료', 2),
(1, '디저트', 3);

-- 메뉴 아이템
INSERT INTO menu_items (store_id, category_id, name, description, price, is_popular, display_order) VALUES 
(1, 1, '아메리카노', '깔끔하고 진한 원두의 맛', 4000, true, 1),
(1, 1, '카페라떼', '부드러운 우유와 에스프레소의 조화', 4500, true, 2),
(1, 1, '카푸치노', '진한 에스프레소와 부드러운 우유거품', 4500, false, 3),
(1, 2, '아이스티', '시원하고 상큼한 홍차', 3500, false, 4),
(1, 3, '치즈케이크', '진한 크림치즈의 부드러운 케이크', 6000, false, 5);
