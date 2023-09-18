import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    // Get the PDF blob from the request body
    const pdfBlob = req.body;

    // Specify the file path where you want to save the PDF
    const pdfFilePath = './uploads/generated.pdf';

    console.log('PDF file will be saved at:', pdfFilePath);

    // Write the PDF blob to the file using 'fs' module
    await fs.promises.writeFile(pdfFilePath, pdfBlob);

    return res.status(200).json({ message: 'PDF stored successfully' });
  } catch (error) {
    console.error('Error storing PDF:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
