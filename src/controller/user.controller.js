import { compare, hash } from "bcrypt";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import userModel from "../model/user.model.js";
import { BaseException } from "../exception/base.exception.js";
import {
  ACCESS_TOKEN_EXPIRE_TIME,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRE_TIME,
  REFRESH_TOKEN_SECRET,
} from "../config/jwt.config.js";
import { sendMail } from "../utils/mail.utils.js";

const register = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    const foundedUser = await userModel.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (foundedUser) {
      // throw new BaseException(
      //   "User already exists, try another email or phone number",
      //   409
      // );
      return res.render("register", {
        error: "User already exists, try another email or phone number",
      });
    }

    const passwordHash = await hash(password, 10);

    const user = await userModel.create({
      email,
      phoneNumber,
      name,
      password: passwordHash,
    });

    await sendMail({
      to: email,
      subject: "Welcome",
      text: `Salom ${name}! Bizning Fast Food restoranimizda muvaffaqiyatli ro'yhatdan o'tdingiz`,
    });

    return res.redirect("/users/login");

    // res.status(201).send({
    //   message: "success",
    //   data: user,
    // });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      // throw new BaseException("User not found", 404);
      return res.render("login", { error: "User not found" });
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      // throw new BaseException("Invalid password", 401);
      return res.render("login", { error: "Invalid password" });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: +ACCESS_TOKEN_EXPIRE_TIME,
        algorithm: "HS256",
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: user.role },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: +REFRESH_TOKEN_EXPIRE_TIME,
        algorithm: "HS256",
      }
    );

    res.cookie("accessToken", accessToken, {
      maxAge: +ACCESS_TOKEN_EXPIRE_TIME * 1000,
      httpOnly: true,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: +REFRESH_TOKEN_EXPIRE_TIME * 1000,
      httpOnly: true,
    });

    res.cookie("user", JSON.stringify(user));

    return res.redirect("/");
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.render("forgot-password", {
        error: "User not found",
        message: null,
      });
    }

    const server_base_url = "http://localhost:3000";

    const token = crypto.randomBytes(50);
    user.token = token.toString("hex");

    await user.save();

    await sendMail({
      to: email,
      subject: "Reset password",
      html: `
      <h2>Quyidagi link orqali yangilang</h2>
      <a href="${server_base_url}/users/reset-password?token=${user.token}">Link</a>
      `,
    });

    res.render("forgot-password", {
      message: "Emailingizga link yuborildi!",
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { token } = req.query;
    console.log(password, token);

    if (!token) {
      return res.redirect("/users/login");
    }

    const user = await userModel.findOne({ token });

    if (!user) {
      return res.redirect("/users/forgot-password");
    }

    const passwordHash = await hash(password, 10);

    user.password = passwordHash;

    await user.save();

    res.render("reset-password", {
      message: "Password yangilandi",
      error: null,
      token: null,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().populate({
      path: "orders",
      populate: {
        path: "orderItems",
        populate: "food",
      },
    });

    res.send({
      message: "success",
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const data = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    const accessToken = jwt.sign(data, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRE_TIME,
      algorithm: "HS256",
    });

    const newRefreshToken = jwt.sign(data, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRE_TIME,
      algorithm: "HS256",
    });

    res.cookie("accessToken", accessToken, {
      expires: ACCESS_TOKEN_EXPIRE_TIME,
    });

    res.cookie("refreshToken", newRefreshToken, {
      expires: REFRESH_TOKEN_EXPIRE_TIME,
    });

    res.send({
      message: "success",
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new BaseException("Refresh token expired", 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new BaseException("Invalid refresh token", 400));
    } else {
      next(error);
    }
  }
};

export default {
  register,
  getAllUsers,
  login,
  refresh,
  forgotPassword,
  resetPassword,
};
