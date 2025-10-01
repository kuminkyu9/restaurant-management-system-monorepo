// 역할: JWT 액세스 토큰 검증 미들웨어

// 상세: Authorization 헤더의 Bearer 토큰을 파싱하고, 서명·만료를 검증해 사용자 식별자(id)와 역할(role)을 요청 컨텍스트에 주입. 실패 시 401을 즉시 반환해 보호 라우트의 기본 안전망이 됌

// src/middleware/auth.ts
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"; // JWT의 생성 및 검증 기능 제공

// JWT 페이로드의 타입 정의
type JwtPayload = { sub: string; role: "OWNER" | "STAFF"; iat: number; exp: number };

// authMiddleware(req, res, next) 형태로 express에 등록
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const header = req.header("Authorization");
    if (!header?.startsWith("Bearer ")) {   // Authorization 헤더가 존재하지 않거나, "Bearer(토큰 유형임)"로 시작하지 않는 경우를 검사
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    
    const token = header.slice("Bearer ".length);
    // JWT 토큰의 서명과 만료를 검증
    try {   
        const decoded = jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ["HS256"] }) as JwtPayload;
        // @ts-expect-error add user to request
        req.user = { id: decoded.sub, role: decoded.role };
        next();
    } catch {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
}