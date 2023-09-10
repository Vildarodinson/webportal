import { NextApiRequest, NextApiResponse } from 'next';
import multiparty from 'multiparty';
import fs from 'fs/promises';
import db from '../../database';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const uploadDir = './uploads';

  const form = new multiparty.Form({
    uploadDir,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form data:', err);
      return res.status(500).json({ message: 'Error parsing form data' });
    }

    if (!files.file || !Array.isArray(files.file)) {
      console.warn('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = files.file[0];

    if (file.headers['content-type'] !== 'application/octet-stream') {
      console.warn('Invalid file type:', file.headers['content-type']);
      return res.status(400).json({ message: 'Invalid file type' });
    }

    try {
      const data = await fs.readFile(file.path, 'utf-8');
      const lines = data.split('\n');

      // Process and insert each line into your database
      for (const line of lines) {
        const values = line.split('|');
        if (values.length === 8) {
          // Assuming the order of values in the uploaded data matches the database schema
          const query = `
            INSERT INTO data (identifier, code, start_date, end_date, numeric_value, percentage, another_numeric_value, date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id;
          `;

          const result = await db.query(query, values);
          const insertedId = result.rows[0].id;
          console.log('Inserted data with ID:', insertedId);
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
