import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import materialsRouter from './routes/materials.js';
import referencesRouter from './routes/references.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/materials', materialsRouter);
app.use('/api', referencesRouter);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Ошибка сервера. Повторите действие позже или обратитесь к администратору.' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Сервер запущен: http://localhost:${port}`);
});
