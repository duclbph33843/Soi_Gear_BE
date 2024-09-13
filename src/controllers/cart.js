import Cart from "../models/cart.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import { StatusCodes } from "http-status-codes";

export const addItemToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    //* Kiểm tra giỏ hàng có tồn tại hay chưa ? dựa theo userId
    let cart = await Cart.findOne({ userId });

    //* Nếu không tồn tại => tạo mới
    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    const existProductIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    //* Kiểm tra xem sản phẩm có tồn tại trong giỏ hàng không ?
    if (existProductIndex !== -1) {
      //* Nếu tồn tại => cập nhật số lượng
      cart.products[existProductIndex].quantity += quantity;
    } else {
      //* Nếu không tồn tại => thêm mới
      cart.products.push({ productId, quantity });
    }

    //* Lưu giỏ hàng
    await cart.save();
    return res.status(StatusCodes.OK).json({ cart });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};


// export const addItemToCart = async (req, res) => {
//   const { userId, productId, quantity } = req.body;
//   try {
//     const cartIdentifier = {};

//     if (userId) {
//       cartIdentifier.userId = userId;
//     } else {
//       let guestId = req.cookies.guestId;
//       if (!guestId) {
//         guestId = `guest_${new Date().getTime()}`;
//         res.cookie("guestId", guestId, {
//           httpOnly: true,
//           maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
//         });
//       }
//       cartIdentifier.guestId = guestId;
//     }

//     // Đảm bảo cartIdentifier có ít nhất một thuộc tính
//     if (Object.keys(cartIdentifier).length === 0) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ message: "Không có thông tin người dùng hoặc khách" });
//     }

//     let cart = await Cart.findOne(cartIdentifier);

//     // Tạo giỏ hàng mới nếu chưa tồn tại
//     if (!cart) {
//       cart = new Cart({ ...cartIdentifier, products: [] });
//     }

//     // Kiểm tra xem sản phẩm có tồn tại trong giỏ hàng không
//     const existProductIndex = cart.products.findIndex(
//       (item) => item.productId.toString() === productId
//     );

//     // Cập nhật số lượng hoặc thêm sản phẩm mới
//     if (existProductIndex !== -1) {
//       cart.products[existProductIndex].quantity += quantity;
//     } else {
//       cart.products.push({ productId, quantity });
//     }

//     // Lưu giỏ hàng
//     await cart.save();
//     return res.status(StatusCodes.OK).json({ cart });
//   } catch (error) {
//     console.error(error); // Log lỗi để tiện debug
//     return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
//   }
// };

// export const addItemToCart = async (req, res) => {
//   const { userId: requestUserId, productId, quantity } = req.body;
//   try {
//     let userId = requestUserId;

//     // Nếu không có userId, kiểm tra guestId
//     if (!userId) {
//       let guestId = req.cookies.guestId;
//       if (!guestId) {
//         guestId = `guest_${new Date().getTime()}`;
//         res.cookie("guestId", guestId, {
//           httpOnly: true,
//           maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
//         });
//       }
//       // Gán giá trị guestId cho userId nếu không có userId
//       userId = guestId;
//     }

//     const cartIdentifier = { userId };

//     // Tìm giỏ hàng theo userId
//     let cart = await Cart.findOne(cartIdentifier);

//     // Tạo giỏ hàng mới nếu chưa tồn tại
//     if (!cart) {
//       cart = new Cart({ ...cartIdentifier, products: [] });
//     }

//     // Kiểm tra xem sản phẩm có tồn tại trong giỏ hàng không
//     const existProductIndex = cart.products.findIndex(
//       (item) => item.productId.toString() === productId
//     );

//     // Cập nhật số lượng hoặc thêm sản phẩm mới
//     if (existProductIndex !== -1) {
//       cart.products[existProductIndex].quantity += quantity;
//     } else {
//       cart.products.push({ productId, quantity });
//     }

//     // Lưu giỏ hàng
//     await cart.save();
//     return res.status(StatusCodes.OK).json({ cart });
//   } catch (error) {
//     console.error(error); // Log lỗi để tiện debug
//     return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
//   }
// };


export const getCart = async (req, res) => {
  const { userId } = req.params;
  try {
    //Lấy thông tin sản phẩm theo userId
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Không tìm thấy giỏ hàng !" });
    }
    const cartData = {
      products: cart.products.map((item) => ({
        productId: item.productId._id,
        image: item.productId.image,
        price: item.productId.price,
        name: item.productId.name,
        quantity: item.quantity,
      })),
    };
    return res.status(StatusCodes.OK).json(cartData);
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const removeItemFromCart = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Không tìm thấy giỏ hàng !" });
    }
    cart.products = cart.products.filter(
      //Tìm xem có tồn tại productId hay không và so sánh giá trị của productId từng mục đã xóa;toString dùng để ép kiểu về dạng chuỗi
      (item) => item.productId && item.productId.toString() !== productId
    );
    await cart.save();
    return res.status(StatusCodes.OK).json({ cart });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};
export const updateProductQuantity = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Không tìm thấy giỏ hàng !" });
    }
    const product = cart.products.find(
      (item) => item.productId.toString() === productId
    );

    if (!product) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng !" });
    }
    product.quantity = quantity;
    await cart.save();
    return res.status(StatusCodes.OK).json({ cart });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const increaseProductQuantity = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng !" });
    }

    //So sánh xem sản phảm có trong giỏ hàng không nhằm kiểm tra sản phẩm có tồn tại trong giỏ hàng không và đồng bộ dữ liệu
    const product = cart.products.find(
      (item) => item.productId.toString() === productId
    );
    if (!product) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng !" });
    }

    product.quantity++;

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const decreaseProductQuantity = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng !" });
    }

    const product = cart.products.find(
      (item) => item.productId.toString() === productId
    );
    if (!product) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng !" });
    }

    if (product.quantity > 1) {
      product.quantity--;
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Xóa tất cả sản phẩm của người dùng từ cơ sở dữ liệu
    await Cart.updateOne({ userId }, { $set: { products: [] } });

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
