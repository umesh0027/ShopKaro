const Contact = require('../models/Contact');
const { sendEmail, emailTemplates } = require('../utils/email');

// @desc    Submit contact form
// @route   POST /api/contact
const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const contact = await Contact.create({
      name, email, phone, subject, message,
      user: req.user?._id
    });

    // Notify admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Query: ${subject}`,
      html: `<div style="font-family:sans-serif;padding:20px">
        <h2>New Contact Query</h2>
        <p><b>From:</b> ${name} (${email})</p>
        <p><b>Phone:</b> ${phone || 'N/A'}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      </div>`
    });

    res.status(201).json({ success: true, message: 'Your query has been submitted. We will get back to you soon!', contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all contacts (Admin)
// @route   GET /api/contact/admin
const getContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'name email');
    res.json({ success: true, contacts, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reply to contact (Admin)
// @route   PATCH /api/contact/:id/reply
const replyContact = async (req, res) => {
  try {
    const { reply } = req.body;
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Query not found' });

    contact.adminReply = reply;
    contact.status = 'replied';
    contact.repliedAt = new Date();
    await contact.save();

    await sendEmail({
      to: contact.email,
      subject: `Re: ${contact.subject} - ShopKaro Support`,
      html: emailTemplates.contactReply(contact.name, reply)
    });

    res.json({ success: true, message: 'Reply sent successfully', contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update contact status (Admin)
// @route   PATCH /api/contact/:id/status
const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!contact) return res.status(404).json({ success: false, message: 'Query not found' });
    res.json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete contact (Admin)
// @route   DELETE /api/contact/:id
const deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Query deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitContact, getContacts, replyContact, updateContactStatus, deleteContact };
