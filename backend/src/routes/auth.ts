// 역할: HTTP 엔드포인트 정의 파일로, “요청을 받고 응답을 돌려주는” 얇은 계층

// 상세: 바디 검증(Zod) → 서비스 호출(signup/login) → 성공/실패를 표준 응답 형식으로 반환함. 라우터는 도메인별로 나누며 복잡한 로직은 들어가지 않도록 유지

// src/routes/auth.ts
import { Router } from "express";
import { signup, login } from "../services/auth.service";
import { signupSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/signup", async (req, res, next) => {
    try {
        const body = signupSchema.parse(req.body);
        const user = await signup(body);
        res.status(201).json({ status: "ok", data: user });
    } catch (err: any) {
        if (err.name === "ZodError") return res.status(422).json({ status: "error", message: err.errors });
        next(err);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const body = loginSchema.parse(req.body);
        const result = await login(body);
        res.json({ status: "ok", data: result });
    } catch (err: any) {
        if (err.name === "ZodError") return res.status(422).json({ status: "error", message: err.errors });
        next(err);
    }
});

export default router;
