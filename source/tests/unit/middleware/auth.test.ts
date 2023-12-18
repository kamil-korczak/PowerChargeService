import jwt from 'jsonwebtoken';
import middleware_auth from '../../../middleware/auth';
import { config } from '../../../config';
import logger = require('../../../logger');
import util from 'util';
import token_cache from '../../../middleware/token_cache';


jest.mock('jsonwebtoken');
jest.mock('../../../middleware/token_cache');
const mocked_jwt = jwt as jest.Mocked<typeof jwt>;
const user = { username: 'test_user' };


describe('middleware.auth', () => {

    test('generateAccessToken should generate a valid access token', () => {
        const expected_token = 'mocked_refresh_token'
        mocked_jwt.sign.mockImplementation(() => expected_token)
        const token = middleware_auth.generateAccessToken(user);
        logger.debug(`Access Token: ${token}`)
        expect(jwt.sign).toHaveBeenCalledWith(user, config.TOKEN.ACCESS_SECRET_KEY, { expiresIn: config.TOKEN.ACCESS_TOKEN_EXPIRATION });
        expect(token).toBe(expected_token);
    });

    test('generateRefreshToken should generate a valid refresh token', () => {
        const expected_token = 'mocked_refresh_token'
        mocked_jwt.sign.mockImplementation(() => "mocked_refresh_token")
        const token = middleware_auth.generateRefreshToken(user.username);
        logger.debug(`Refresh Token: ${token}`)
        expect(jwt.sign).toHaveBeenCalledWith(user, config.TOKEN.REFRESH_SECRET_KEY, { expiresIn: config.TOKEN.REFRESH_TOKEN_EXPIRATION });
        expect(token).toBe(expected_token);
    });

    test('verifyAccessToken should return decoded access token', () => {
        const expected_decoded_token = {
            user: user,
            iat: 1516239022,
            exp: 1516239122
        }
        const auth_token = "Bearer test_access_token"
        const access_token = auth_token.split(" ")[1]
        mocked_jwt.verify.mockImplementation(() => expected_decoded_token)
        const decoded_token = middleware_auth.verifyAccessToken(auth_token);
        logger.debug(`Decoded Access Token: ${util.inspect(decoded_token, { depth: null })}`)
        expect(jwt.verify).toHaveBeenCalledWith(access_token, config.TOKEN.ACCESS_SECRET_KEY);
        expect(decoded_token).toEqual({ success: true, data: expected_decoded_token });
    });

    test('verifyRefreshToken should return decoded refresh token', () => {
        const expected_decoded_token = {
            user: user,
            iat: 1516239033,
            exp: 1516239133
        }
        const refresh_token = "test_refresh_token"
        mocked_jwt.verify.mockImplementation(() => expected_decoded_token)
        const decoded_token = middleware_auth.verifyRefreshToken(refresh_token);
        logger.debug(`Decoded Refresh Token: ${util.inspect(decoded_token, { depth: null })}`)
        expect(jwt.verify, 'verifyRefreshToken should be called with "refresh_token" & "REFRESH_SECRET_KEY" ')
            .toHaveBeenCalledWith(refresh_token, config.TOKEN.REFRESH_SECRET_KEY);
        expect(decoded_token, 'Decoded refresh token should be equal.')
            .toEqual({ success: true, data: expected_decoded_token });
    });

    describe('authenticateToken function', () => {
        let req: any, res: any, next: any;

        beforeEach(() => {
            // Initialize req, res, and next for each test
            req = {
                header: jest.fn(),
            };
            res = {
                sendStatus: jest.fn(),
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            next = jest.fn();
        });

        test('authenticateToken should pass', () => {
            req.header.mockReturnValue('Bearer validToken');

            (jwt.verify as jest.Mock).mockReturnValue({ username: user.username, at: 1, exp: 1 });
            (token_cache.getCache as jest.Mock).mockImplementation(() => true)

            middleware_auth.authenticateToken(req, res, next);
            expect(req.header).toHaveBeenCalledWith('Authorization');
            expect(res.sendStatus).not.toHaveBeenCalled()
            expect(next).toHaveBeenCalled();
        });

        test('should return 401 if Authorization header is missing', () => {
            req.header.mockReturnValue(undefined);

            middleware_auth.authenticateToken(req, res, next);
            expect(req.header).toHaveBeenCalledWith('Authorization');
            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 403 if verifyAccessToken fails', () => {
            req.header.mockReturnValue('Bearer invalidToken');
            mocked_jwt.verify.mockImplementation(() => {
                throw new Error('Invalid Token')
            });

            middleware_auth.authenticateToken(req, res, next);

            expect(req.header).toHaveBeenCalledWith('Authorization');
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 403 if token is not in the cache', () => {
            req.header.mockReturnValue('Bearer validToken');
            (jwt.verify as jest.Mock).mockReturnValue({ username: user.username, at: 1, exp: 1 });
            (token_cache.getCache as jest.Mock).mockImplementation(() => undefined)

            middleware_auth.authenticateToken(req, res, next);

            expect(req.header).toHaveBeenCalledWith('Authorization');
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token.' });
            expect(next).not.toHaveBeenCalled();
        });
    });

});
