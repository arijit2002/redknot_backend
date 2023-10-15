import express, { Router } from 'express'
import {
  addEmployee,
  getAllEmployees,
} from '../controllers/employeeController.js'
import { sendStoreOtp, verifyStoreOtp } from '../controllers/otp.js'
import {
  addProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../controllers/productController.js'
import { placeOrder } from '../controllers/userController.js'
import {
  addStock,
  changePassword,
  fetchStoreRatings,
  forgotPassword,
  getAllVendorOrders,
  getOrderDetails,
  getProfile,
  getStoreId,
  goOffline,
  goOnline,
  loginStore,
  registerStore,
  reqUpdateProfile,
  storeWalletAmount,
  updateOrderStatus,
  updateProfile,
  vendorPayment,
} from '../controllers/vendorController.js'

//import {registerStore, login} from '../controller/StoreController.js';
// const {
//   registerStore,
//   login,

//   terms,
//   support,
//   goOffline,
//   goOnline,
//   addtoMenu,
//   removefromMenu,
//   packagingCharge,
//   updateStation,
//   createCoupons,
//   deleteCoupons,
//   viewAdminCoupon,
//   showMenu,
//   addCoupon,
//   viewCoupon,
//   sendLink,
//   resetLink,
//   changePassword,
// } = require("../controller/StoreController.js");
// const { protect } = require("../middleware/authMiddleware.js");
// const { sendstoreOtp, verifystoreOtp } = require("../controller/OtpVerify.js");

const router = express.Router()
router.get('/', (req, res) => {
  res.send('Vendor API is running..')
})
router.post(`/register-store`, registerStore)
router.post(`/login`, loginStore)
router.post('/sendOTP', sendStoreOtp)
router.post('/verifyOTP', verifyStoreOtp)
router.post(`/changePassword`, changePassword)
router.post(`/forgotPassword`, forgotPassword)
router.get(`/storeWalletAmount`, storeWalletAmount)
router.post(`/addProduct`, addProduct)
router.get(`/getProducts/:category`, getProducts)
router.put(`/updateProduct/:id`, updateProduct)
router.delete(`/deleteProduct/:id`, deleteProduct)
router.post(`/createOrder`, placeOrder)
router.get(`/getAllVendorOrders`, getAllVendorOrders)
router.post(`/updateOrderStatus/:orderId`, updateOrderStatus)
router.post(`/addStock`, addStock)
router.get(`/storeRatings`, fetchStoreRatings)
router.get(`/getProfile`, getProfile)
router.put(`/updateProfile`, updateProfile)
router.get(`/getOrderDetails/:id`, getOrderDetails)
router.get(`/getStoreId`, getStoreId)
router.post(`/addEmployee`, addEmployee)
router.get(`/getAllEmployees`, getAllEmployees)
router.post(`/vendorPayment`, vendorPayment)
router.post(`/reqUpdateProfile`, reqUpdateProfile)
// router.post(`/resetLink/:tokenId`, resetLink)
// router.post(`/sendLink`, sendLink)
// router.get(`/showMenu`, showMenu)
// router.post(`/packagingCharge`, packagingCharge)
// router.post(`/updateStation`, updateStation)
// router.get(`/viewAdminCoupon`, viewAdminCoupon)
// router.post(`/addtoMenu`, addtoMenu)
// router.post(`/removefromMenu`, removefromMenu)
// router.get(`/viewCoupon`, viewCoupon)
router.put(`/goOnline`, goOnline)
// router.post(`/deleteCoupons/:couponId`, deleteCoupons)
router.put(`/goOffline`, goOffline)
// router.post(`/addCoupon`, addCoupon)
// router.post(`/createCoupons`, createCoupons)
// router.get('/terms', terms)
// router.post('/support', support)

export default router
