import express from 'express'
import {
  getAllEmployeePayments,
  getAllEmployees,
  getAllOrders,
  paidSuccessOrders,
  getAllProducts,
  getAllUsers,
  getAllVendorPayments,
  getAllVendors,
  getEmployeeById,
  getOrderById,
  getProductById,
  getUserById,
  getVendorById,
  getVendorPaymentDetailsById,
  loginAdmin,
  registerAdmin,
  toggleApproveEmployee,
  toggleApproveProduct,
  toggleApproveVendor,
  toggleVerifyVendor,
} from '../controllers/adminController.js'

const router = express.Router()
router.get('/', (req, res) => {
  res.send('Admin API is running..')
})
router.post(`/register`, registerAdmin)
router.post(`/login`, loginAdmin)
router.get(`/getVendors`, getAllVendors)
router.get(`/getEmployees`, getAllEmployees)
router.get(`/getUsers`, getAllUsers)
router.get(`/getOrders`, getAllOrders)
router.get(`/getPaidOrders`, paidSuccessOrders)
router.get(`/getProducts`, getAllProducts)
router.get(`/getVendorPayments`, getAllVendorPayments)
router.get(`/getEmployeePayments`, getAllEmployeePayments)
router.get(`/getVendorById/:id`, getVendorById)
router.get(`/getOrderById/:id`, getOrderById)
router.get(`/getUserById/:id`, getUserById)
router.get(`/getProductById/:id`, getProductById)
router.get(`/getVendorPaymentById/:id`, getVendorPaymentDetailsById)
router.get(`/getEmployeeById/:id`, getEmployeeById)
router.put('/toggleVerifyVendor/:id', toggleVerifyVendor)
router.put('/toggleApproveVendor/:id', toggleApproveVendor)
router.put('/toggleApproveProduct/:id', toggleApproveProduct)
router.put('/toggleApproveEmployee/:id', toggleApproveEmployee)

export default router
