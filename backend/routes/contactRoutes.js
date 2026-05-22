const express = require('express');
const router = express.Router();
const { submitContact, getContacts, replyContact, updateContactStatus, deleteContact } = require('../controllers/contactController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, submitContact);
router.get('/admin', protect, adminOnly, getContacts);
router.patch('/:id/reply', protect, adminOnly, replyContact);
router.patch('/:id/status', protect, adminOnly, updateContactStatus);
router.delete('/:id', protect, adminOnly, deleteContact);

module.exports = router;
