import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';

export function ApiPaginatedResponse(description = 'Paginated list') {
  return applyDecorators(
    ApiOkResponse({ description }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
  );
}
