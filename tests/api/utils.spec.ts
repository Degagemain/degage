import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/logger', () => ({
  logger: { exception: vi.fn() },
}));

import { AppError } from '@/actions/app.error';
import { CarOnboardingCarNameTakenError } from '@/actions/car-onboarding/car-onboarding-car-name-taken.error';
import {
  NotFoundError,
  attachmentDownloadCsvResponse,
  attachmentDownloadJsonResponse,
  badRequestResponseFromZod,
  getIdFromRoute,
  isPrismaNotFoundError,
  isPrismaUniqueError,
  noContentResponse,
  notFoundResponse,
  responseFromCaughtError,
  safeParseRequestJson,
  tryCreateResource,
  tryDeleteResource,
  tryReadResource,
  tryUpdateResource,
} from '@/api/utils';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';

describe('API Utils', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('attachmentDownloadJsonResponse', () => {
    it('returns 200 with JSON Content-Type and attachment filename', async () => {
      const res = attachmentDownloadJsonResponse('{"a":1}', 'out.json');
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
      expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="out.json"');
      expect(await res.text()).toBe('{"a":1}');
    });
  });

  describe('attachmentDownloadCsvResponse', () => {
    it('returns 200 with CSV Content-Type and attachment filename', async () => {
      const res = attachmentDownloadCsvResponse('a,b', 'out.csv');
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
      expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="out.csv"');
      expect(await res.text()).toBe('a,b');
    });
  });

  describe('responseFromCaughtError', () => {
    it('maps ZodError to validation_error', async () => {
      const response = responseFromCaughtError(new ZodError([]));
      expect(response).not.toBeNull();
      expect(response!.status).toBe(400);
      expect((await response!.json()).code).toBe('validation_error');
    });

    it('maps AppError to its code and status', async () => {
      const response = responseFromCaughtError(new AppError('forbidden', 'nope', 403));
      expect(response).not.toBeNull();
      expect(response!.status).toBe(403);
      expect(await response!.json()).toEqual({
        code: 'forbidden',
        errors: [{ message: 'nope' }],
      });
    });

    it('maps NotFoundError as AppError', async () => {
      const response = responseFromCaughtError(new NotFoundError('gone'));
      expect(response).not.toBeNull();
      expect(response!.status).toBe(404);
      expect(await response!.json()).toEqual({
        code: 'not_found',
        errors: [{ message: 'gone' }],
      });
    });

    it('returns null for unexpected errors', () => {
      expect(responseFromCaughtError(new Error('boom'))).toBeNull();
    });

    it('maps Prisma unique errors to conflict', async () => {
      const response = responseFromCaughtError({ code: 'P2002' });
      expect(response).not.toBeNull();
      expect(response!.status).toBe(409);
      expect((await response!.json()).code).toBe('conflict');
    });
  });

  describe('isPrismaNotFoundError', () => {
    it('returns true for P2025 error code', () => {
      const error = { code: 'P2025' };
      expect(isPrismaNotFoundError(error)).toBe(true);
    });

    it('returns false for P2016 error code (query interpretation error, not record not found)', () => {
      const error = { code: 'P2016' };
      expect(isPrismaNotFoundError(error)).toBe(false);
    });

    it('returns false for other error codes', () => {
      const error = { code: 'P2002' };
      expect(isPrismaNotFoundError(error)).toBe(false);
    });

    it('returns false for non-object errors', () => {
      expect(isPrismaNotFoundError(null)).toBe(false);
      expect(isPrismaNotFoundError('error')).toBe(false);
    });
  });

  describe('isPrismaUniqueError', () => {
    it('returns true for P2002 error code', () => {
      expect(isPrismaUniqueError({ code: 'P2002' })).toBe(true);
    });

    it('returns false for other codes', () => {
      expect(isPrismaUniqueError({ code: 'P2025' })).toBe(false);
    });
  });

  describe('tryCreateResource', () => {
    it('should return a 201 response with created resource for valid data', async () => {
      const mockCreateResource = async (resource: any) => {
        return { ...resource, id: 1 };
      };

      const resource = { name: 'Valid Resource' };

      const response = await tryCreateResource(mockCreateResource, resource);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData).toHaveProperty('id');
      expect(responseData.name).toBe('Valid Resource');
    });

    it('should return a 400 response with structured error for Zod validation error', async () => {
      const mockCreateResource = async () => {
        throw new ZodError([]);
      };

      const resource = { name: '' }; // Invalid resource

      const response = await tryCreateResource(mockCreateResource, resource);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.code).toBe('validation_error');
      expect(responseData.errors).toBeDefined();
      expect(logger.exception).not.toHaveBeenCalled();
    });

    it('should return a 500 response with structured error for non-validation errors', async () => {
      const unexpected = new Error('Non-validation error');
      const mockCreateResource = async () => {
        throw unexpected;
      };

      const resource = { name: 'Valid Resource' };

      const response = await tryCreateResource(mockCreateResource, resource);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        code: 'internal_error',
        errors: [{ message: 'An unexpected error occurred' }],
      });
      expect(logger.exception).toHaveBeenCalledWith(unexpected, { helper: 'tryCreateResource' });
    });

    it('maps AppError to its code and HTTP status', async () => {
      const mockCreateResource = async () => {
        throw new AppError('conflict', 'already exists', 409);
      };

      const response = await tryCreateResource(mockCreateResource, { name: 'x' });
      const responseData = await response.json();

      expect(response.status).toBe(409);
      expect(responseData).toEqual({
        code: 'conflict',
        errors: [{ message: 'already exists' }],
      });
      expect(logger.exception).not.toHaveBeenCalled();
    });
  });

  describe('safeParseRequestJson', () => {
    it('returns deserialized data and null errorResponse for valid JSON', async () => {
      const body = { name: 'Test', count: 42 };
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const result = await safeParseRequestJson(request);

      expect(result.errorResponse).toBeNull();
      expect(result.data).toEqual(body);
    });

    it('returns null data and error Response for invalid JSON', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        body: 'not valid json {{{',
      });

      const result = await safeParseRequestJson(request);

      expect(result.data).toBeNull();
      expect(result.errorResponse).toBeInstanceOf(Response);
      expect(result.errorResponse!.status).toBe(400);
      const responseData = await result.errorResponse!.json();
      expect(responseData.code).toBe('invalid_json');
      expect(responseData.errors).toEqual([{ message: 'Invalid JSON in request body' }]);
    });
  });

  describe('fromZodParseResult', () => {
    it('should return a 400 response with error details for invalid parse result', async () => {
      const mockParseResult = {
        success: false,
        error: {
          issues: [
            {
              message: 'Invalid input',
              path: ['name'],
            },
          ],
        },
      } as any;

      const response = badRequestResponseFromZod(mockParseResult);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        code: 'invalid query parameters',
        errors: mockParseResult.error.issues,
      });
    });

    it('should return a 400 response with undefined errors when parse result has no error', async () => {
      const mockParseResult = {
        success: false,
        error: null,
      } as any;

      const response = badRequestResponseFromZod(mockParseResult);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        code: 'invalid query parameters',
        errors: undefined,
      });
    });
  });

  describe('noContentResponse', () => {
    it('should return a 204 No Content response', () => {
      const response = noContentResponse();

      expect(response.status).toBe(204);
      expect(response.body).toBeNull();
    });
  });

  describe('notFoundResponse', () => {
    it('should return a 404 Not Found response with default message', () => {
      const response = notFoundResponse();
      expect(response.status).toBe(404);
    });

    it('should return a 404 Not Found response with custom message', async () => {
      const response = notFoundResponse('Car not found');
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.code).toBe('not_found');
      expect(responseData.errors[0].message).toBe('Car not found');
    });
  });

  describe('getIdFromRoute', () => {
    it('should return the id from route params for valid UUID', async () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const mockRoute = {
        params: Promise.resolve({ id: validUUID }),
      };

      const result = await getIdFromRoute(mockRoute);

      expect(result).toBe(validUUID);
    });

    it('should throw error for invalid UUID', async () => {
      const invalidUUID = 'not-a-uuid';
      const mockRoute = {
        params: Promise.resolve({ id: invalidUUID }),
      };

      await expect(getIdFromRoute(mockRoute)).rejects.toThrow();
    });
  });

  describe('tryReadResource', () => {
    it('should return 200 response with resource for successful read', async () => {
      const mockResource = { id: '123', name: 'Test' };
      const mockReadResource = async () => mockResource;

      const response = await tryReadResource(mockReadResource, '123');
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockResource);
    });

    it('should return 404 response for Prisma not found error', async () => {
      const mockReadResource = async () => {
        throw { code: 'P2025' };
      };

      const response = await tryReadResource(mockReadResource, '123');

      expect(response.status).toBe(404);
      expect(logger.exception).not.toHaveBeenCalled();
    });

    it('should return 404 response for NotFoundError', async () => {
      const mockReadResource = async () => {
        throw new NotFoundError('Resource not found');
      };

      const response = await tryReadResource(mockReadResource, '123');

      expect(response.status).toBe(404);
      expect(logger.exception).not.toHaveBeenCalled();
    });

    it('should return 500 response with structured error for unexpected errors', async () => {
      const unexpected = new Error('Unexpected error');
      const mockReadResource = async () => {
        throw unexpected;
      };

      const response = await tryReadResource(mockReadResource, '123');
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        code: 'internal_error',
        errors: [{ message: 'An unexpected error occurred' }],
      });
      expect(logger.exception).toHaveBeenCalledWith(unexpected, { helper: 'tryReadResource' });
    });
  });

  describe('tryDeleteResource', () => {
    it('should return 204 response for successful delete', async () => {
      const mockDeleteResource = async () => {};

      const response = await tryDeleteResource(mockDeleteResource, '123');

      expect(response.status).toBe(204);
      expect(response.body).toBeNull();
    });

    it('should return 404 response for Prisma not found error', async () => {
      const mockDeleteResource = async () => {
        throw { code: 'P2025' };
      };

      const response = await tryDeleteResource(mockDeleteResource, '123');

      expect(response.status).toBe(404);
      expect(logger.exception).not.toHaveBeenCalled();
    });

    it('should return 404 response for NotFoundError', async () => {
      const mockDeleteResource = async () => {
        throw new NotFoundError('Resource not found');
      };

      const response = await tryDeleteResource(mockDeleteResource, '123');

      expect(response.status).toBe(404);
      expect(logger.exception).not.toHaveBeenCalled();
    });

    it('should return 500 response with structured error for unexpected errors', async () => {
      const unexpected = new Error('Unexpected error');
      const mockDeleteResource = async () => {
        throw unexpected;
      };

      const response = await tryDeleteResource(mockDeleteResource, '123');
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        code: 'internal_error',
        errors: [{ message: 'An unexpected error occurred' }],
      });
      expect(logger.exception).toHaveBeenCalledWith(unexpected, { helper: 'tryDeleteResource' });
    });
  });

  describe('tryUpdateResource', () => {
    it('should return no content response for successful update', async () => {
      const mockRequest = {
        json: async () => ({ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Updated Name' }),
      } as any;
      const mockRoute = {
        params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000' }),
      };
      const mockUpdateResource = async (resource: any) => resource;

      const response = await tryUpdateResource(mockRequest, mockRoute, mockUpdateResource);

      expect(response.status).toBe(204);
      expect(response.body).toBeNull();
    });

    it('should return 400 response for invalid JSON body', async () => {
      const mockRequest = {
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      } as any;
      const mockRoute = {
        params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000' }),
      };
      const mockUpdateResource = async (resource: any) => resource;

      const response = await tryUpdateResource(mockRequest, mockRoute, mockUpdateResource);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.code).toBe('invalid_json');
    });

    it('should return 400 response for id mismatch', async () => {
      const mockRequest = {
        json: async () => ({ id: 'different-id', name: 'Updated Name' }),
      } as any;
      const mockRoute = {
        params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000' }),
      };
      const mockUpdateResource = async (resource: any) => resource;

      const response = await tryUpdateResource(mockRequest, mockRoute, mockUpdateResource);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        code: 'id_mismatch',
        errors: [{ message: 'id in body does not match id in path' }],
      });
    });

    it('should return 400 response with structured error for Zod validation error', async () => {
      const mockRequest = {
        json: async () => ({ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Updated Name' }),
      } as any;
      const mockRoute = {
        params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000' }),
      };
      const mockUpdateResource = async () => {
        throw new ZodError([]);
      };

      const response = await tryUpdateResource(mockRequest, mockRoute, mockUpdateResource);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.code).toBe('validation_error');
    });

    it('should return 404 response for Prisma not found error', async () => {
      const mockRequest = {
        json: async () => ({ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Updated Name' }),
      } as any;
      const mockRoute = {
        params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000' }),
      };
      const mockUpdateResource = async () => {
        throw { code: 'P2025' };
      };

      const response = await tryUpdateResource(mockRequest, mockRoute, mockUpdateResource);

      expect(response.status).toBe(404);
      expect(logger.exception).not.toHaveBeenCalled();
    });

    it('should return 500 response with structured error for non-validation errors', async () => {
      const unexpected = new Error('Non-validation error');
      const mockRequest = {
        json: async () => ({ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Updated Name' }),
      } as any;
      const mockRoute = {
        params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000' }),
      };
      const mockUpdateResource = async () => {
        throw unexpected;
      };

      const response = await tryUpdateResource(mockRequest, mockRoute, mockUpdateResource);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        code: 'internal_error',
        errors: [{ message: 'An unexpected error occurred' }],
      });
      expect(logger.exception).toHaveBeenCalledWith(unexpected, { helper: 'tryUpdateResource' });
    });

    it('maps AppError subclasses without onboarding-specific instanceof checks', async () => {
      const mockRequest = {
        json: async () => ({ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Updated Name' }),
      } as any;
      const mockRoute = {
        params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000' }),
      };
      const mockUpdateResource = async () => {
        throw new CarOnboardingCarNameTakenError();
      };

      const response = await tryUpdateResource(mockRequest, mockRoute, mockUpdateResource);
      const responseData = await response.json();

      expect(response.status).toBe(409);
      expect(responseData).toEqual({
        code: 'car_name_taken',
        errors: [{ message: 'Car name is already taken' }],
      });
      expect(logger.exception).not.toHaveBeenCalled();
    });

    it('should throw error for invalid UUID in route params', async () => {
      const mockRequest = {
        json: async () => ({ id: 'invalid-uuid', name: 'Updated Name' }),
      } as any;
      const mockRoute = {
        params: Promise.resolve({ id: 'invalid-uuid' }),
      };
      const mockUpdateResource = async (resource: any) => resource;

      await expect(tryUpdateResource(mockRequest, mockRoute, mockUpdateResource)).rejects.toThrow();
    });
  });
});
