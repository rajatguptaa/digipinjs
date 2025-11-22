import { expect } from 'chai';
import { digiPinMiddleware } from '../middleware';
import { Request, Response, NextFunction } from 'express';

describe('DigiPin Middleware Enhanced', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let headers: Record<string, string>;

    beforeEach(() => {
        headers = {};
        req = {
            header: ((name: string) => headers[name.toLowerCase()]) as any,
        };
        res = {
            setHeader: (name: string, value: string | string[]) => {
                headers[name] = value as string;
                return res as Response;
            },
        };
        next = () => { };
    });

    it('calls onError when provided', (done) => {
        headers['x-lat'] = '1000'; // Invalid lat
        headers['x-lng'] = '1000';

        const middleware = digiPinMiddleware({
            onError: (err) => {
                expect(err).to.be.instanceOf(Error);
                done();
            },
        });

        middleware(req as Request, res as Response, next);
    });

    it('propagates error when silent is false', (done) => {
        headers['x-lat'] = '1000';
        headers['x-lng'] = '1000';

        const middleware = digiPinMiddleware({ silent: false });

        next = (err) => {
            expect(err).to.be.instanceOf(Error);
            done();
        };

        middleware(req as Request, res as Response, next);
    });
});
