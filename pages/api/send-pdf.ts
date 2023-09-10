import { NextApiRequest, NextApiResponse } from 'next';
import { createTransport } from 'nodemailer'; // Import createTransport from Nodemailer
import { createReadStream } from 'fs'; // Import createReadStream from fs

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { recipientEmail } = req.body; // Extract recipient email from the request body

  const transporter = createTransport({
    service: 'Gmail',
    auth: {
      user: 'exportdata777@gmail.com', // Use your Gmail email address
      pass: 'mnvcxoxqocbhmaqm', // Use the App Password generated for your Gmail account
    },
  });

  // Send the email with the PDF attachment
  const mailOptions = {
    from: 'exportdata777@gmail.com', // Sender's email address
    to: recipientEmail, // Recipient's email address
    subject: 'Your PDF',
    text: 'Here is your PDF attachment.',
    attachments: [
      {
        filename: 'generated.pdf', // Specify the filename for the attachment
        content: createReadStream('./uploads/generated.pdf'), // Read the PDF from the file path
      },
    ],
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.response);
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Email sending failed' });
  }
}
