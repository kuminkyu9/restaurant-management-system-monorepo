import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// import healthRouter from './routes/health';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
    try {
        // 캐시 무효화 헤더 추가 → 항상 새 응답을 받도록(304 방지) [8][14][17]
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate'); // ← 추가 [8][17]
        res.set('Pragma', 'no-cache'); // HTTP/1.0 호환 [14]
        res.set('Expires', '0');       // 즉시 만료 [14]

        await prisma.$queryRaw`SELECT 1`; // DB 연결 확인
        res.status(200).json({ status: 'okd', db: true });
    } catch (e: any) {
        res.status(500).json({ status: 'error', db: false, message: e?.message ?? 'db error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API http://localhost:${PORT}`));
