import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: mongoose.SchemaTypes.String,
      required: true,
      unique: true,
    },
    foods: {
      type: mongoose.SchemaTypes.Array,
      ref: "Food"
    }
  },
  {
    collection: "categories",
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Category", CategorySchema);
