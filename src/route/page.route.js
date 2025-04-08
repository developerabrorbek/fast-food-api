import { Router } from "express";
import categoryModel from "../model/category.model.js";
import foodModel from "../model/food.model.js";

const pageRouter = Router();

pageRouter.get("/", async (req, res) => {
  const { category = "all" } = req.query;

  const categories = await categoryModel.find().populate("foods");
  const foods = await foodModel.find();
  const allCategory = {
    id: "all",
    name: "All",
    foods,
    isActive: true,
  };

  const categoryRes = [allCategory, ...categories];
  let foodRes = foods;

  categoryRes.forEach((r) => {
    if (r.id == category) {
      r.isActive = true;
      foodRes = r.foods;
    } else {
      r.isActive = false;
    }
  });

  res.render("index", { categories: categoryRes, foods: foodRes });
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
