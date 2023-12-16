import NodeCache from "node-cache";
import { config } from "../config";
import logger from "../logger";

const token_cache = new NodeCache();

const ACCESS_TOKEN_CACHE_KEY_PREFIX = 'AT#'

/**
 * @desc Get and check cache of access token.
 * */
const getCache = (access_token: string) => {
  try {
    const cache_key = ACCESS_TOKEN_CACHE_KEY_PREFIX + access_token
    logger.debug(`getCache: access_token`)
    return token_cache.get(cache_key)
  } catch (error: any) {
    logger.error(`Check token cache error: ${error.message}`)
  }
};

/**
 * @desc Set access token in cache.
 * */
const setCache = (access_token: string, user: {}) => {
  try {
    logger.debug('setTokenCache: access_token')
    token_cache.set(ACCESS_TOKEN_CACHE_KEY_PREFIX + access_token, true, config.TOKEN.ACCESS_TOKEN_CACHE_IN_SECONDS)
    return { success: true, message: "" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export default {
  setCache,
  getCache,
};
