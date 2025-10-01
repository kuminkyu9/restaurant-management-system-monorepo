// 역할: 회원가입/로그인 요청 데이터의 형식과 규칙 정의하고 검증

// src/schemas/auth.schema.ts
import { z } from "zod";

export const signupSchema = z.object({
    email: z.string(),
    // email: z.string().email(),
    password: z.string().min(8).max(72),
    name: z.string().min(1).max(50).optional(),
    role: z.enum(["OWNER", "STAFF"]).optional(),
});

export const loginSchema = z.object({
    email: z.string(),
    // email: z.string().email(),
    password: z.string().min(8).max(72),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
