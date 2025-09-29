const express = require('express');

const app = express();
app.set('port', process.env.PORT || 3000);

app.get('/', (req, res) => {
    res.send('Hello express');
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});

// const express = require('express');

// const app = express();
// const PORT = process.env.PORT || 4000;

// app.get('/health', (req, res) => res.json({ ok: true }));

// app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));