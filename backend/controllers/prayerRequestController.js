const sendEmail = require('../services/emailService');
const createPrayerRequest = async (req, res) => {
    const { name, phone, prayerRequest } = req.body;

    if (!name || !phone || !prayerRequest) {
        return res.status(400).send('All fields are required.');
    }

    const subject = "New Prayer Request Received";
    const message = `Dear Team,

A new prayer request has been submitted:

Name: ${name}
Phone: ${phone}
Prayer Request: ${prayerRequest}

Best regards,
Website`;

    try {
        await sendEmail(process.env.RECIPIENT_EMAIL, subject, message);
        console.log('Email sent successfully');
        return res.status(200).json({ message: 'Prayer request submitted successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending prayer request' });
    }
};

module.exports = {
    createPrayerRequest
};
