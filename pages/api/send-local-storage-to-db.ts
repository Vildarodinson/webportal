import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { data } = req.body; // Access the data sent from the client

      console.log('Received data:', data);

      // Verify that data is an array or handle any necessary data validation
      if (!Array.isArray(data)) {
        return res.status(400).json({ message: 'Invalid data format' });
      }

      const client = await db.connect(); // Change 'pool' to 'db.connect()'

      // Loop through the data and insert each row into the database
      for (const item of data) {
        await client.query(
          'INSERT INTO data (identifier, code, start_date, end_date, numeric_value, percentage, another_numeric_value, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [
            item.identifier,
            item.code,
            item.start_date,
            item.end_date,
            item.numeric_value,
            item.percentage,
            item.another_numeric_value,
            item.date,
          ]
        );
      }

      client.release();

      return res.status(201).json({ message: 'Data inserted successfully' });
    } catch (error) {
      console.error('Error inserting data:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
