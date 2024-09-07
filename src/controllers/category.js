import { StatusCodes } from "http-status-codes";
import Category from "../models/category";
import Product from "../models/product";
import slugify from "slugify";

export const create = async (req, res) => {
    try {
        //Tạo Category và kiểm tra có trùng với cấu trúng dữ liệu hay không
        const category = await Category.create({
            name: req.body.name,
            //slug được tạo trùng với tên và đổi khoảng trống thành -
            slug: slugify(req.body.name, "-"),
        });
        return res.status(StatusCodes.CREATED).json({ category });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
};

export const getAll = async (req, res) => {
    try {
        //Lấy tất cả dữ liệu có trong category
        const categories = await Category.find({});
        if (categories.length === 0) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Không có danh mục nào" });
        }
        return res.status(StatusCodes.OK).json(categories);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        //Lấy tất cả product có chung id category
        const product = await Product.find({ category: req.params.id });
        const category = await Category.findById(req.params.id);
        if (category.length === 0) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Không có danh mục nào" });
        }
        return res.status(StatusCodes.OK).json({ category, product });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
};
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        return res.status(StatusCodes.OK).json({ category });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
};
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            //Lấy id trên thanh url
            req.params.id,
            //Dữ liệu thay đổi giống với dữ liệu trước khi thay đổi
            req.body,
            {
                new: true,
            }
        );
        return res.status(StatusCodes.OK).json({ category });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
};
