import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    // Get the JSON blob from the request body
    const jsonBlob = req.body;

    // Specify the file path where you want to save the JSON
    const jsonFilePath = './uploads/generated.json';

    console.log('JSON file will be saved at:', jsonFilePath);

    // Write the JSON blob to the file using 'fs' module
    await fs.promises.writeFile(jsonFilePath, jsonBlob);

    return res.status(200).json({ message: 'JSON stored successfully' });
  } catch (error) {
    console.error('Error storing JSON:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
