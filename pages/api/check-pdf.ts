import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const pdfFilePath = './uploads/generated.pdf';

  try {
    // Check if the PDF file exists in the ./uploads folder
    if (fs.existsSync(pdfFilePath)) {
      return res.status(200).end(); // PDF exists, respond with success status
    } else {
      return res.status(404).end(); // PDF does not exist, respond with not found status
    }
  } catch (error) {
    console.error('Error checking PDF:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
