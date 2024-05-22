import express from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
import { load as yamlLoad } from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

let members = [];
let articles = [];

const openApiSpecPath = resolve(__dirname, 'openapi.yaml');
const openApiSpecContent = readFileSync(openApiSpecPath, 'utf8');
const openApiSpec = yamlLoad(openApiSpecContent);

const swaggerOptions = {
  definition: openApiSpec,
  apis: [],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/members', (req, res) => {
  res.json(members);
});

app.post('/members', (req, res) => {
  const newMember = req.body;
  members.push(newMember);
  res.status(201).json(newMember);
});

app.get('/members/:memberId', (req, res) => {
  const memberId = parseInt(req.params.memberId, 10);
  const member = members.find(m => m.id === memberId);
  if (member) {
    res.json(member);
  } else {
    res.status(404).json({ message: 'Member not found' });
  }
});

app.get('/members/:memberId/articles', (req, res) => {
  const memberId = parseInt(req.params.memberId, 10);
  const memberArticles = articles.filter(a => a.memberId === memberId);
  if (memberArticles.length > 0) {
    res.json(memberArticles);
  } else {
    res.status(404).json({ message: 'Member not found or no articles for this member' });
  }
});

app.post('/members/:memberId/articles', (req, res) => {
  const memberId = parseInt(req.params.memberId, 10);
  const newArticle = { ...req.body, memberId };
  articles.push(newArticle);
  res.status(201).json(newArticle);
});

app.delete('/articles/:articleId', (req, res) => {
  const articleId = parseInt(req.params.articleId, 10);
  const articleIndex = articles.findIndex(a => a.id === articleId);
  if (articleIndex !== -1) {
    articles.splice(articleIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Article not found' });
  }
});

app.patch('/articles/:articleId', (req, res) => {
  const articleId = parseInt(req.params.articleId, 10);
  const articleIndex = articles.findIndex(a => a.id === articleId);
  if (articleIndex !== -1) {
    articles[articleIndex] = { ...articles[articleIndex], ...req.body };
    res.json(articles[articleIndex]);
  } else {
    res.status(404).json({ message: 'Article not found' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
