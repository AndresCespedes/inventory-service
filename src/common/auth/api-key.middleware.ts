import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.path.startsWith('/api/docs')) {
      return next();
    }

    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('API Key inválida');
    }

    next();
  }
}
