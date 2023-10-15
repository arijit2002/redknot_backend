import asyncHandler from 'express-async-handler'
import Vendor from '../models/vendorModel.js'
import Product from '../models/productModel.js'
import generateToken from '../utils/generateToken.js'
import jwt from 'jsonwebtoken'
//add Product
const addProduct = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    console.log(storeId)
    if (!storeId) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    // Add here to look for category and then use the gst inside that to the product controller
    // let category = await Category.findOne({
    //   subcategory: req.body.subcategory,
    // })
    let obj = {
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      subCategory: req.body.subCategory,
      veg: req.body.veg || true,
      qty: req.body.qty,
      price: req.body.price,
      disPrice: req.body.disPrice,
      gst: req.body.gst,
      description: req.body.description,
      vendorId: storeId.id,
      unit: req.body.unit,
      inStock: req.body.inStock,
    }
    // send price,qty,discount,unit,inStock as objects in variable array.
    let product = await Product.create(obj)
    const imageArray = req.body.imageArray
    if (imageArray) {
      imageArray.forEach((image) => {
        product.imageArray.push({ image })
      })
    }
    await product.save()
    res.status(200).json({ success: true, msg: 'Product Added Successfully' })
  } catch (err) {
    res.status(500).json({ success: false, msg: err })
  }
})

//get all products
const getProducts = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeId) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    // let store = await Store.findById(storeId.id);
    // let mycategory = await Category.find({
    //   parent: "null",
    //   subcategory: store.categories,
    // });
    if (req.params.category === 'all') {
      let products = await Product.find({
        vendorId: storeId.id,
      })
      res.status(200).json({ success: true, products })
    } else {
      let products = await Product.find({
        vendorId: storeId.id,
        category: req.params.category,
      })
      res.status(200).json({ success: true, products })
    }
  } catch (err) {
    res.status(500).json({ success: false, msg: err })
  }
})

//update product
const updateProduct = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeId) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    // const store = await Store.find({ _id: storeId.id.toString() });
    // if (store.isApproved == false) {
    //   return res.status(500).json("Registeration approval pending by admin");
    // }
    let exists = await Product.findById(req.params.id)
    if (exists) {
      exists.name = req.body.name || exists.name
      exists.image = req.body.image || exists.image
      exists.category = req.body.category || exists.category
      exists.subCategory = req.body.subCategory || exists.subCategory

      exists.veg = req.body.veg || exists.veg
      exists.qty = req.body.qty || exists.qty
      exists.price = req.body.price || exists.price
      exists.disPrice = req.body.disPrice || exists.disPrice
      exists.gst = req.body.gst || exists.gst
      exists.description = req.body.description || exists.description
      exists.unit = req.body.unit || exists.unit
      exists.inStock = req.body.inStock || exists.inStock

      await exists.save()
      res
        .status(200)
        .json({ success: true, msg: 'Product Updated Successfully' })
    } else {
      res
        .status(200)
        .json({ success: false, status: 404, msg: 'Product not found' })
    }
  } catch (err) {
    res.status(500).json({ success: false, msg: err })
  }
})

//delete product
const deleteProduct = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeId) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    const product = await Product.findById(req.params.id)
    if (product) {
      await product.remove()
      res.status(200).json({ success: true, msg: 'Product Deleted' })
    } else {
      res.status(200).json({ success: false, msg: 'Product Not Found ' })
    }
    // await Product.findById(req.params.productId)
    // res.status(200).json({ success: true, msg: 'Product Deleted' })
  } catch (error) {
    res.status(400).json({ error })
  }
})

export { addProduct, getProducts, updateProduct, deleteProduct }
