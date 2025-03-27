import { Router } from "express";
import userController from "../controller/user.controller.js";
import { ValidationMiddleware } from "../middleware/validation.middleware.js";
import { loginSchema, registerSchema } from "../schema/user.schema.js";

const userRouter = Router();

userRouter
  .get("/", userController.getAllUsers)
  .post(
    "/register",
    ValidationMiddleware(registerSchema),
    userController.register
  )
  .post("/login", ValidationMiddleware(loginSchema), userController.login);

export default userRouter;