import NodeCache from "node-cache";
import { config } from "../../../config";
import token_cache from "../../../middleware/token_cache";
import logger from "../../../logger";


jest.mock('node-cache');
const access_token = 'test_access_token'
const prefix_cache_key = 'AT#'
const expected_cache_key = prefix_cache_key + access_token


describe('Cache functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should set access token in cache', () => {
        const mock_set_cache = jest.spyOn(token_cache, 'setCache');

        const result = token_cache.setCache(access_token)

        expect(result).toEqual({ success: true, message: '' });
        expect(mock_set_cache).toHaveBeenCalledWith(access_token)
        expect(NodeCache.prototype.set).toHaveBeenCalledWith(expected_cache_key, true, config.TOKEN.ACCESS_TOKEN_CACHE_IN_SECONDS)
    });

    test('should get access token from cache', () => {
        const mock_get_cache = jest.spyOn(token_cache, 'getCache');
        (NodeCache.prototype.get as jest.Mock).mockReturnValue(true);

        const result = token_cache.getCache(access_token)

        expect(mock_get_cache).toHaveBeenLastCalledWith(access_token)
        expect(NodeCache.prototype.get).toHaveBeenCalledWith(expected_cache_key)
        expect(result).toEqual(true)
    });

    test('should not return access token from cache', () => {
        const access_token_not_in_cache = 'access_token_not_in_cache'
        const mock_get_cache = jest.spyOn(token_cache, 'getCache');
        (NodeCache.prototype.get as jest.Mock).mockReturnValue(undefined);

        const result = token_cache.getCache(access_token_not_in_cache)

        expect(mock_get_cache).toHaveBeenLastCalledWith(access_token_not_in_cache)
        expect(NodeCache.prototype.get).toHaveBeenCalledWith(prefix_cache_key + access_token_not_in_cache)
        expect(result).toBeUndefined()
    });

    test('getCache should handle errors and log them', () => {
        const mock_logger_error = jest.spyOn(logger, 'error');

        (NodeCache.prototype.get as jest.Mock).mockImplementation(() => {
            throw new Error("Mocked error")
        });

        const result = token_cache.getCache(access_token)

        expect(result).toBeUndefined()
        expect(mock_logger_error).toHaveBeenCalledWith(expect.stringContaining('getCache token error:'));
    })

});
