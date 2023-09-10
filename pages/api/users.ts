import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    // This API route only accepts GET requests
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    // Fetch the list of users from the database
    const users = await db.query('SELECT id, username FROM users');

    return res.status(200).json(users.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
