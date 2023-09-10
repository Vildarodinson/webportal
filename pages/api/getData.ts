import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../database'; // Import the database connection

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('Fetching data from the database...'); // Add a log message

      // Fetch data from your database here
      const client = await pool.connect();
      const { rows } = await client.query('SELECT * FROM data');
      client.release();

      console.log('Fetched data successfully:', rows); // Add a log message

      // Send the fetched data as a JSON response
      return res.status(200).json(rows); // Send just the rows as an array
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
