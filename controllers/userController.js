import asyncHandler from "express-async-handler";
import Vendor from "../models/vendorModel.js";
import Product from "../models/productModel.js";
import Wishlist from "../models/wishlistModel.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import { checkVerification, sendVerification } from "../utils/twilioLogic.cjs";

import dotenv  from "dotenv"
dotenv.config()

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
import Stripe from 'stripe';
const stripe = new Stripe(STRIPE_SECRET_KEY);

const registerSentOTP = asyncHandler(async (req, res) => {
  try {
    const { phoneNo } = req.body;
    const user = await User.findOne({ phoneNo: phoneNo }).exec();
    if (user) {
      return res
        .status(200)
        .json({
          success: false,
          msg: "User already exists with this phone no",
        });
    }
    const verification = sendVerification(phoneNo);
    if (verification) {
      res.status(200).json({
        success: true,
        msg: "OTP sent successfully",
      });
    } else {
      res.status(200).json({ success: false, msg: "OTP not sent" });
    }
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

const registerVerifyOTP = asyncHandler(async (req, res) => {
  try {
    let { phoneNo, code } = req.body;
    const user = await User.findOne({ phoneNo: phoneNo }).exec();
    if (user) {
      return res
        .status(200)
        .json({
          success: false,
          msg: "User already exists with this phone no",
        });
    }
    const status = await checkVerification(phoneNo, code);
    if (status === "approved") {
      res.status(200).json({
        success: true,
        msg: "OTP verified",
        isVerified: true,
      });
    } else {
      res.status(200).json({ success: false, msg: "Incorrect OTP" });
    }
  } catch (error) {
    res.status(400).json({ success: false, msg: error.message });
  }
});

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, lastName, phoneNo, email, password, userName } = req.body;
    const user = await User.findOne({
      $or: [{ email: email }, { phoneNo: phoneNo }],
    }).exec();
    if (user) {
      return res
        .status(200)
        .json({ success: false, msg: "User already exists" });
    }
    const newUser = new User({
      name,
      lastName,
      phoneNo,
      userName,
      email,
      password,
    });
    var createdUser = await newUser.save();

    res.status(200).json({
      success: true,
      msg: "User created successfully",
      user: {
        name: createdUser.name,
        lastName: createdUser.lastName,
        userName: createdUser.userName,
        phoneNo: createdUser.phoneNo,
        email: createdUser.email,
        token: generateToken(createdUser._id),
      },
    });
  } catch (err) {
    console.log("====================================");
    console.log(err);
    console.log("====================================");
    res.status(500).json({ msg: err.message });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: email }],
    }).exec();
    if (!user) {
      return res.status(200).json({ success: false, msg: "User Not Found" });
    }
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        success: true,
        msg: "User logged in successfully",
        user: {
          name: user.name,
          lastName: user.lastName,
          userName: user.userName,
          phoneNo: user.phoneNo,
          email: user.email,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(200).json({ success: false, msg: "Invalid Password" });
    }
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

const loginSentOTP = asyncHandler(async (req, res) => {
  try {
    const { phoneNo } = req.body;
    const user = await User.findOne({ phoneNo: phoneNo }).exec();
    if (!user) {
      return res.status(200).json({ success: false, msg: "User Not Found" });
    }
    const verification = sendVerification(phoneNo);
    if (verification) {
      res.status(200).json({
        success: true,
        msg: "OTP sent successfully",
      });
    } else {
      res.status(200).json({ success: false, msg: "OTP not sent" });
    }
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

const loginVerifyOTP = asyncHandler(async (req, res) => {
  try {
    let { phoneNo, code } = req.body;
    const user = await User.findOne({ phoneNo: phoneNo }).exec();
    const status = await checkVerification(phoneNo, code);
    if (status === "approved") {
      res.status(200).json({
        success: true,
        msg: "OTP verified",
        isVerified: true,
        user: {
          name: user.name,
          lastName: user.lastName,
          // userName: user.userName,
          phoneNo: user.phoneNo,
          email: user.email,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(200).json({ success: false, msg: "Incorrect OTP" });
    }
  } catch (error) {
    res.status(400).json({ success: false, msg: error.message });
  }
});

const getProfile = asyncHandler(async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      msg: "User profile fetched successfully",
      user: req.user,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).select("-isDeleted");
    Object.keys(products).forEach(async (key) => {
      const reviews = products[key].reviews;
      if (reviews.length === 0) {
        products[key].rating = 0;
        await products[key].save();
        return;
      }
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      products[key].rating = averageRating;
      await products[key].save();
    });
    res.status(200).json({
      success: true,
      msg: "All products fetched successfully",
      products: products,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

const getByCategory = asyncHandler(async (req, res) => {
  try {
    if (req.params.subCategory === "all") {
      const products = await Product.find({
        category: req.params.category,
      }).select("-isDeleted");
      if (products.length === 0) {
        return res.status(200).json({
          success: false,
          msg: "No products found",
          products:[]
        });
      }
      res.status(200).json({
        success: true,
        msg: "All products fetched successfully",
        products: products,
      });
    } else {
      const products = await Product.find({
        category: req.params.category,
        subCategory: req.params.subCategory,
      }).select("-isDeleted");
      if (products.length === 0) {
        return res.status(200).json({
          success: false,
          msg: "No products found",
          products:[]
        });
      }
      res.status(200).json({
        success: true,
        msg: "All products fetched successfully",
        products: products,
      });
    }
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("-isDeleted");
    if (!product) {
      return res.status(200).json({
        success: false,
        msg: "No product found",
      });
    }
    const reviews = product.reviews;
    if (reviews.length === 0) {
      product.rating = 0;
      await product.save();
      return;
    }
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    product.rating = averageRating;
    await product.save();
    res.status(200).json({
      success: true,
      msg: "Product fetched successfully",
      product: product,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

const getAllVendors = asyncHandler(async (req, res) => {
  try {
    let vendors = await Vendor.find({})
    if (vendors) {
      res.status(200).json({ success: true, vendors: vendors })
    } else {
      res.status(200).json({ success: false, msg: 'No Vendors Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

const getVendorById = asyncHandler(async (req, res) => {
  try {
    const { verdorId } = req.body
    const findVendor = await Vendor.findOne({ _id: verdorId });
    if (findVendor) {
      res.status(200).json({ success: true, vendor: findVendor })
    } else {
      res.status(200).json({ success: false, msg: 'No Vendor Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

const placeOrder = asyncHandler(async (req, res) => {
  try {
    // let token = req.headers.authorization.split(' ')[1]
    // let vendorId = jwt.verify(token, process.env.JWT_SECRET)
    // let user = await User.findById(userId.id)
    // if (!user) {
    //   return res.status(500).json({ mess: 'User not Found' })
    // }
    // let cart = await Cart.findOne({
    //   userId: userId.id,
    //   status: 'shopping',
    // })
    // let vendor = await Store.findById(cart.vendorId.toString())
    // let subTotal = 0
    // let totalGST = 0
    // cart.products.forEach((ele) => {
    //   subTotal += ele.price
    //   totalGST += ele.gst
    // })

    // let orderaddress = await Address.findOne({ _id: req.body.addressId })
    // const couponCode = req.body.couponCode || null

    // const admin = await Admin.findById(process.env.ADMIN_ID)
    // let distFee = 0
    // let baseFare = admin.baseFare
    // // will modify this to let admin decide base Distance
    // if (req.body.distance > 10) {
    //   let remainingDistance = req.body.distance - 10
    //   distFee = remainingDistance * admin.distanceFee //distance Fee per km
    // }
    // // let serves = (subTotal / 100) * admin.serviceFee;
    // let cashRedeemed = (subTotal / 100) * vendor.cashback

    // if (couponCode) {
    //   let code = await Coupons.findOne({
    //     couponCode: req.body.couponCode.toString(),
    //   })
    //   const result = vendor.myCoupons.filter((ele) => {
    //     return ele.couponId.toString() == code._id.toString()
    //   })
    //   if (result && code) {
    //     const expiry = new Date(code.expiryDuration)
    //     const currDate = new Date(Date.now())
    //     if (expiry - currDate > 0) {
    //       if (code.isPercent) {
    //         const amount = subTotal
    //         const discount = (amount / 100) * code.amountOff
    //         subTotal = amount - discount
    //       } else {
    //         const amount = subTotal
    //         if (amount < code.amountOff) {
    //           return res.status(500).json('Coupon Not Applicable')
    //         }
    //         subTotal = amount - code.amountOff
    //       }
    //     } else {
    //       return res.status(500).json({ mess: 'Invalid Coupon Code' })
    //     }
    //   } else {
    //     return res.status(500).json({ mess: 'Invalid Coupon Code' })
    //   }
    // }
    // var Total =
    //   subTotal + totalGST + distFee + vendor.packagingCharge + admin.baseFare
    // let cashRemaining = req.body.cashbackUsed
    // if (cashRemaining > parseInt(Total)) {
    //   const mess = 'Cashback Used is greater than total amount Order declined'
    //   return res.status(500).json({ mess })
    // } else {
    //   const checkDate = new Date(Date.now())
    //   for (let i = 0; i < user.cashback.length; i++) {
    //     const expiry = new Date(user.cashback[i].expiryDate)
    //     if (expiry - checkDate > 0) {
    //       if (user.cashback[i].amount > cashRemaining) {
    //         user.cashback[i].amount = user.cashback[i].amount - cashRemaining
    //         Total = Total - cashRemaining
    //         user.cashbackAvailable = user.cashbackAvailable - cashRemaining
    //         cashRemaining = 0
    //       } else {
    //         cashRemaining = cashRemaining - user.cashback[i].amount
    //         Total = Total - user.cashback[i].amount
    //         user.cashbackAvailable =
    //           user.cashbackAvailable - user.cashback[i].amount
    //         user.cashback[i].amount = 0
    //       }
    //     } else {
    //       user.cashbackAvailable =
    //         user.cashbackAvailable - user.cashback[i].amount
    //       user.cashback[i].amount = 0
    //     }
    //   }
    // }
    // // // ******************************
    // user.cashbackAvailable += cashRedeemed
    // const today1 = new Date(Date.now())
    // today1.setDate(today1.getDate() + 30)

    // let cash = {
    //   expiryDate: today1,
    //   amount: cashRedeemed,
    // }
    // const result = user.cashback.filter((ele) => ele.amount != 0)
    // user.cashback = [...result, cash]
    // // // ******************************

    // await user.save()
    // let deliveryOption = req.body.deliveryOption || 'Home Delivery'
    // let DeliverySlot = {
    //   deliveryTime: req.body.deliverySlot,
    //   now: req.body.now,
    // }
    // if (!req.body.now) {
    //   Total = Total - admin.deliverLaterDiscount
    // }
    // if (deliveryOption == 'Takeway') {
    //   Total = Total - distFee - baseFare
    //   distFee = 0
    //   baseFare = 0
    // }

    let obj = {
      userId: "60f1b0b0b0b0b0b0b0b0b0b0",
      vendorId: vendorId.id,
      products: req.body.products,
      //   Total: parseInt(Total),
      //   GST: totalGST,
      subTotal: req.body.subTotal,
      deliveryAddress: req.body.deliveryAddress,
    };
    const newOrder = await Order.create(obj);
    // cart.status = 'Order Placed'
    // await cart.save()
    res.status(200).json({ success: true, msg: "Order Placed Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});

const getAllCategories = asyncHandler(async (req, res) => {
  try {
    //create categories

    const categories = [
      "Electronics",
      "Fashion",
      "Mobiles",
      "Appliances",
      "Beauty",
      "Toys",
      "Furniture",
      "Sports",
      "Accessories",
      "Footwear",
      "Home Decor",
      "Books",
      "Refurbished",
      "Others",
    ];
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});

const getOrderList = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    let userId = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(userId)
    if (!userId) {
      return res
        .status(200)
        .json({ success: false, msg: "Authentication Failed" });
    }
    const orders = await Order.find({ userId: userId.id })
      .populate("vendorId", "name")
      .populate("products.prodId", "name price disPrice");
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});

const giveOrder = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    let userId = jwt.verify(token, process.env.JWT_SECRET);
    if (!userId) {
      return res
        .status(200)
        .json({ success: false, msg: "Authentication Failed" });
    }
    const { products, prodQuantity } = req.body;
    const findOrder = await Order.findOne({
      userId: userId.id,
      vendorId: products.vendorId,
    });
    // console.log(findOrder,"findOrder");
    if (findOrder) {
      //same user and same vendor
      console.log("same user and same vendor");
      const findProduct = await Product.findOne({ _id: products._id });
      const findVendor = await Vendor.findOne({ _id: products.vendorId });
      const findOrderNotPaid = await Order.findOne({
        userId: userId.id,
        vendorId: products.vendorId,
        isPaid: false,
      });
      console.log(findOrderNotPaid);
      if (findOrderNotPaid) {
        //if order is not paid
        const obj = {
          prodId: products._id,
          prodImage: findProduct.image,
          quantity: prodQuantity,
        };
        findOrderNotPaid.deliveryAddress="a",
        findOrderNotPaid.products.push(obj);
        findOrderNotPaid.storeName = findVendor.storeName;
        findOrderNotPaid.subTotal += products.price * prodQuantity;
        findOrderNotPaid.total += products.price * prodQuantity;
        //findOrder.gst += products.gst
        findOrderNotPaid.discount += products.disPrice;
        const updatedOrder = await findOrderNotPaid.save();
      } else {
        //if order is paid
        const obj = {
          userId: userId.id,
          vendorId: products.vendorId,
          products: [
            {
              prodId: products._id,
              prodImage: findProduct.image,
              quantity: prodQuantity,
            },
          ],
          deliveryAddress:"a",
          storeName: findVendor.storeName,
          subTotal: products.price * prodQuantity,
          total: products.price * prodQuantity,
          gst: products.gst,
          discount: products.disPrice,
        };
        let newOrder = await Order.create(obj);
      }
    } else if (findOrder && findOrder.vendorId != products.vendorId) {
      //same user and different vendor
      console.log("same user and different vendor");
      const findProduct = await Product.findOne({ _id: products._id });
      const findVendor = await Vendor.findOne({ _id: products.vendorId });
      const obj = {
        userId: userId.id,
        vendorId: products.vendorId,
        products: [
          {
            prodId: products._id,
            prodImage: findProduct.image,
            quantity: prodQuantity,
          },
        ],
        deliveryAddress:"a",
        storeName: findVendor.storeName,
        subTotal: products.price * prodQuantity,
        total: products.price * prodQuantity,
        gst: products.gst,
        discount: products.disPrice,
      };
      let newOrder = await Order.create(obj);
    } else {
      //new user order
      console.log("new user order");
      const findProduct = await Product.findOne({ _id: products._id });
      const findVendor = await Vendor.findOne({ _id: products.vendorId });
      const obj = {
        userId: userId.id,
        vendorId: products.vendorId,
        products: [
          {
            prodId: products._id,
            prodImage: findProduct.image,
            quantity: prodQuantity,
          },
        ],
        deliveryAddress:"a",
        storeName: findVendor.storeName,
        subTotal: products.price * prodQuantity,
        total: products.price * prodQuantity,
        gst: products.gst,
        discount: products.disPrice,
      };
      // console.log(Order)
      let newOrder = await Order.create(obj);
    }
    res.status(200).json({ success: true, msg: "Added to cart Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});

const deleteOrder = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    let userId = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(userId)
    if (!userId) {
      return res
        .status(200)
        .json({ success: false, msg: "Authentication Failed" });
    }
    const { orderId, prodId } = req.body;
    const findProduct = await Product.findOne({ _id: prodId });
    const findOrder = await Order.findOne({ _id: orderId });
    findOrder.subTotal = findOrder.subTotal - findProduct.price;
    findOrder.total = findOrder.total - findProduct.price;
    findOrder.discount = findOrder.discount - findProduct.disPrice;
    await findOrder.save();
    Order.findOneAndUpdate(
      { _id: orderId },
      { $pull: { products: { prodId: prodId } } },
      { new: true },
      function (err, order) {
        if (err) {
          console.log(err);
        } else {
          console.log(order);
        }
      }
    );
    res.status(200).json({ success: true, msg: "Order Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});

const filterProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find(req.body);
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});

const checkout = asyncHandler(async (req, res) => {
  try {
    const { orderId, deliveryAddress } = req.body;
    const findOrder = await Order.findOne({ _id: orderId });
    findOrder.isPaid = true;
    findOrder.deliveryAddress = deliveryAddress;
    await findOrder.save();
    res.status(200).json({ success: true, msg: "Order Placed Successfully" });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ success: false, error });
  }
});
const paymentCreateCustomer = asyncHandler(async (req, res) => {
  try {
    const customer = await stripe.customers.create({
      name: req.body.name,
      email: req.body.email,
    });
    res.status(200).json({ success: true, customer })
  } catch (error) {
    res.status(500).json({ success: false, error })
  }
})

const paymentAddCard = asyncHandler(async (req, res) => {
  try {
    const { customer_id, card_Name, card_Number, card_CVC, cardExpMonth, cardExpYear } = req.body
    const cardToken = await stripe.tokens.create({
      card: {
        name: card_Name,
        number: card_Number,
        cvc: card_CVC,
        exp_month: cardExpMonth,
        exp_year: cardExpYear,
      },
    });
    const card = await stripe.customers.createSource(customer_id, {
      source: cardToken.id,
    });
    res.status(200).json({ success: true, card })
  } catch (error) {
    res.status(500).json({ success: false, error })
  }
})

const paymentCreateCharge = asyncHandler(async (req, res) => {
  try {
    const { customer_id, card_id, orderId, deliveryAddress } = req.body
    const findOrder = await Order.findOne({_id: orderId})
    const createCharge = await stripe.paymentIntents.create({
      amount: findOrder.total * 100,
      currency: 'inr',
      payment_method_types: ['card'],
      customer: customer_id,
      source: card_id,
      description: 'My First Test Charge (created for API docs)',
    });
    findOrder.isPaid = true
    findOrder.deliveryAddress = deliveryAddress;
    await findOrder.save()
    res.status(200).json({ success: true, createCharge })
  } catch (error) {
    res.status(500).json({ success: false, error })
  }
})

const paymentClientSecret = asyncHandler(async (req, res) => {
  try {
    const { client_secret,id } = req.body
    const paymentIntent = await stripe.paymentIntents.confirm(
      id,
      {payment_method: 'pm_card_visa'}
    );
    res.status(200).json({ success: true, paymentIntent })
  } catch (error) {
    res.status(500).json({ success: false, error })
  }
})

const addToWishlist = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    let userId = jwt.verify(token, process.env.JWT_SECRET);
    if (!userId) {
      return res.status(200).json({ success: false, msg: "Authentication Failed" });
    }
    const { productId } = req.body;
    const findProduct = await Product.findOne({ _id: productId });
    const findWishlist = await Wishlist.findOne({ userId: userId.id });
    if (!(findWishlist)){
      const obj = {
        userId: userId.id,
        products: [
          {
            prodId: findProduct._id,
            prodName: findProduct.name,
            prodImage: findProduct.image,
            price: findProduct.price,
            disPrice: findProduct.disPrice,
          },
        ],
      };
      await Wishlist.create(obj);
      res.status(201).json({ success: true, msg: "Product Added to Wishlist" });
    }
    else{
      let result=true;
      findWishlist.products.forEach((product) => {
        if (product.prodId.equals(findProduct._id)) result=false;
      });
      if(result === true){
      const obj = {
        prodId: findProduct._id,
        prodName: findProduct.name,
        prodImage: findProduct.image,
        price: findProduct.price,
        disPrice: findProduct.disPrice,
      };
      findWishlist.products.push(obj);
      await findWishlist.save();
      res.status(201).json({ success: true, msg: "Product Added to Wishlist" });
    }
    else return res.status(200).json({ success: false, msg: "Product Already Added to Wishlist" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});

const getWishlist = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    let userId = jwt.verify(token, process.env.JWT_SECRET);
    if (!userId) {
      return res.status(200).json({ success: false, msg: "Authentication Failed" });
    }
    const findWishlist = await Wishlist.findOne({ userId: userId.id });
    res.status(200).json({ success: true, wishlist: findWishlist });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});

const deleteWishlist = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    let userId = jwt.verify(token, process.env.JWT_SECRET);
    if (!userId) {
      return res.status(200).json({ success: false, msg: "Authentication Failed" });
    }
    const { productId } = req.body;
    Wishlist.findOneAndUpdate(
      { userId: userId.id },
      { $pull: { products: { prodId: productId } } },
      { new: true },
      function (err, order) {
        if (err) {
          console.log(err);
        } else {
          console.log(order);
        }
      }
    );
    res.status(200).json({ success: true, msg: "Product Deleted Successfully from Wishlist" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});

const addReview = asyncHandler(async (req, res) => {
  try {
    const { productId, rating, review } = req.body;
    let token = req.headers.authorization.split(" ")[1];
    let userId = jwt.verify(token, process.env.JWT_SECRET);
    if (!userId) {
      return res.status(200).json({ success: false, msg: "Authentication Failed" });
    }
    const user = await User.findOne({ _id: userId.id });
    const newReview = {
      userId: userId.id,
      userName: user.name+" "+user.lastName,
      rating: rating,
      review: review,
    };
    const findProduct = await Product.findOne({ _id: productId });
    findProduct.reviews.push(newReview);
    await findProduct.save();
    res.status(201).json({ success: true, msg: "Review Added Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});

const createCheckout = asyncHandler(async (req, res) => {
  const { orderId, deliveryAddress, name, phoneNo, altphoneNo } = req.body;
  const line_items = req.body.cartItems.map((item) => {
    console.log(item);
    return {
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.prodId.name,
          image: [item.prodImage.image],
          description: item.desc,
          metadata:{
            id: item.prodId._id
          }
        },
        unit_amount: item.prodId.disPrice > 0 ? item.prodId.disPrice * 100 : item.prodId.price * 100,
        //unit_amount: item.prodId.price * 100,
      },
      quantity: item.quantity,
    };
  })
  const session = await stripe.checkout.sessions.create({
   line_items,
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/checkout-success`,
    cancel_url: `${process.env.CLIENT_URL}/payment-error`,
  });
  // console.log(session)
  if(session.status === 'open'){
    const findOrder = await Order.findOne({_id: orderId});
    findOrder.isPaid = true
    findOrder.deliveryAddress = deliveryAddress;
    findOrder.name = name;
    findOrder.phoneNo = phoneNo;
    findOrder.altphoneNo = altphoneNo;
    await findOrder.save();
  }
  res.send({url: session.url});
});

const successfulOrderByCustId = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    let userId = jwt.verify(token, process.env.JWT_SECRET);
    if (!userId) {
      return res.status(200).json({ success: false, msg: "Authentication Failed" });
    }
  let data=[];
  const orders = await Order.find({ userId: userId.id })
  Object.keys(orders).forEach(function(key) {
      if(orders[key].isPaid === true){
        data.push(orders[key]);
      }
    })
    res.status(200).send(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
  
});

const getOrderbyOrderId = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    let userId = jwt.verify(token, process.env.JWT_SECRET);
    if (!userId) {
      return res.status(200).json({ success: false, msg: "Authentication Failed" });
    }
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId })
    .populate("vendorId", "name")
      .populate("products.prodId", "name price disPrice");
    res.status(200).send(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});


export {
  placeOrder,
  registerUser,
  loginUser,
  getProfile,
  getAllProducts,
  getByCategory,
  getProductById,
  getAllCategories,
  getAllVendors,
  getVendorById,
  getOrderList,
  giveOrder,
  deleteOrder,
  filterProducts,
  loginSentOTP,
  loginVerifyOTP,
  checkout,
  registerSentOTP,
  registerVerifyOTP,
  paymentCreateCustomer,
  paymentAddCard,
  paymentCreateCharge,
  paymentClientSecret,
  addToWishlist,
  getWishlist,
  deleteWishlist,
  addReview,
  createCheckout,
  successfulOrderByCustId,
  getOrderbyOrderId
};
