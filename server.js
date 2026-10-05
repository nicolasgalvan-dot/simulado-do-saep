import express from 'express';
import pg from 'pg';

const app = express();
app.use(express.json());
app.use(express.static('public'));

const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "iot",
    password: "senai",
    port: 5432
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const r = await pool.query(
    'SELECT id, nome FROM usuario WHERE email = $1 AND senha = $2',
    [email, senha]
  );
  if (r.rows.length === 0) return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
  res.json(r.rows[0]);
});

app.get('/produtos', async (req, res) => {
  const busca = '%' + (req.query.busca || '') + '%';
  const r = await pool.query('SELECT * FROM produtos WHERE nome ILIKE $1 ORDER BY id', [busca]);
  res.json(r.rows);
});

app.post('/produtos', async (req, res) => {
  const { nome, estoque, quantidade } = req.body;
  await pool.query(
    'INSERT INTO produtos (nome, estoque, quantidade) VALUES ($1, $2, $3)',
    [nome, estoque, quantidade]
  );
  res.json({ ok: true });
});

app.put('/produtos/:id', async (req, res) => {
  const { nome, estoque, quantidade } = req.body;
  await pool.query(
    'UPDATE produtos SET nome=$1, estoque=$2, quantidade=$3 WHERE id=$4',
    [nome, estoque, quantidade, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/produtos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM produtos WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch {
    res.status(400).json({ erro: 'Não foi possível excluir (produto tem movimentações).' });
  }
});

app.listen(3000, () => console.log('Abra http://localhost:3000'));
