import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    // Get the CSV blob from the request body
    const csvBlob = req.body;

    // Specify the file path where you want to save the CSV
    const csvFilePath = './uploads/generated.csv';

    console.log('CSV file will be saved at:', csvFilePath);

    // Write the CSV blob to the file using 'fs' module
    await fs.promises.writeFile(csvFilePath, csvBlob);

    return res.status(200).json({ message: 'CSV stored successfully' });
  } catch (error) {
    console.error('Error storing CSV:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
