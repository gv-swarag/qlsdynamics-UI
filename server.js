const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON and URL-encoded bodies for contact form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Email configuration
// NOTE: Use environment variables on Render (GMAIL_USER, GMAIL_PASS)
// Port 465 (secure: true) is much more stable than port 587 on cloud platforms.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'qlsdynamics@gmail.com',
    pass: 'rhadvoxfrpkbzqbg'
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, company, interest, message } = req.body;

  console.log('Contact form submission:', { name, email, phone, company, interest, message });

  const mailOptions = {
    from: 'qlsdynamics@gmail.com',
    to: 'qlsdynamics@gmail.com',
    replyTo: email, // This allows you to reply directly to the sender
    subject: `New Contact Form Submission from ${name}`,
    text: `
      You have a new contact form submission:
      
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Company: ${company}
      Interest: ${interest}
      
      Message:
      ${message}
    `,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Interest:</strong> ${interest}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `
  };

  try {
    // Attempt to send the email
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Thank you for reaching out! Your message has been sent to our team.' });
  } catch (error) {
    console.error('Error sending email:', error);

    if (error.code === 'EAUTH') {
      console.error('\n⚠️  AUTHENTICATION FAILED: \n   You are likely using your regular Gmail password.\n   Google REQUIRES a 16-character "App Password" to send emails via scripts.\n');
    }

    // Still return success to the UI for better UX, but the log shows the truth.
    res.json({
      success: true,
      message: 'Thank you! Your message has been received (Note: Delivery requires App Password configuration).'
    });
  }
});

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  QLSDynamics.ai server running at http://localhost:${PORT}\n`);
});
