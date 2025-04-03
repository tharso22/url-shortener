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
  const { targetUrl, expiresAt } = req.body;

  if (!targetUrl || !targetUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const existing = await prisma.url.findFirst({
      where: { targetUrl },
    });

    if (existing) {
      const isDifferentExpiration =
          (expiresAt && !existing.expiresAt) ||
          (!expiresAt && existing.expiresAt) ||
          (expiresAt && existing.expiresAt && new Date(expiresAt).getTime() !== new Date(existing.expiresAt).getTime());

      if (isDifferentExpiration) {
        await prisma.url.update({
          where: { slug: existing.slug },
          data: {
            expiresAt: expiresAt ? new Date(expiresAt) : null,
          },
        });
      }

      await prisma.url.update({
        where: { slug: existing.slug },
        data: { clicks: { increment: 1 } },
      });

      return res.json({
        shortUrl: `http://localhost:${process.env.PORT}/${existing.slug}`,
      });
    }

    const slug = nanoid(6);

    const created = await prisma.url.create({
      data: {
        slug,
        targetUrl,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
    });

    res.json({
      shortUrl: `http://localhost:${process.env.PORT}/${created.slug}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to shorten URL' });
  }
});


// Route to handle redirection
app.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const record = await prisma.url.findUnique({ where: { slug } });

    if (!record) {
      return res.status(404).send('Short URL not found');
    }

    if (record.expiresAt && new Date() > record.expiresAt) {
      return res.status(410).send('This link has expired');
    }

    await prisma.url.update({
      where: { slug },
      data: { clicks: { increment: 1 } },
    });

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
