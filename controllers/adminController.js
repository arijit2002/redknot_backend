import asyncHandler from 'express-async-handler'
import Vendor from '../models/vendorModel.js'
import Payment from '../models/paymentModel.js'
import generateToken from '../utils/generateToken.js'
import jwt from 'jsonwebtoken'
import Order from '../models/orderModel.js'
import Product from '../models/productModel.js'
import UpdatedVendor from '../models/updateVendorModel.js'
import Employee from '../models/employeeModel.js'
import Admin from '../models/adminModel.js'
import User from '../models/userModel.js'

// Register
const registerAdmin = asyncHandler(async (req, res) => {
  try {
    let { email } = req.body
    let duplicate = await Admin.findOne({ email: email })
    if (duplicate) {
      return res.status(200).json({
        success: false,
        msg: 'Admin already exists,please try to login',
      })
    } else {
      let admin = await Admin.create(req.body)
      res.status(200).json({
        success: true,
        msg: 'Admin Registered Successfully',
        _id: admin._id,
        name: admin.fullName,
        token: generateToken(admin._id),
      })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

// Login
const loginAdmin = asyncHandler(async (req, res) => {
  try {
    let { email, password } = req.body
    const admin = await Admin.findOne({ email: email })
    if (!admin) {
      return res.status(200).json({ success: false, msg: 'Admin not found' })
    }
    if (await admin.matchPassword(password)) {
      res.status(200).json({
        success: true,
        msg: 'Admin Logged In Successfully',
        _id: admin._id,
        name: admin.fullName,
        email: admin.email,
        token: generateToken(admin._id),
      })
    } else {
      res.status(200).json({ success: false, msg: `Password didn't match` })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

// Get All Vendors
const getAllVendors = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    console.log(admin)
    if (!admin) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
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

// Get All Users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res

        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    let users = await User.find({})
    if (users) {
      res.status(200).json({ success: true, users: users })
    } else {
      res.status(200).json({ success: false, msg: 'No Users Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

// Get All Orders
const getAllOrders = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res

        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    let orders = await Order.find({}).populate('vendorId')
    //populate prodId inside products array of each order
    for (let i = 0; i < orders.length; i++) {
      for (let j = 0; j < orders[i].products.length; j++) {
        let prod = await Product.findOne({
          _id: orders[i].products[j].prodId,
        })
        orders[i].products[j].prodId = prod
      }
    }

    if (orders) {
      res.status(200).json({ success: true, orders: orders })
    } else {
      res.status(200).json({ success: false, msg: 'No Orders Found' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, msg: error })
  }
})

//get all orders whose payment is successful
const paidSuccessOrders = asyncHandler(async (req, res) => {
  try {
  let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res.status(200).json({ success: false, msg: 'Authentication Failed' })
    }
  const paidOrders = await Order.find({ isPaid: true }).populate('vendorId')
  for (let i = 0; i < paidOrders.length; i++) {
    for (let j = 0; j < paidOrders[i].products.length; j++) {
      let prod = await Product.findOne({
        _id: paidOrders[i].products[j].prodId,
      })
      paidOrders[i].products[j].prodId = prod
    }
  }
  if (paidOrders) {
    res.status(200).json({ success: true, orders: paidOrders })
  } else {
    res.status(200).json({ success: false, msg: 'No Orders Found' })
  }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});

// Get All Products
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res
        .send(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    let products = await Product.find({}).populate('vendorId')
    if (products) {
      res.status(200).json({ success: true, products: products })
    } else {
      res.status(200).json({ success: false, msg: 'No Products Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})
// Get All Payments
const getAllVendorPayments = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res

        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    let payments = await Payment.find({})
    if (payments) {
      res.status(200).json({ success: true, payments: payments })
    } else {
      res.status(200).json({ success: false, msg: 'No Payments Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})
//Get Employee Payments
const getAllEmployeePayments = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res

        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    let payments = await Payment.find({ isEmployeePayment: true })
    if (payments) {
      res.status(200).json({ success: true, payments: payments })
    } else {
      res.status(200).json({ success: false, msg: 'No Payments Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

// Get All Employees
const getAllEmployees = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    let employees = await Employee.find({})
    if (employees) {
      res.status(200).json({ success: true, employees: employees })
    } else {
      res.status(200).json({ success: false, msg: 'No Employees Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

//Get Vendor By Id
const getVendorById = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    let vendor = await Vendor.findOne({ _id: req.params.id })
    if (vendor) {
      res.status(200).json({ success: true, vendor: vendor })
    } else {
      res.status(200).json({ success: false, msg: 'No Vendor Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})
//Get User By Id
const getUserById = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res

        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    let user = await User.findOne({ _id: req.params.id })
    if (user) {
      res.status(200).json({ success: true, user: user })
    } else {
      res.status(200).json({ success: false, msg: 'No User Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

//Get Order By Id
const getOrderById = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res

        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    let order = await Order.findOne({ _id: req.params.id }).populate('vendorId')

    for (let j = 0; j < order.products.length; j++) {
      let prod = await Product.findOne({
        _id: order.products[j].prodId,
      })
      order.products[j].prodId = prod
    }

    if (order) {
      res.status(200).json({ success: true, order: order })
    } else {
      res.status(200).json({ success: false, msg: 'No Order Found' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, msg: error })
  }
})

//Get Product By Id
const getProductById = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res

        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    let product = await Product.findOne({ _id: req.params.id }).populate(
      'vendorId'
    )
    if (product) {
      res.status(200).json({ success: true, product: product })
    } else {
      res.status(200).json({ success: false, msg: 'No Product Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

//Get Payment By Id
const getPaymentById = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res

        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    let payment = await Payment.findOne({ _id: req.params.id })
    if (payment) {
      res.status(200).json({ success: true, payment: payment })
    } else {
      res.status(200).json({ success: false, msg: 'No Payment Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

//Get Employee By Id
const getEmployeeById = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    let employee = await Employee.findOne({ _id: req.params.id })
    if (employee) {
      res.status(200).json({ success: true, employee: employee })
    } else {
      res.status(200).json({ success: false, msg: 'No Employee Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

const getVendorPaymentDetailsById = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res

        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    let vendorPayment = await Payment.findOne({ _id: req.params.id })
    if (vendorPayment) {
      res.status(200).json({ success: true, vendorPayment: vendorPayment })
    } else {
      res.status(200).json({ success: false, msg: 'No Vendor Payment Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

const toggleVerifyVendor = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res

        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    let vendor = await Vendor.findOne({ _id: req.params.id })
    if (vendor) {
      vendor.isVerified = !vendor.isVerified
      await vendor.save()
      res.status(200).json({ success: true, vendor: vendor })
    } else {
      res.status(200).json({ success: false, msg: 'No Vendor Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

const toggleApproveVendor = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    let vendor = await Vendor.findOne({ _id: req.params.id })
    if (vendor) {
      vendor.isApproved = !vendor.isApproved
      await vendor.save()
      res.status(200).json({ success: true, vendor: vendor })
    } else {
      res.status(200).json({ success: false, msg: 'No Vendor Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

const toggleApproveProduct = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    const product = await Product.findOne({ _id: req.params.id })
    if (product) {
      product.isApproved = !product.isApproved
      await product.save()
      res.status(200).json({ success: true, product: product })
    } else {
      res.status(200).json({ success: false, msg: 'No Product Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

const toggleApproveEmployee = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let adminId = jwt.verify(token, process.env.JWT_SECRET).id
    const admin = await Admin.findOne({ _id: adminId })
    if (!admin) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    const employee = await Employee.findOne({ _id: req.params.id })
    if (employee) {
      employee.isApproved = !employee.isApproved
      await employee.save()
      res.status(200).json({ success: true, employee: employee })
    } else {
      res.status(200).json({ success: false, msg: 'No Employee Found' })
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error })
  }
})

export {
  registerAdmin,
  loginAdmin,
  getAllVendors,
  getAllUsers,
  getAllOrders,
  paidSuccessOrders,
  getAllProducts,
  getAllVendorPayments,
  getAllEmployeePayments,
  getAllEmployees,
  getVendorById,
  getUserById,
  getOrderById,
  getProductById,
  getPaymentById,
  getEmployeeById,
  getVendorPaymentDetailsById,
  toggleVerifyVendor,
  toggleApproveVendor,
  toggleApproveProduct,
  toggleApproveEmployee,
}
