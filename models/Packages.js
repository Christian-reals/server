const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * This schema is created to allow for creation of new packages and removal of packages.
 *
 *
 */

const PackageSchema = new Schema({
  name: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  currency: { type: String, required: true },
  price: { type: Number, required: true },
  durationInDays: { type: Number },
  commisionRate: { type: Number, required: true },
  activeProducts: { type: Number, required: true },
  productInventory: { type: Number, required: true },
  imagesPerProduct: { type: Number, required: true },
});

const Package = mongoose.model("Package", PackageSchema);
module.exports = Package;
