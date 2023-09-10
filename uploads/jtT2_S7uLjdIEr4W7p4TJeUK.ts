import { NextApiRequest, NextApiResponse } from 'next';
import multiparty from 'multiparty';
import fs from 'fs/promises'; // Using fs.promises for async file operations
import db from '../database'; // Import database connection

export const config = {
  api: {
    bodyParser: false, // Disable the built-in bodyParser
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    // This API route only accepts POST requests
    return res.status(405).end(); // Method Not Allowed
  }

  // Specify the directory where you want to save the uploaded files
  const uploadDir = './uploads'; // You can change this directory to your preferred location

  const form = new multiparty.Form({
    uploadDir, // Set the upload directory here
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error parsing form data' });
    }

    if (!files.file || !Array.isArray(files.file)) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = files.file[0]; // Get the first file in the array

    if (file.headers['content-type'] !== 'application/octet-stream') {
      // Check if the uploaded file is of the correct type
      return res.status(400).json({ message: 'Invalid file type' });
    }

    try {
      // Read the contents of the uploaded file
      const data = await fs.readFile(file.path, 'utf-8');

      // Split the data into lines
      const lines = data.split('\n');

      // Process and insert each line into your database
      for (const line of lines) {
        const values = line.split('|');
        if (values.length === 8) {
          // Assuming the order of values matches your table schema
          const query = `
            INSERT INTO data (identifier, code, start_date, end_date, numeric_value, percentage, another_numeric_value, date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `;
          await db.query(query, values);
        }
      }

      // Delete the temporary file
      await fs.unlink(file.path);

      // Send a success response
      return res.status(200).json({ message: 'Upload successful', data: lines });
    } catch (error) {
      console.error('Error processing file:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
}
