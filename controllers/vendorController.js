import asyncHandler from 'express-async-handler'
import Vendor from '../models/vendorModel.js'
import Payment from '../models/paymentModel.js'
import generateToken from '../utils/generateToken.js'
import jwt from 'jsonwebtoken'
import Order from '../models/orderModel.js'
import Product from '../models/productModel.js'
import UpdatedVendor from '../models/updateVendorModel.js'
import Employee from '../models/employeeModel.js'
//Register Store
const registerStore = asyncHandler(async (req, res) => {
  try {
    let { email, phoneNo } = req.body
    // let emailExists = await Vendor.findOne({ email: email })
    // if (emailExists) {
    //   return res
    //     .status(200)
    //     .json({ success: false, msg: 'Email already in use' })
    // }
    let phoneExists = await Vendor.findOne({ phoneNo: phoneNo })
    if (phoneExists) {
      return res
        .status(200)
        .json({ success: false, msg: 'PhoneNo already in use' })
    }

    const vendor = await Vendor.create(req.body)
    if (vendor) {
      res.status(201).json({
        success: true,
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phoneNo,
        isTermsAccepted: vendor.isTermsAccepted,
        isPaymentDone: vendor.isPaymentDone,
        token: generateToken(vendor._id),
      })
    } else {
      res.status(200).json({ success: false, msg: 'Invalid user data' })
    }
  } catch (error) {
    res.status(500).json({ msg: error })
  }
})
//Login Store
const loginStore = asyncHandler(async (req, res) => {
  try {
    let { phoneNo, password } = req.body
    const store = await Vendor.findOne({ phoneNo: phoneNo })
    if (!store) {
      return res.status(200).json({ success: false, msg: 'Store not found' })
    }
    if (await store.matchPassword(password)) {
      // store.password = null
      // let categories = store.categories
      res.json({
        success: true,
        _id: store._id,
        email: store.email,
        phone: store.phoneNo,
        isTermsAccepted: store.isTermsAccepted,
        isPaymentDone: store.isPaymentDone,
        token: generateToken(store._id),
        msg: 'Login Successful',
      })
    } else {
      res.status(200).json({ success: false, msg: `Password didn't match` })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
})
//Get User Profile
const getProfile = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeId) {
      return res.status(200).json({ success: false, msg: 'User not found' })
    }
    let store = await Vendor.findById(storeId.id)
    store.password = null
    res.status(200).json({ success: true, store })
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Internal server error' })
  }
})
const reqUpdateProfile = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeId) {
      return res.status(200).json({ success: false, msg: 'User not found' })
    }
    let vendor = await Vendor.findById(storeId.id)
    if (vendor) {
      vendor.isProfileChangeRequest = true

      const updatedVendor = await vendor.save()
      const obj = {
        fullName: req.body.fullName || vendor.fullName,
        storeName: req.body.storeName || vendor.storeName,
        email: req.body.email || vendor.email,
        phoneNo: req.body.phoneNo || vendor.phoneNo,
        address: req.body.address || vendor.address,
        storeImage: req.body.storeImage || vendor.storeImage,
        storeCategory: req.body.storeCategory || vendor.storeCategory,
        storeId: storeId.id,
        gst: req.body.gst || vendor.gst,
        pan: req.body.pan || vendor.pan,
        bankName: req.body.bankName || vendor.bankName,
        licenseNo: req.body.licenseNo || vendor.licenseNo,
        accountHolder: req.body.accountHolder || vendor.accountHolder,
        accountNo: req.body.accountNo || vendor.accountNo,
        ifsc: req.body.ifsc || vendor.ifsc,
      }
      const updateVendorRequest = await UpdatedVendor.create(obj)
      res.status(200).json({
        success: true,
        msg: 'Update Profile Request Sent to Admin',
        updateVendorRequest,
      })
    } else {
      res.status(200).json({ success: false, msg: 'Vendor not found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Internal server error' })
  }
})

const updateProfile = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeId) {
      return res.status(200).json({ success: false, msg: 'User not found' })
    }
    let vendor = await Vendor.findById(storeId.id)
    if (vendor) {
      vendor.fullName = req.body.fullName || vendor.fullName
      vendor.storeName = req.body.storeName || vendor.storeName
      vendor.email = req.body.email || vendor.email
      vendor.phoneNo = req.body.phoneNo || vendor.phoneNo
      vendor.address = req.body.address || vendor.address
      vendor.storeImage = req.body.storeImage || vendor.storeImage
      vendor.storeCategory = req.body.storeCategory || vendor.storeCategory
      vendor.gst = req.body.gst || vendor.gst
      vendor.pan = req.body.pan || vendor.pan
      vendor.bankName = req.body.bankName || vendor.bankName
      vendor.licenseNo = req.body.licenseNo || vendor.licenseNo
      vendor.accountHolder = req.body.accountHolder || vendor.accountHolder
      vendor.accountNo = req.body.accountNo || vendor.accountNo
      vendor.ifsc = req.body.ifsc || vendor.ifsc
      //toggle payment status
      req.body.isPaymentDone == undefined
        ? (vendor.isPaymentDone = vendor.isPaymentDone)
        : (vendor.isPaymentDone = req.body.isPaymentDone)
      req.body.isTermsAccepted == undefined
        ? (vendor.isTermsAccepted = vendor.isTermsAccepted)
        : (vendor.isTermsAccepted = req.body.isTermsAccepted)
      req.body.isProfileChangeRequest == undefined
        ? (vendor.isProfileChangeRequest = vendor.isProfileChangeRequest)
        : (vendor.isProfileChangeRequest = req.body.isProfileChangeRequest)

      const updatedVendor = await vendor.save()
      updatedVendor.password = null
      res
        .status(200)
        .json({ success: true, msg: 'Vendor Details Updated', updatedVendor })
    } else {
      res.status(200).json({ success: false, msg: 'Vendor not found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Internal server error' })
  }
})

//Update User Password
const changePassword = asyncHandler(async (req, res) => {
  try {
    let { phoneNo } = req.body
    let user = await Vendor.findOne({ phoneNo: phoneNo })
    if (user && (await user.matchPassword(req.body.password))) {
      user.password = req.body.newPassword
      await user.save()
      return res.status(200).json({ success: true, msg: 'Password updated' })
    }
    res.status(200).json({ success: false, msg: 'Invalid email or password' })
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Internal server error' })
  }
})
//Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  try {
    let { phoneNo } = req.body
    let user = await Vendor.findOne({ phoneNo: phoneNo })
    if (user) {
      user.password = req.body.newPassword
      await user.save()
      return res.status(200).json({ success: true, msg: 'Password updated' })
    }
    res.status(200).json({ success: false, msg: 'Invalid email or password' })
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Internal server error' })
  }
})
// Go Offline
const goOffline = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeId) {
      return res.status(200).json({ success: false, msg: 'User not found' })
    }
    let store = await Vendor.findById(storeId.id)
    store.online = false
    await store.save()
    res.status(200).json({ success: true, msg: 'Vendor is Offline' })
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Internal server error' })
  }
})
// Go Online
const goOnline = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeId) {
      return res.status(200).json({ success: false, msg: 'User not found' })
    }
    let store = await Vendor.findById(storeId.id)
    store.online = true
    await store.save()
    res.status(200).json({ success: true, msg: 'Vendor is Online' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, msg: 'Internal server error' })
  }
})
//Get Wallet Balance
const storeWalletAmount = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeid = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeid) {
      return res.status(200).json({ success: false, msg: 'User not found' })
    }
    res.status(200).json({ success: true, amount: '$500' })
  } catch (error) {
    res.status(500).json({ success: false, status: 500, msg: err.message })
  }
})
//get vendor orders
const getAllVendorOrders = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeId) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authnetication Failed' })
    }
    // const store = await Store.find({ _id: storeId.id.toString() });
    // if (store.isApproved == false) {
    //   return res.status(500).json("Registeration approval pending by admin");
    // }

    const orders = await Order.find({
      vendorId: storeId.id.toString(),
    }).populate([
      // {
      //   path: "userId",
      //   model: "User",
      //   select: "_id name lastname phoneNo",
      // },
      {
        path: 'products.prodId',
        model: 'Product',
        select: '_id name image subCategory price unit ',
      },
    ])
    res.status(200).json({ success: true, orders })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, msg: error })
  }
})
const getStoreId = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeId) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authnetication Failed' })
    }
    res.status(200).json({ success: true, storeId })
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})
//get Order Details by id
const getOrderDetails = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeId) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authnetication Failed' })
    }
    const order = await Order.find({
      vendorId: storeId.id.toString(),
      _id: req.params.id,
    }).populate([
      {
        path: 'products.prodId',
        model: 'Product',
        select: '_id name image subCategory price unit ',
      },
    ])
    res.status(200).json({ success: true, order })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, msg: error })
  }
})

//Update Order Status
const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]

    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeId) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    const { status } = req.body
    const order = await Order.findById(req.params.orderId)
    let mess = ''
    if (status === 'accepted') {
      order.isAccepted = true
      mess = 'Order Accepted'
    } else if (status === 'rejected') {
      order.isRejected = true
      order.isAccepted = false
      mess = 'Order Rejected'
    } else if (status === 'delivered') {
      order.isDelivered = true
      mess = 'Order Delivered'
    }
    await order.save()
    res.status(200).json({
      success: true,
      msg: `${mess}`,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error })
  }
})
//Add Stock
const addStock = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeId) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    const { productId, stock } = req.body
    const product = await Product.findOne({ _id: productId })
    if (!product) {
      return res.status(200).json({ success: false, msg: 'Product not found' })
    }
    if (product.vendorId.toString() !== storeId.id.toString()) {
      return res.status(200).json({ success: false, msg: 'Access denied' })
    } else {
      product.qty += stock
      await product.save()
      res
        .status(200)
        .json({ success: true, msg: 'Stock Updated', stock: product.qty })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error })
  }
})
// Fetch Reviews (Get req)c
const fetchStoreRatings = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeId) {
      return res.json({ success: false, msg: 'Authentication Failed' })
    }
    // const reviews = await Reviews.find({
    //   vendorId: storeId.id.toString(),
    // }).populate([
    //   {
    //     path: "userId",
    //     model: "User",
    //     select: "_id name",
    //   },
    // ]);
    const store = await Vendor.findById(storeId.id)
    const rating = store.storeRating

    res.status(200).json({ success: true, ratings: rating })
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

const vendorPayment = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeId) {
      return res.json({ success: false, msg: 'Authentication Failed' })
    }
    const { amount, paymentId, receivedOn, isEmployeePayment } = req.body
    const store = await Vendor.findById(storeId.id)
    if (!store) {
      return res.status(200).json({ success: false, msg: 'Store not found' })
    }
    if (isEmployeePayment) {
      const employee = await Employee.findById(req.body.employeeId)
      if (!employee) {
        return res

          .status(200)
          .json({ success: false, msg: 'Employee not found' })
      }

      const pay = {
        amount,
        paymentId,
        receivedOn,
        isEmployeePayment: true,
        employeeId: req.body.employeeId,
        vendorId: storeId.id,
      }

      const payment = await Payment.create(pay)
      employee.isPaid = true
      employee.paymentId = payment._id
      await employee.save()
      res
        .status(200)
        .json({ success: true, msg: 'Employee Payment Successful', payment })
    } else {
      const pay = {
        amount,
        paymentId,
        receivedOn,
        isEmployeePayment: false,
        vendorId: storeId.id,
      }

      const payment = await Payment.create(pay)
      store.isPaymentDone = true
      //pupulate payment details
      store.paymentDetails = payment._id

      await store.save()
      res
        .status(200)
        .json({ success: true, msg: 'Vendor Payment Successful', payment })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

export {
  registerStore,
  loginStore,
  changePassword,
  goOffline,
  goOnline,
  storeWalletAmount,
  getAllVendorOrders,
  updateOrderStatus,
  addStock,
  fetchStoreRatings,
  forgotPassword,
  getProfile,
  updateProfile,
  getOrderDetails,
  getStoreId,
  vendorPayment,
  reqUpdateProfile,
}
