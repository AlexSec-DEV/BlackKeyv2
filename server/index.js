const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://black-keyv2.vercel.app',
  credentials: true
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/admin', require('./routes/admin')); 