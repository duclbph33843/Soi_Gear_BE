import mongoose from "mongoose";

export const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true, // Sử dụng URL phân tích mới
      useUnifiedTopology: true, // Sử dụng mô hình mới để quản lý kết nối
      // useCreateIndex: true, // Nếu bạn dùng các chỉ mục với MongoDB cũ, bỏ ghi chú nếu cần
      // useFindAndModify: false, // Nếu bạn muốn dùng phương thức mới của MongoDB
    });
    console.log("Kết nối thành công!");
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error.message);
  }
};
