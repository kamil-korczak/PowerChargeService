import { config } from "../config";
import jwt, { JwtPayload } from "jsonwebtoken";
import logger from "../logger";
import token_cache from "./token_cache";
import util from 'util';


function generateToken(user: {}, secret_key: string, expire_in: string) {
  const jwt_options = { expiresIn: expire_in };
  const token = jwt.sign(user, secret_key, jwt_options,);
  return token;
}

function generateAccessToken(user: {}) {
  return generateToken(user, config.TOKEN.ACCESS_SECRET_KEY, config.TOKEN.ACCESS_TOKEN_EXPIRATION)
}

function generateRefreshToken(username: string) {
  return generateToken({ username: username }, config.TOKEN.REFRESH_SECRET_KEY, config.TOKEN.REFRESH_TOKEN_EXPIRATION)
}

function verifyToken(token: string, secret_key: string) {
  try {
    const decoded_token = jwt.verify(token, secret_key) as JwtPayload;
    return { success: true, data: decoded_token };
  } catch (error: any) {
    logger.info(`Unauthorized: ${error.message}`);
    return { success: false, error: "Unauthorized" };
  }
}

function verifyAccessToken(token: string) {
  return verifyToken(token.split(" ")[1], config.TOKEN.ACCESS_SECRET_KEY)
}

function verifyRefreshToken(token: string) {
  return verifyToken(token, config.TOKEN.REFRESH_SECRET_KEY)
}

function authenticateToken(req: any, res: any, next: any) {
  const auth_token = req.header("Authorization");
  logger.debug(`authenticateToken`);

  if (!auth_token) {
    return res.sendStatus(401);
  }
  const access_token = auth_token.split(" ")[1]

  const result: any = verifyAccessToken(auth_token);
  logger.debug(`verifyAccessToken result: ${util.inspect(result, { depth: null })}`);
  if (!result.success) {
    logger.error(`authenticateToken: ${result.error}`)
    return res.status(403).json({ error: result.error });
  }

  const cached_token: any = token_cache.getCache(access_token)
  logger.debug(`cached_token: ${util.inspect(cached_token, { depth: null })}`);
  if (!cached_token) {
    logger.debug('Invalid token. Token not found in cache.')
    return res.status(403).json({ error: "Invalid token." });
  }

  req.username = result.data.username;
  next()
}

export default {
  authenticateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
