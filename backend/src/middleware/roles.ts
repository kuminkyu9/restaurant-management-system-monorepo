// 역할: RBAC 권한 가드로, 특정 역할만 통과시키는 얇은 미들웨어

// 상세: requireRole('OWNER')처럼 호출해 OWNER만 접근 가능한 라우트를 선언적으로 표현함. 권한 부족 시 403을 반환해 인증 실패(401)와 명확히 구분

// src/middleware/roles.ts
import { Request, Response, NextFunction } from "express";

// requireRole(role)(req, res, next) 형태로 express에 등록
export function requireRole(role: "OWNER" | "STAFF") {  // role 매개 변수는 only "OWNER" 또는 "STAFF" 값을 가짐
    return (req: Request, res: Response, next: NextFunction) => {
        // @ts-ignore
        if (req.user?.role !== role) return res.status(403).json({ status: "error", message: "Forbidden" });
        next();
    };
}