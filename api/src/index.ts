import express from 'express';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Route to shorten a URL
app.post('/api/shorten', async (req, res) => {
  const { targetUrl } = req.body;

  if (!targetUrl || !targetUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const slug = nanoid(6);

  try {
    await prisma.url.create({
      data: {
        slug,
        targetUrl,
      },
    });

    res.json({ shortUrl: `http://localhost:${process.env.PORT}/${slug}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to shorten URL' });
  }
});

// Route to handle redirection
app.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const record = await prisma.url.findUnique({
      where: { slug },
    });

    if (!record) {
      return res.status(404).send('Short URL not found');
    }

    res.redirect(301, record.targetUrl);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server ready http://localhost:${process.env.PORT}`);
});
