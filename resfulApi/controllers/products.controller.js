const mongoose = require("mongoose");
const Product = require("../models/products");

function validateObject(obj) {
  const result = {};
  Object.keys(obj).map((key) => {
    if (obj[key]) result[key] = obj[key];
  });
  return Object.keys(result).length > 0 ? result : null;
}

exports.get_all_product = (req, res, next) => {
  let { name, type, price, currentPage, perPage } = req.query;
  if (!currentPage || !perPage) {
    return res.status(422).json({ message: "Please check params" });
  }
  currentPage = parseInt(currentPage);
  perPage = parseInt(perPage);
  const nameRegex = name ? new RegExp(name) : undefined;
  const typeRegex = type ? new RegExp(type) : undefined;
  const priceRegex = price ? new RegExp(price) : undefined;
  const findParams = validateObject({ name: nameRegex, type: typeRegex, price: priceRegex });

  Product.find(findParams)
    .select("name price _id image type")
    .exec()
    .then((docs) => {
      const result = docs.slice(
        currentPage * perPage,
        currentPage * perPage + perPage
      );
      const response = {
        total: docs.length,
        products: result.map((doc) => {
          return {
            _id: doc._id,
            name: doc.name,
            price: doc.price,
            image: doc.image,
            type: doc.type,
          };
        }),
        pagination: {
          currentPage,
          perPage,
        },
      };
      if (docs.length > 0) {
        res.status(200).json({ response });
      } else {
        res.status(404).json({ message: "No entries found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.post_product = (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    image: req.body.image,
    type: req.body.type,
  });
  product
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post Success",
        postResult: {
          id: result._id,
          name: result.name,
          price: result.price,
          image: result.image,
          type: result.type,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.get_product_by_id = (req, res, next) => {
  const id = req.params.productId;

  Product.findById(id)
    .select("name price _id image type role")
    .exec()
    .then((doc) => {
      res.status(200).json({
        message: "Get By Id Success",
        product: doc,
      });
    })
    .catch((err) => {
      res.status(404).json({
        error: "Product not found",
      });
    });
};

exports.delete_product = (req, res, next) => {
  const id = req.params.productId;
  Product.remove({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Delete Success",
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.patch_product = (req, res, next) => {
  console.log(typeof req.body);
  const { body } = req;
  const id = req.params.productId;
  const updateOps = {};
  //   for (const ops of req.body) {
  //     updateOps[ops.propName] = ops.value;
  //   }
  Product.update({ _id: id }, { $set: body })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Update Success",
        product: { _id: id, ...body },
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};
