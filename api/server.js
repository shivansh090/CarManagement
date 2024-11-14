require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const apiDocs = require('./routeDocs')

const app = express();
app.use(express.json({ limit: '10mb' }));  // Set to a higher value as needed
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Configure Cloudinary
cloudinary.config(process.env.CLOUDINARY_URL);

// User Model
const User = mongoose.model('User', {
  username: String,
  password: String
});

// Car Model
const Car = mongoose.model('Car', {
  title: String,
  description: String,
  tags: [String],
  images: [String],
  userId: mongoose.Schema.Types.ObjectId
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

app.get('/api/docs', (req, res) => {
  res.json(apiDocs);
});
// Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Create Product (Car) without multer
app.post('/api/cars', verifyToken, async (req, res) => {
  try {
    const { title, description, tags, images } = req.body;

    // Array to store uploaded image URLs
    const uploadedImages = [];

    // Upload each image to Cloudinary
    if (images && images.length > 0) {
      for (const image of images) {
        const result = await cloudinary.uploader.upload(image, {
          folder: 'car_images',
          transformation: [{ width: 500, height: 500, crop: 'limit' }],
        });
        uploadedImages.push(result.secure_url);
      }
    }

    const car = new Car({
      title,
      description,
      tags: tags ? tags.split(',') : [],
      images: uploadedImages,
      userId: req.user._id
    });

    await car.save();
    res.json(car);
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ error: 'Failed to create car', details: error.message });
  }
});


// List Products (Cars)
app.get('/api/cars', verifyToken, async (req, res) => {
  try {
    const cars = await Car.find({ userId: req.user._id });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

// List particular product (Car)
app.get('/api/cars/:id', verifyToken, async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user._id });
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch car' });
  }
});

// Update Product (Car)
// Update Product (Car) without multer
app.put('/api/cars/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, tags, images, newImages } = req.body;

    // Array to store all image URLs
    let allImages = images || [];

    // Upload new images to Cloudinary, if any
    if (newImages && newImages.length > 0) {
      for (const image of newImages) {
        const result = await cloudinary.uploader.upload(image, {
          folder: 'car_images',
          transformation: [{ width: 500, height: 500, crop: 'limit' }],
        });
        allImages.push(result.secure_url);
      }
    }

    const updateData = {
      title,
      description,
      tags: tags ? tags.split(',') : [],
      images: allImages
    };

    const car = await Car.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    );

    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ error: 'Failed to update car', details: error.message });
  }
});


// Delete Product (Car)
app.delete('/api/cars/:id', verifyToken, async (req, res) => {
  try {
    const car = await Car.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!car) return res.status(404).json({ error: 'Car not found' });
    // Delete images from Cloudinary
    for (const imageUrl of car.images) {
      const publicId = imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ error: 'Failed to delete car', details: error.message });
  }
});

// Global search
app.get('/api/search', verifyToken, async (req, res) => {
  try {
    const { keyword } = req.query;
    const cars = await Car.find({
      userId: req.user._id,
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } }
      ]
    });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));