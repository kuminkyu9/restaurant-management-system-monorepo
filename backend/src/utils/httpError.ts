// 역할: 상태 코드와 메시지를 담는 에러 유틸리티

// 상세: HttpError 같은 커스텀 에러 클래스로 throw하면 전역 핸들러에서 상태/메시지를 표준 형태로 변환하기 쉬워짐. 서비스·미들웨어에서 예외를 일관되게 던지는 기준점을 제공

// src/utils/httpError.ts

// throw new HttpError(404, "Not Found") 와 같이 사용
export class HttpError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}