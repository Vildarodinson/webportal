import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database'; // Import your database connection

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const id = req.query.id as string;

    // Check if 'id' is not undefined and is a valid number
    if (typeof id !== 'undefined' && !isNaN(Number(id))) {
      const parsedId = parseInt(id);

      try {
        const query = 'DELETE FROM data WHERE id = $1';
        await db.query(query, [parsedId]);

        return res.status(200).json({ message: 'Row deleted successfully' });
      } catch (error) {
        console.error('Error deleting row:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid ID' });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
