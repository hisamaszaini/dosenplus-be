import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | Record<string, string> = 'Terjadi kesalahan';

    if (typeof exceptionResponse === 'string') {
      // Single string error message
      message = exceptionResponse;
    } else if (exceptionResponse && typeof exceptionResponse === 'object') {
      if ('message' in exceptionResponse) {
        const messageContent = exceptionResponse['message'];

        if (typeof messageContent === 'string') {
          // Single string message
          message = messageContent;
        } else if (Array.isArray(messageContent)) {
          // Array of validation messages (dari class-validator)
          if (messageContent.length === 1) {
            message = messageContent[0];
          } else {
            // Convert array to object
            const errors: Record<string, string> = {};
            messageContent.forEach((msg, index) => {
              errors[`field_${index}`] = msg;
            });
            message = errors;
          }
        } else if (messageContent && typeof messageContent === 'object' && messageContent !== null) {
          // Object with field-specific errors (dari Zod atau custom)
          message = messageContent as Record<string, string>;
        }
      } else if (exceptionResponse !== null) {
        // Fallback untuk object response lainnya
        message = exceptionResponse as Record<string, string>;
      }
    }

    // Log error untuk debugging (opsional)
    if (status >= 500) {
      console.error('Server Error:', {
        status,
        message,
        stack: exception.stack,
        timestamp: new Date().toISOString(),
      });
    }

    response.status(status).json({
      success: false,
      message,
      data: null,
      // Tambahan info untuk development (opsional)
      ...(process.env.NODE_ENV === 'development' && {
        timestamp: new Date().toISOString(),
        path: ctx.getRequest().url,
      }),
    });
  }
}

// Custom exceptions untuk berbagai kasus
export class ValidationException extends HttpException {
  constructor(errors: Record<string, string>) {
    super({ message: errors }, HttpStatus.BAD_REQUEST);
  }
}

export class DuplicateException extends HttpException {
  constructor(field: string, value: string) {
    super(`${field} '${value}' sudah digunakan`, HttpStatus.CONFLICT);
  }
}

export class MultipleFieldException extends HttpException {
  constructor(errors: Record<string, string>) {
    super({ message: errors }, HttpStatus.CONFLICT);
  }
}