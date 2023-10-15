import asyncHandler from 'express-async-handler'
import Vendor from '../models/vendorModel.js'
import otpGenerator from 'otp-generator'
import { sendOTP, verifySMS, sendSMS } from '../utils/sendSMS.cjs'
import { checkVerification, sendVerification } from '../utils/twilioLogic.cjs'

// const sendmyOtp = asyncHandler(async (req, res) => {
//   try {
//     let { phoneNo } = req.body;
//     let user = await User.findOne({ phoneNo: phoneNo });
//     if (user) {
//       const oneTimePasscode = otpGenerator.generate(6, {
//         upperCaseAlphabets: false,
//         specialChars: false,
//       });
//       user.otp = oneTimePasscode;
//       await user.save();
//       const phonenum = parseInt(phoneNo);
//       sendOTP(phonenum, oneTimePasscode);
//       res.status(200).json({ otp: "OTP send successfully" });
//     } else {
//       res.status(500).json({ otp: "Number not registered" });
//     }
//   } catch (error) {
//     res.status(500).json({ error });
//   }
// });

// const verifymyOtp = asyncHandler(async (req, res) => {
//   try {
//     let { phoneNo, verify } = req.body;
//     let user = await User.findOne({ phoneNo: phoneNo });
//     if (user.otp === verify) {
//       user.otp = "";
//       await user.save();
//       let mynum = parseInt(phoneNo);
//       let mess = `OTP Verified`;
//       verifySMS(mess, mynum);
//       return res.status(200).json({ mess: "OTP Verified" });
//     }
//     let errormess = "Incorrect OTP";
//     verifySMS(errormess, mynum);
//     res.status(500).json({ mess: "Incorrect OTP" });
//   } catch (error) {
//     res.status(500).json("Internal server error");
//   }
// });
const sendStoreOtp = asyncHandler(async (req, res) => {
  try {
    let { phoneNo } = req.body
    let { forgot } = req.body

    let vendor = await Vendor.findOne({ phoneNo: phoneNo })
    if (vendor && !forgot) {
      res.status(200).json({ success: false, msg: 'Number already registered' })
      // const oneTimePasscode = otpGenerator.generate(6, {
      //   upperCaseAlphabets: false,
      //   specialChars: false,
      // })
      // vendor.otp = oneTimePasscode
      // await vendor.save()
    } else if (!vendor && !forgot) {
      try {
        sendVerification(phoneNo)
        res.status(200).json({ success: true, msg: `OTP sent Successfully` })
      } catch (error) {
        res.status(400).json({ success: false, msg: error.message })
      }
    } else if (vendor && forgot) {
      try {
        sendVerification(phoneNo)
        res
          .status(200)
          .json({ success: true, msg: `Forgot OTP sent Successfully` })
      } catch (error) {
        res.status(400).json({ success: false, msg: error.message })
      }
    } else if (!vendor && forgot) {
      res.status(200).json({ success: false, msg: `Number not registered` })
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

const verifyStoreOtp = asyncHandler(async (req, res) => {
  try {
    let { phoneNo, code } = req.body

    // if (user.otp === verify) {
    //   user.otp = ''
    //   await user.save()
    //   let mynum = parseInt(phoneNo)
    //   let mess = `OTP Verified`
    //   verifySMS(mess, mynum)
    //   return res.status(200).json({ mess: 'OTP Verified' })
    // }
    // let errormess = 'Incorrect OTP'
    // verifySMS(errormess, mynum)
    const status = await checkVerification(phoneNo, code)
    if (status === 'approved') {
      res
        .status(200)
        .json({ success: true, msg: 'OTP verified', isVerified: true })
    } else {
      res.status(200).json({ success: false, msg: 'Incorrect OTP' })
    }
  } catch (error) {
    res.status(400).json({ success: false, msg: error.message })
  }
})
// const senddeliveryOtp = asyncHandler(async (req, res) => {
//   try {
//     let { phoneNo } = req.body;
//     let user = await Delivery.findOne({ phoneNo: phoneNo });
//     if (user) {
//       const oneTimePasscode = otpGenerator.generate(6, {
//         upperCaseAlphabets: false,
//         specialChars: false,
//       });
//       user.otp = oneTimePasscode;
//       await user.save();
//       const phonenum = parseInt(phoneNo);
//       sendOTP(phonenum, oneTimePasscode);
//       res.status(200).json({ otp: "OTP send successfully" });
//     } else {
//       res.status(500).json({ otp: "Number not registered" });
//     }
//   } catch (error) {
//     res.status(500).json({ error });
//   }
// });

// const verifydeliveryOtp = asyncHandler(async (req, res) => {
//   try {
//     let { phoneNo, verify } = req.body;
//     let user = await Delivery.findOne({ phoneNo: phoneNo });
//     if (user.otp === verify) {
//       user.otp = "";
//       await user.save();
//       let mynum = parseInt(phoneNo);
//       let mess = `OTP Verified`;
//       verifySMS(mess, mynum);
//       return res.status(200).json({ mess: "OTP Verified" });
//     }
//     let errormess = "Incorrect OTP";
//     verifySMS(errormess, mynum);
//     res.status(500).json({ mess: "Incorrect OTP" });
//   } catch (error) {
//     res.status(500).json("Internal server error");
//   }
// });

export { sendStoreOtp, verifyStoreOtp }
