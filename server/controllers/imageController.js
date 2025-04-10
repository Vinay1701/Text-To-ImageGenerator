import axios from 'axios';
import dotenv from 'dotenv';
import userModel from '../models/userModel.js';
import mongoose from 'mongoose';

dotenv.config();

export const generateImage = async (req, res) => {
  try {
    const { userId, prompt } = req.body;

    if (!userId || !prompt) {
      return res.json({ success: false, message: 'Missing userId or prompt' });
    }

    let user;

    if (userId === 'mock-user-id-123') {
      user = { _id: userId, creditBalance: 1000 };
    } else {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.json({ success: false, message: 'Invalid user ID format' });
      }

      user = await userModel.findById(userId);
      if (!user) {
        return res.json({ success: false, message: 'User not found' });
      }

      if (user.creditBalance <= 0) {
        return res.json({ success: false, message: 'No credit balance' });
      }
    }

    // 🖼️ Use Pixabay API to search for images
    const pixabayKey = process.env.PIXABAY_API_KEY;
    const response = await axios.get(`https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(prompt)}&image_type=photo`);

    const images = response.data.hits;
    const imageUrl = images.length > 0 ? images[0].webformatURL : null;

    if (!imageUrl) {
      return res.json({ success: false, message: 'No images found for this prompt' });
    }

    let updatedCredits = user.creditBalance;
    if (userId !== 'mock-user-id-123') {
      updatedCredits = user.creditBalance - 1;
      await userModel.findByIdAndUpdate(user._id, { creditBalance: updatedCredits });
    }

    res.json({
      success: true,
      message: 'Image retrieved successfully from Pixabay',
      resultImage: imageUrl,
      creditBalance: updatedCredits,
    });

  } catch (error) {
    console.error('Server Error:', error.message);
    res.json({ success: false, message: 'Failed to retrieve image: ' + error.message });
  }
};
