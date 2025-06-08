import { expect } from 'chai';
import { Request, Response, NextFunction } from 'express';
import { digiPinMiddleware } from '../middleware';

describe('DigiPin Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      header: ((name: string) => undefined) as any
    };
    mockResponse = {
      setHeader: (name: string, value: string | number | readonly string[]): Response => {
        return mockResponse as Response;
      },
      status: (code: number): Response => {
        return mockResponse as Response;
      },
      json: (body: any): Response => {
        return mockResponse as Response;
      }
    };
    nextFunction = () => {};
  });

  it('should set X-DIGIPIN header for valid coordinates', () => {
    const lat = '28.6139';
    const lng = '77.2090';
    let headerSet = false;
    let headerValue = '';

    mockRequest.header = ((name: string) => {
      if (name === 'x-lat') return lat;
      if (name === 'x-lng') return lng;
      return undefined;
    }) as any;

    mockResponse.setHeader = (name: string, value: string | number | readonly string[]): Response => {
      if (name === 'X-DIGIPIN') {
        headerSet = true;
        headerValue = value as string;
      }
      return mockResponse as Response;
    };

    const middleware = digiPinMiddleware();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(headerSet).to.be.true;
    expect(headerValue).to.match(/^[FC98J327K456LMPT]{3}-[FC98J327K456LMPT]{3}-[FC98J327K456LMPT]{4}$/);
  });

  it('should not set X-DIGIPIN header for missing coordinates', () => {
    let headerSet = false;
    mockResponse.setHeader = (name: string, value: string | number | readonly string[]): Response => {
      headerSet = true;
      return mockResponse as Response;
    };

    const middleware = digiPinMiddleware();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(headerSet).to.be.false;
  });

  it('should not set X-DIGIPIN header for invalid coordinates', () => {
    let headerSet = false;
    mockRequest.header = (() => 'invalid') as any;
    
    mockResponse.setHeader = (name: string, value: string | number | readonly string[]): Response => {
      headerSet = true;
      return mockResponse as Response;
    };

    const middleware = digiPinMiddleware();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(headerSet).to.be.false;
  });

  it('should handle out of bounds coordinates', () => {
    let headerSet = false;
    mockRequest.header = ((name: string) => {
      if (name === 'x-lat') return '1.0'; // Below minLat
      if (name === 'x-lng') return '77.2090';
      return undefined;
    }) as any;

    mockResponse.setHeader = (name: string, value: string | number | readonly string[]): Response => {
      headerSet = true;
      return mockResponse as Response;
    };

    const middleware = digiPinMiddleware();
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(headerSet).to.be.false;
  });
}); 