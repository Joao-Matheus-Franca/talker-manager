const express = require('express');
const fs = require('fs').promises;

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

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

app.listen(PORT, () => {
  console.log('Online');
});

// João Matheus Silva Franca