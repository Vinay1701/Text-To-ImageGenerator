import express from 'express'
import { generateImage } from '../controllers/imageController.js'
import authUser from '../middlewares/auth.js'

const imageRouter = express.Router()

imageRouter.post('/generate-image', generateImage);

export default imageRouter