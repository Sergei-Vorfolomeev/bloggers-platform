import {body} from "express-validator";
import {blogsRepository} from "../repositories/blogs-repository";
import {inputValidationMiddleware} from "../middlewares/input-validation-middleware";

const validateTitle = body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title should be string')
    .isLength({max: 30}).withMessage('Max length is 30 symbols')

const validateShortDescription = body('shortDescription')
    .trim()
    .notEmpty().withMessage('Short description is required')
    .isString().withMessage('Short description should be string')
    .isLength({max: 100}).withMessage('Max length is 100 symbols')

const validateContent = body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isString().withMessage('Content should be string')
    .isLength({max: 1000}).withMessage('Max length is 1000 symbols')

const validateBlogId = body('blogId').custom( async id => {
    const blog = await blogsRepository.getBlogById(id)
    if (!blog) {
        throw new Error()
    }
}).withMessage('Blog with this id does not exist')

export const postValidators = () => [validateTitle, validateShortDescription, validateContent, validateBlogId, inputValidationMiddleware]