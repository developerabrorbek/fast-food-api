import { Router } from "express";
import categoryController from "../controller/category.controller.js";

const categoryRouter = Router();

categoryRouter
  .get("/", categoryController.getAllCategories)
  .get("/:id", categoryController.getOneCategory)
  .post("/", categoryController.createCategory)
  .put("/:id", categoryController.updateCategory)
  .delete("/:id", categoryController.deleteCategory);

export default categoryRouter;