import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database'; // Import your database connection

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Clear data from the 'data' table
      const query = `DELETE FROM data`;
      await db.query(query);

      return res.status(200).json({ message: 'Data in the "data" table cleared successfully' });
    } catch (error) {
      console.error('Error clearing data:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
