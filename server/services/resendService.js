// Service for sending email via Resend
import fetch from 'node-fetch';


const sendEmail = async ({ from, to, subject, html }) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to, subject, html })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
};

export default { sendEmail };
