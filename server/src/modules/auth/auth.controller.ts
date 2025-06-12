import { Router, Request, Response } from 'express';
import AuthService from './auth.service';
import { validate } from 'class-validator';
import { LoginDto, RegisterDto } from './auth.dto';

const router = Router();

router.route('/login')
  .post(async (req: Request, res: Response): Promise<void> => {
    const dto = Object.assign(new LoginDto(), req.body);
    const errors = await validate(dto);
    if (errors.length) {
      res.status(400).json({ errors });
      return;
    }
    try {
      const result = await AuthService.login(dto);
      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(401).json({ error: message });
    }
  });

router.route('/register')
  .post(async (req: Request, res: Response): Promise<void> => {
    const dto = Object.assign(new RegisterDto(), req.body);
    const errors = await validate(dto);
    if (errors.length) {
      res.status(400).json({ errors });
      return;
    }
    try {
      const result = await AuthService.register(dto);
      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  });

export default router; 