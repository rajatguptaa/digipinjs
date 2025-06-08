import { Request, Response, NextFunction } from 'express';
import { getDigiPin } from './core';

/**
 * Express middleware: reads x-lat & x-lng headers, adds X-DIGIPIN
 */
export function digiPinMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const lat = parseFloat(req.header('x-lat') || '');
    const lng = parseFloat(req.header('x-lng') || '');
    if (!isNaN(lat) && !isNaN(lng)) {
      try {
        res.setHeader('X-DIGIPIN', getDigiPin(lat, lng));
      } catch (error) {
        // Silently handle out of bounds errors
        // The middleware will continue without setting X-DIGIPIN
      }
    }
    next();
  };
} 