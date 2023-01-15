const express = require('express');
const fs = require('fs').promises;

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';
const TALKER_NOT_FOUND = {
  message: 'Pessoa palestrante não encontrada',
};

app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (req, res) => {
  try {
    const talkers = await fs.readFile('src/talker.json', 'utf-8');
    res.status(200).json(JSON.parse(talkers));
  } catch (error) {
    console.error(error);
  }
});

app.get('/talker/:id', async (req, res) => {
  try {
    const data = await fs.readFile('src/talker.json', 'utf-8');
    const talkers = JSON.parse(data);
    const talker = talkers.find((e) => e.id === Number(req.params.id));
    if (talker) return res.status(200).json(talker);
    return res.status(404).json(TALKER_NOT_FOUND);
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => {
  console.log('Online');
});

// João Matheus Silva Franca