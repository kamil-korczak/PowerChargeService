import { Request, Response } from "express";
import logger from "../logger";
import { config } from "../config";
import token_cache from "../middleware/token_cache";
import auth_middleware from "../middleware/auth";


// TODO: implement real login using database
const login = async (req: Request, res: Response) => {
  const { username } = req.body;
  logger.info(`login: username[${username}]`);

  if (!username) {
    logger.info(`Authentication failed. No username.`);
    return res.status(401).json({ error: "Authentication failed" });
  }

  try {
    const user = {
      username: username,
    }

    const access_token = auth_middleware.generateAccessToken(user);
    const refresh_token = auth_middleware.generateRefreshToken(user.username);
    
    token_cache.setCache(access_token, user)

    return res
      .cookie('refresh_token', refresh_token,
        {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          maxAge: config.TOKEN.REFRESH_TOKEN_COOKIE_MAX_AGE,
        })
      .json({ access_token });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal error" });
  }
};


const refreshToken = async (req: Request, res: Response) => {
  const refresh_token = req.cookies?.refresh_token

  if (refresh_token) {

    // verify refresh token
    const result = auth_middleware.verifyRefreshToken(refresh_token)

    if (!result.success) {
      return res.status(403).json({ error: result.error });
    }

    const decoded_refresh_token: any = result.data

    // TODO: get user data
    const user = {
      username: decoded_refresh_token.username
    }

    // generate access token
    const access_token = auth_middleware.generateAccessToken(user);

    return res.json({ access_token })

  } else {
    return res.status(406).json({ message: "Unauthorized" })
  }
}

export default { login, refreshToken };
