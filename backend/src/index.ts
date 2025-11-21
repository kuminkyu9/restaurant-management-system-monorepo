// 포트 읽고 app.listen으로 서버를 가동(테스트나 서버리스 환경에서 재사용 쉬움)

import app from "./app";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
});