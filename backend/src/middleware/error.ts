// 역할: 전역 에러 핸들러로 앱 최종 방어선

// 상세: 모든 next(err)를 수집해 상태 코드, 메시지, 필요 시 에러 코드/필드 정보 등을 JSON 표준 응답으로 반환. 로깅을 추가하면 운영 단계의 관측성도 좋아짐

// src/middleware/error.ts

import { Request, Response, NextFunction } from "express";

// errorHandler(err, req, res, next) 형태로 express에 등록
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    const status = err.status ?? 500;
    const message = err.message ?? "Internal Server Error";
    res.status(status).json({ status: "error", message });
}