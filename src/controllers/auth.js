import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import User from "../models/user.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "./../utils/email.js";
import { hashPassword } from "./../utils/password.js";
import { errorMessages, successMessages } from "./../utils/message.js";

const signupSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "any.required": "Trường Name là bắt buộc",
    "string.empty": "Trường Name không được để trống",
    "string.min": "Trường Name tối thiểu là {#limit} ký tự",
    "string.max": "Trường Name tối đa là {#limit} ký tự",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Trường Email là bắt buộc !",
    "string.empty": "Trường Email không được để trống",
    "string.email": "Trường Email không phải là email hợp lệ",
  }),
  password: Joi.string().min(3).max(30).required().messages({
    "any.required": "Trường Password là bắt buộc",
    "string.empty": "Trường Password không được để trống",
    "string.min": "Trường Password tối thiểu là {#limit} ký tự",
    "string.max": "Trường Password tối đa là {#limit} ký tự",
  }),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.required": "Trường Confirm Password là bắt buộc",
    "any.only": "Mật khẩu không trùng khớp",
  }),
  avatar: Joi.string().uri().messages({
    "string.uri": "Trường Avatar không phải là URL hợp lệ",
  }),
});

// const UserSchema = new mongoose.Schema({
//   clerkId: String, // Clerk ID to link with Clerk user
//   email: String,
//   password: String,
//   avatar: String,
// });

export const signup = async (req, res) => {
  // lấy dữ liệu được nhập lên từ người dùng
  const { email, password, name, avatar } = req.body;
  //Kiểm tra validate
  const { error } = signupSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((item) => item.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ messages });
  }
  //Lấy ra từng emai trong user để so sánh
  const exitsUser = await User.findOne({ email });
  if (exitsUser) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: ["Email đã tồn tại !"] });
  }

  //Mã hóa mật khẩu 10 lần
  const hashPass = await bcryptjs.hash(password, 10);
  //Nếu role bằng 0 thì là admin còn khác 0 thì là user
  const role = (await User.countDocuments({})) === 0 ? "admin" : "user";
  const user = await User.create({
    ...req.body,
    password: hashPass,
    role,
  });
  return res.status(StatusCodes.CREATED).json({ user });
};

export const signin = async (req, res) => {
  const { email, password } = req.body;
  //Lấy từng email trong user để so sánh
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      messages: ["Email không tồn tại"],
    });
  }
  //lấy ra mật khẩu trước khi mã hóa trong user
  const isMatch = await bcryptjs.compare(password, user.password);
  if (!isMatch) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      messages: ["Mật khẩu không chính xác"],
    });
  }
  //Bảo mật thông tin người dùng
  const token = jwt.sign({ userId: user._id }, "12345678", {
    expiresIn: "7d",
  });
  return res.status(StatusCodes.OK).json({
    user,
    token,
  });
};
export const forgotPassword = async (req, res, next) => {
  try {
    //Lấy địa chỉ eamil trừ người dùng và kiểm tra có tồn tại hay không
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: errorMessages.USER_NOT_FOUND,
      });
    }

    //random 1 dãy số ngẫu nhiên sau đó chuyển đổi thành 1 chuỗi số 0-9 và a-z sau đó lấy 8 ký tự cuối cùng
    const newPassword = Math.random().toString(36).slice(-8);
    //Truyền password vào hàm hashPassword để xử lý mã hóa
    const hashPass = await hashPassword(newPassword);
    if (!hashPass) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: errorMessages?.HASH_PASSWORD_ERROR,
      });
    }

    //Thành công lưu password vào user
    user.password = hashPass;
    await user.save();

    //Gửi thông báo về gmail với nội dung
    const emailSubject = "Test Noti Forgot Password by Bá Đức";
    const emailText = `Mật khẩu mới của bạn là: ${newPassword}`;
    await sendEmail(email, emailSubject, emailText);

    return res.status(StatusCodes.OK).json({
      message: successMessages?.RESET_PASSWORD_SUCCESS,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {};
