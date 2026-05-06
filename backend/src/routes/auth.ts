import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req: Request, res: Response) => {
  const { credential } = req.body;
  if (!credential) {
    res.status(400).json({ error: 'credential required' });
    return;
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub) {
      res.status(401).json({ error: 'Invalid Google token' });
      return;
    }

    const token = jwt.sign(
      { userId: payload.sub, email: payload.email ?? '', name: payload.name ?? '' },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' },
    );

    res.json({
      token,
      user: { email: payload.email, name: payload.name, picture: payload.picture },
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

export default router;
