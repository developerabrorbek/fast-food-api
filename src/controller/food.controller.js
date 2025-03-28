import { isValidObjectId } from "mongoose";
import categoryModel from "../model/category.model.js";
import foodModel from "../model/food.model.js";
import { BaseException } from "../exception/base.exception.js";

const getAllFoods = async (req, res, next) => {
  try {
    const foods = await foodModel
      .find()
      .populate("category", "-foods -createdAt -updatedAt")
      .select(["-createdAt", "-updatedAt"]);

    res.send({
      message: "success",
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    next(error);
  }
};

const getOneFood = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw new BaseException(`Given ID: ${id} is not valid Object ID`, 400);
    }

    const food = await foodModel
      .findById(id)
      .populate("category", "-foods -createdAt -updatedAt")
      .select(["-createdAt", "-updatedAt"]);

    res.send({
      message: "success",
      data: food,
    });
  } catch (error) {
    next(error);
  }
};

const createFood = async (req, res, next) => {
  try {
    const { name, price, category, description, imageUrl } = req.body;

    const foundedCategory = await categoryModel.findById(category);

    if (!foundedCategory) {
      throw new BaseException(`Category with ID: ${category} not found`, 400);
    }

    const food = await foodModel.create({
      name,
      price,
      category,
      description,
      imageUrl,
    });

    await categoryModel.updateOne(
      { _id: category },
      {
        $push: {
          foods: food._id,
        },
      }
    );

    res.status(201).send({
      message: "success",
      data: food,
    });
  } catch (error) {
    next(error);
  }
};

const updateFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;

    if (!isValidObjectId(id)) {
      throw new BaseException(`Given ID: ${id} is not valid Object ID`, 400);
    }

    const food = await foodModel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
      },
      {
        new: true,
      }
    );

    res.send({
      message: "yangilandi",
      data: food,
    });
  } catch (error) {
    next(error);
  }
};

const deleteFood = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw new BaseException(`Given ID: ${id} is not valid Object ID`, 400);
    }

    await foodModel.deleteOne({ _id: id });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export default { getAllFoods, getOneFood, createFood, updateFood, deleteFood };
