const express = require('express');
const router = express.Router();
const { getVerifiedReviews, getAllReviews, createReview, updateReview, deleteReview } = require('../db/queries');
const authenticateToken = require('../middleware/auth');

// Get verified reviews (public for landing page)
router.get('/', async (req, res) => {
  try {
    const reviews = await getVerifiedReviews();
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching verified reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get all reviews (admin only)
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const reviews = await getAllReviews();
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create new review (public form submission)
router.post('/', async (req, res) => {
  try {
    const { name, email, role, rating, message } = req.body;

    // Validation
    if (!name || !email || !role || !rating || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    if (!['student', 'client'].includes(role)) {
      return res.status(400).json({ error: 'Role must be "student" or "client"' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    console.log('POST /api/reviews - Request body:', req.body);

    const reviewData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      rating: parseInt(rating),
      message: message.trim()
    };

    const newReview = await createReview(reviewData);
    console.log('Review created successfully:', newReview?.id);

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update review status (admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('PUT /api/reviews/:id - Request body:', req.body);
    console.log('User:', req.user?.email);

    const id = parseInt(req.params.id);
    const updatedReview = await updateReview(id, req.body);

    if (!updatedReview) {
      console.log('Review not found');
      return res.status(404).json({ error: 'Review not found' });
    }

    console.log('Review updated successfully');
    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete review (admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deletedReview = await deleteReview(id);

    if (!deletedReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
