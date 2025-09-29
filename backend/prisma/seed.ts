// backend/prisma/seed.ts
import { PrismaClient, UserRole, OrderStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // 1) OWNER 사용자
    const owner = await prisma.user.upsert({
        where: { email: 'owner@example.com' },
        update: {},
        create: {
            email: 'owner@example.com',
            passwordHash: 'REPLACE_WITH_BCRYPTED_HASH', // TODO: 실제 해시로 교체(암호화)
            role: UserRole.OWNER,   // enum UserRole { ADMIN, OWNER, STAFF, CUSTOMER 
        },
    });

    // 2) 매장
    const store = await prisma.store.upsert({
        where: { slug: 'gangnam-burger' },
        update: {},
        create: {
            name: 'Gangnam Burger', // 매장명
            slug: 'gangnam-burger', // slug는 고유해야 함
            ownerId: owner.id,
        },
    });

    // 3) 테이블들
    const tableCodes = ['T1', 'T2', 'T3'];
    const tables = [];
    for (const code of tableCodes) {
        const t = await prisma.table.upsert({
            // where: { // for composite unique, use a unique alias created via @@unique map
            // // Prisma needs a unique input name; define it in schema via @@unique and it becomes:
            // uq_table_store_code: { storeId: store.id, code },
            // } as any,
            where: {
                storeId_code: { storeId: store.id, code }, // ← 수정!
            },
            update: {},
            create: { storeId: store.id, code },
        });
        tables.push(t);
    }

    // 4) 메뉴 아이템들
    const menu = [
        { name: 'Classic Burger', price: 8900, sku: 'MB-CL' },  // sku: 재고관리코드
        { name: 'Cheese Burger',  price: 9900, sku: 'MB-CH' },
        { name: 'French Fries',   price: 3900, sku: 'SD-FF' },
    ];
    const menuItems = [];
    for (let i = 0; i < menu.length; i++) {
        const m = menu[i];
        const mi = await prisma.menuItem.upsert({
            where: {
                storeId_sku: { storeId: store.id, sku: m.sku },
            } as any,
            update: { name: m.name, price: m.price, displaySeq: i },
            create: {
                storeId: store.id,
                name: m.name,
                price: m.price,
                sku: m.sku,
                displaySeq: i,
            },
        });
        menuItems.push(mi);
    }

    // 5) 데모 주문 1건 (가격/이름 스냅샷)
    // const table = tables;
    const table = tables[0];    // 위에 코드는 gpt가 써준건대 잘못한 것 같아서 이거로 수정
    const orderItemsInput = [
        // { menuItem: menuItems, qty: 2 },
        { menuItem: menuItems[0], qty: 2 }, // Classic Burger x2    // 위에 코드는 gpt가 써준건대 잘못한 것 같아서 이거로 수정
        { menuItem: menuItems[2], qty: 1 }, // French Fries x1
    ];
    const total = orderItemsInput.reduce((sum, it) => sum + it.menuItem.price * it.qty, 0);

    // 멱등 데모: 같은 조합이면 다시 만들지 않고 findFirst로 확인
    const existing = await prisma.order.findFirst({
        where: { storeId: store.id, tableId: table.id, totalSnapshot: total, status: OrderStatus.PENDING },
    });

    if (!existing) {
        await prisma.order.create({
            data: {
                storeId: store.id,
                tableId: table.id,
                status: OrderStatus.PENDING,
                totalSnapshot: total,
                items: {
                    create: orderItemsInput.map((it) => ({
                        menuItemId: it.menuItem.id,
                        nameSnapshot: it.menuItem.name,
                        priceSnapshot: it.menuItem.price,
                        qty: it.qty,
                    })),
                },
            },
        });
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
