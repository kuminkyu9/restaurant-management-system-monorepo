// 역할: 인증 도메인의 핵심 비즈니스 로직을 담당

// 상세:
//      회원가입: 이메일 중복 확인, bcrypt 해시 생성, Prisma로 사용자 생성, 민감 정보 제외한 데이터 반환.
//      로그인: 사용자 조회, bcrypt 비교, JWT 생성 및 만료·클레임 설정.

// 의의: 라우트를 얇게 만들고, 테스트 가능한 순수 로직 단위로 재사용성을 높임

// src/services/auth.service.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

export async function signup(data: { email: string; password: string; name?: string; role?: "OWNER" | "STAFF" }) {
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw { status: 409, message: "Email already registered" };
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await prisma.user.create({
        data: { email: data.email, name: data.name, role: data.role ?? "STAFF", passwordHash },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return user;
}

export async function login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw { status: 401, message: "Invalid credentials" };
    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) throw { status: 401, message: "Invalid credentials" };

    const accessToken = jwt.sign(
        { sub: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { algorithm: "HS256", expiresIn: "1h" }
    );
    return {
        accessToken,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
}
