// 역할: 회원가입/로그인 요청 데이터의 형식과 규칙 정의하고 검증

// src/schemas/auth.schema.ts
import { z } from "zod";

// 비밀번호에 영문과 숫자만 허용하는 정규표현식
const englishAlphaNumericRegex = /^[a-zA-Z0-9]+$/;

export const signupSchema = z.object({
    email: z.email(),
    // email: z.string(),
    // email: z.string().email(),
    password: z.string().min(8).max(72).regex(englishAlphaNumericRegex, "비밀번호는 영문과 숫자만 포함할 수 있습니다."),
    name: z.string().min(1).max(50),
    // name: z.string().min(1).max(50).optional(), // .optional()은 필수 입력값이 아님
    role: z.enum(["OWNER", "STAFF"]),
    // role: z.enum(["OWNER", "STAFF"]).optional(),
});

export const loginSchema = z.object({
    email: z.email(),   // 영문과 숫자
    // email: z.string(),
    // email: z.string().email(),
    password: z.string().min(8).max(72).regex(englishAlphaNumericRegex, "비밀번호는 영문과 숫자만 포함할 수 있습니다.")
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
