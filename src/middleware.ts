import { Request, Response, NextFunction } from 'express';
import { getDigiPin } from './core';

export interface DigiPinMiddlewareOptions {
  silent?: boolean;
  onError?: (error: unknown) => void;
}

/**
 * Express middleware: reads x-lat & x-lng headers, adds X-DIGIPIN
 */
export function digiPinMiddleware(options: DigiPinMiddlewareOptions = {}) {
  const { silent = true, onError } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const lat = parseFloat(req.header('x-lat') || '');
    const lng = parseFloat(req.header('x-lng') || '');
    if (!isNaN(lat) && !isNaN(lng)) {
      try {
        res.setHeader('X-DIGIPIN', getDigiPin(lat, lng));
      } catch (error) {
        if (onError) {
          onError(error);
        }
        if (!silent) {
          next(error);
          return;
        }
      }
    }
    next();
  };
}