import express from 'express'
import {
  getAllCategories,
  getAllProducts,
  getByCategory,
  getProductById,
  getAllVendors,
  getVendorById,
  getProfile,
  loginUser,
  registerUser,
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
  getOrderbyOrderId,
} from '../controllers/userController.js'
import { userAuth } from '../middlewares/auth.js'

const router = express.Router()
router.get('/', (req, res) => {
  res.send('User API is running..')
})
router.post(`/register`, registerUser)
router.post(`/registerSentOTP`, registerSentOTP)
router.post(`/registerVerifyOTP`, registerVerifyOTP)
router.post(`/login`, loginUser)
router.post(`/loginSentOTP`, loginSentOTP)
router.post(`/loginVerifyOTP`, loginVerifyOTP)
router.get('/profile', userAuth, getProfile)
router.get('/products', getAllProducts)
router.get('/products/:category/:subCategory', getByCategory)
router.get('/products/:id', getProductById)
router.get('/categories', getAllCategories)
router.get('/vendors', getAllVendors)
router.get('/vendorById', getVendorById)
router.get('/cartlist', getOrderList)
router.post('/addToCart', giveOrder)
router.post('/deleteOrder', deleteOrder)
router.get('/filterProducts', filterProducts)
router.post('/checkout', checkout)
router.post('/create-user', paymentCreateCustomer)
router.post('/add-card', paymentAddCard)
router.post('/create-charge', paymentCreateCharge)
router.post('/client-secret', paymentClientSecret)
router.post('/addToWishlist', addToWishlist)
router.get('/getWishlist', getWishlist)
router.post('/deleteWishlist', deleteWishlist)
router.post('/addReview', addReview)
router.post('/create-checkout-session', createCheckout)
router.post('/successfulOrderByCustId', successfulOrderByCustId)
router.post('/getOrderbyOrderId', getOrderbyOrderId)

export default router
