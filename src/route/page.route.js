import { Router } from "express";

const pageRouter = Router();

pageRouter.get("/", (req, res) => {
  res.render("index");
});

pageRouter.get("/users/login", (req, res) => {
  res.render("login", { error: null });
});

pageRouter.get("/users/register", (req, res) => {
  res.render("register", { error: null });
});

pageRouter.get("/users/forgot-password", (req, res) => {
  res.render("forgot-password", { error: null, message: null });
});

pageRouter.get("/users/reset-password", (req, res) => {
  const { token } = req.query;
  res.render("reset-password", { error: null, message: null, token });
});

export default pageRouter;
