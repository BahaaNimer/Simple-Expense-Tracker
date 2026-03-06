import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/** Global exception filter: normalizes HTTP and unknown errors to a consistent JSON response. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    let errorResponse: Record<string, unknown>;
    if (
      typeof message === 'object' &&
      message !== null &&
      !Array.isArray(message)
    ) {
      errorResponse = message as Record<string, unknown>;
      if ('message' in errorResponse && Array.isArray(errorResponse.message)) {
        errorResponse.message = errorResponse.message.join(', ');
      }
    } else {
      errorResponse = { message: String(message) };
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${JSON.stringify(errorResponse)}`,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof errorResponse === 'object' && errorResponse !== null
        ? errorResponse
        : { message: errorResponse }),
    });
  }
}
