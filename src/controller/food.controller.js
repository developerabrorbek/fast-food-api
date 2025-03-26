import categoryModel from "../model/category.model.js";
import foodModel from "../model/food.model.js";

const getAllFoods = async (req, res) => {
  const products = await foodModel.find().populate("category");

  res.send({
    message: "success",
    count: products.length,
    data: products,
  });
};

const createFood = async (req, res) => {
  const { name, price, category, description, imageUrl } = req.body;

  const foundedCategory = await categoryModel.findById(category);

  if (!foundedCategory) {
    return res.status(404).send({
      message: `Category with ID: ${category} not found`,
    });
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
};

export default { getAllFoods, createFood };
