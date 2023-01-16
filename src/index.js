const express = require('express');
const fs = require('fs').promises;

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';
const TALKER_NOT_FOUND = {
  message: 'Pessoa palestrante não encontrada',
};

const EMAIL_NOT_FOUND = {
  message: 'O campo "email" é obrigatório',
};
const INVALID_EMAIL = {
  message: 'O "email" deve ter o formato "email@email.com"',
};
const PASSWORD_NOT_FOUND = {
  message: 'O campo "password" é obrigatório',
};
const INVALID_PASSWORD = {
  message: 'O "password" deve ter pelo menos 6 caracteres',
};

const TOKEN_NOT_FOUND = {
  message: 'Token não encontrado',
};
const INVALID_TOKEN = {
  message: 'Token inválido',
};
const NAME_NOT_FOUND = {
  message: 'O campo "name" é obrigatório',
};
const INVALID_NAME = {
  message: 'O "name" deve ter pelo menos 3 caracteres',
};
const AGE_NOT_FOUND = {
  message: 'O campo "age" é obrigatório',
};
const INVALID_AGE = {
  message: 'A pessoa palestrante deve ser maior de idade',
};
const TALK_NOT_FOUND = {
  message: 'O campo "talk" é obrigatório',
};
const WATCHEDAT_NOT_FOUND = {
  message: 'O campo "watchedAt" é obrigatório',
};
const INVALID_WATCHEDAT = {
  message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
};
const RATE_NOT_FOUND = {
  message: 'O campo "rate" é obrigatório',
};
const INVALID_RATE = {
  message: 'O campo "rate" deve ser um inteiro de 1 à 5',
};

// A seguinte função teve a lógica obtida com o auxilio do seguinte link: 
// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
const generateToken = () => {
  let token = '';
  const charOptions = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm123456789';
  const tokenLength = 16;
  for (let i = 0; i < tokenLength; i += 1) {
    token += charOptions[Math.floor(Math.random() * (charOptions.length))];
  }
  return token;
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

app.post('/login', (req, res) => {
  const { body } = req;
  const { email, password } = body;
  if (!email) {
    return res.status(400).json(EMAIL_NOT_FOUND);
  }
  const validateEmail = email.toLowerCase()
  .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  if (!validateEmail) {
    return res.status(400).json(INVALID_EMAIL);
  }
  if (!password) {
    return res.status(400).json(PASSWORD_NOT_FOUND);
  }
  if (password.length < 6) {
    return res.status(400).json(INVALID_PASSWORD);
  }
  const token = generateToken();
  res.status(200).json({ token });
});

const validateToken = (token, res) => {
  if (!token) return res.status(401).json(TOKEN_NOT_FOUND);
  if (typeof token !== 'string') return res.status(401).json(INVALID_TOKEN);
  if (token.length !== 16) return res.status(401).json(INVALID_TOKEN);
};
const validateName = (name, res) => {
  if (!name) return res.status(400).json(NAME_NOT_FOUND);
  if (name.length < 3) res.status(400).json(INVALID_NAME);
};
const validateAge = (age, res) => {
  if (!age) return res.status(400).json(AGE_NOT_FOUND);
  if (age < 18) res.status(400).json(INVALID_AGE);
};
const validateTalk = (talk, res) => {
  if (!talk) return res.status(400).json(TALK_NOT_FOUND); 
  const { watchedAt } = talk;
  if (!watchedAt) return res.status(400).json(WATCHEDAT_NOT_FOUND);
  const formatDate = watchedAt
  .match(/^(0?[1-9]|[12][0-9]|3[01])[/](0?[1-9]|1[012])[/]\d{4}$/);
  if (!formatDate) return res.status(400).json(INVALID_WATCHEDAT);
};
const validateRate = (talk, res) => {
  const { rate } = talk;
  if (!rate) return res.status(400).json(RATE_NOT_FOUND);
  if (rate < 1 || rate > 5) return res.status(400).json(INVALID_RATE);
  if (!Number.isInteger(rate)) return res.status(400).json(INVALID_RATE);
};

app.post('/talker', async (req, res) => {
  const { headers: { authorization } } = req;
  const { body: { name, age, talk } } = req;
  try {
    validateToken(authorization, res);
    validateName(name, res);
    validateAge(age, res);
    validateTalk(talk, res);
    validateRate(talk, res);
    const data = await fs.readFile('src/talker.json', 'utf-8');
    const talkers = JSON.parse(data);
    const newData = [...talkers, { name, id: talkers.length + 1, age, talk }];
    await fs.writeFile('src/talker.json', JSON.stringify(newData));
    return res.status(201).json({ name, id: talkers.length + 1, age, talk });
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => {
  console.log('Online');
});

// João Matheus Silva Franca