import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.message || 'Error interno';
    const exceptionResponse = exception.getResponse() as any;

    this.logger.error(`Error ${status}: ${message} - ${request.url}`);

    // Convertir a formato de error JSON API
    const jsonApiError = {
      statusCode: status,
      message: exceptionResponse.message || message,
      error: exceptionResponse.error || HttpStatus[status],
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      },
    };

    response.status(status).json(jsonApiError);
  }
} 