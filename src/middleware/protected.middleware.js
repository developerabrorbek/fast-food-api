import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRE_TIME,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRE_TIME,
  REFRESH_TOKEN_SECRET,
} from "../config/jwt.config.js";
import { BaseException } from "../exception/base.exception.js";

export const Protected = (isProtected) => {
  return (req, res, next) => {
    if (!isProtected) {
      req.role = "VIEWER";
      return next();
    }

    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
      return res.redirect("/login");
    }

    if (!accessToken) {
      const data = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

      const newAccessToken = jwt.sign(data, ACCESS_TOKEN_SECRET, {
        expiresIn: +ACCESS_TOKEN_EXPIRE_TIME,
        algorithm: "HS256",
      });

      const newRefreshToken = jwt.sign(data, REFRESH_TOKEN_SECRET, {
        expiresIn: +REFRESH_TOKEN_EXPIRE_TIME,
        algorithm: "HS256",
      });

      res.cookie("accessToken", newAccessToken, {
        maxAge: +ACCESS_TOKEN_EXPIRE_TIME * 1000,
      });

      res.cookie("refreshToken", newRefreshToken, {
        maxAge: +REFRESH_TOKEN_EXPIRE_TIME * 1000,
      });

      return res.redirect(req.url);
    }

    try {
      const decodedData = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);

      req.role = decodedData.role;
      req.user = decodedData.user;

      next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return next(new BaseException("Token muddati eskirgan", 406));
      } else if (err instanceof jwt.JsonWebTokenError) {
        return next(
          new BaseException("JWT token xato formatda yuborildi", 400)
        );
      } else if (err instanceof jwt.NotBeforeError) {
        return next(new BaseException("Not Before Error", 409));
      } else {
        next(err);
      }
    }
  };
};
