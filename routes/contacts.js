const express = require('express');
const router = express.Router();
const { createContact, getAllContacts, markContactAsRead } = require('../db/queries');
const authenticateToken = require('../middleware/auth');
const { sendContactNotification } = require('../services/emailService');

// Contact form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'Name must be between 2 and 100 characters' });
    }

    if (message.length < 10 || message.length > 1000) {
      return res.status(400).json({ error: 'Message must be between 10 and 1000 characters' });
    }

    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim()
    };

    const contact = await createContact(contactData);

    // Send email notification
    try {
      await sendContactNotification(contactData);
      console.log('Contact notification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send contact notification email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    console.log('New contact form submission:', contact);

    res.status(201).json({
      message: 'Message sent successfully',
      id: contact.id
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get all contact submissions (protected)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const contacts = await getAllContacts();
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Mark contact as read (protected)
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedContact = await markContactAsRead(id);

    if (!updatedContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(updatedContact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

module.exports = router;
