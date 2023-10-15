import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import Employee from '../models/employeeModel.js'

const addEmployee = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
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
      fullName: req.body.fullName,
      phoneNo: req.body.phoneNo,
      email: req.body.email,
      vendorId: storeId.id,
    }
    // send price,qty,discount,unit,inStock as objects in variable array.
    let employee = await Employee.create(obj)
    res.status(200).json({
      success: true,
      msg: 'Employee Added Successfully',
      employee: employee,
    })
  } catch (err) {
    res.status(500).json({ success: false, msg: err })
  }
})

const getAllEmployees = asyncHandler(async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    let storeId = jwt.verify(token, process.env.JWT_SECRET)
    if (!storeId) {
      return res
        .status(200)
        .json({ success: false, msg: 'Authentication Failed' })
    }
    let employees = await Employee.find({ vendorId: storeId.id }).select(
      '-vendorId -__v'
    )
    res.status(200).json({
      success: true,
      msg: 'Employees Fetched Successfully',
      employees: employees,
    })
  } catch (err) {
    res.status(500).json({ success: false, msg: err })
  }
})

export { addEmployee, getAllEmployees }
