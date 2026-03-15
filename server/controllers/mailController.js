// Controller for mail sending
import resendService from '../services/resendService.js';

const mailController = {
  async sendMail(req, res) {
    const { from, to, subject, html } = req.body;
    try {
      await resendService.sendEmail({ from, to, subject, html });
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message || 'Failed to send email' });
    }
  }
};

export default mailController;
