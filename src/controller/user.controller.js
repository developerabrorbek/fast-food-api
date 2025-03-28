import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../model/user.model.js";
import { BaseException } from "../exception/base.exception.js";

const register = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    const foundedUser = await userModel.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (foundedUser) {
      throw new BaseException(
        "User already exists, try another email or phone number",
        409
      );
    }

    const passwordHash = await hash(password, 10);

    const user = await userModel.create({
      email,
      phoneNumber,
      name,
      password: passwordHash,
    });

    const token = jwt.sign({ id: user.id, role: user.role }, "o'ta_secret", {
      expiresIn: "2h",
      algorithm: "HS256",
    });

    res.status(201).send({
      message: "success",
      token: token,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      throw new BaseException("User not found", 404);
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      throw new BaseException("Invalid password", 401);
    }

    res.send({
      message: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();

    res.send({
      message: "success",
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export default { register, getAllUsers, login };