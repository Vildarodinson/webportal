import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database'; // Import your database connection

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const {
        identifier,
        code,
        start_date,
        end_date,
        numeric_value,
        percentage,
        another_numeric_value,
        date,
        inserted_at,
      } = req.body;

      const query = `
        UPDATE data
        SET identifier = $1,
            code = $2,
            start_date = $3,
            end_date = $4,
            numeric_value = $5,
            percentage = $6,
            another_numeric_value = $7,
            date = $8,
            inserted_at = $9
        WHERE id = $10
      `;

      const values = [
        identifier,
        code,
        start_date,
        end_date,
        numeric_value,
        percentage,
        another_numeric_value,
        date,
        inserted_at,
        id,
      ];

      await db.query(query, values);

      return res.status(200).json({ message: 'Row updated successfully(check console)' });
    } catch (error) {
      console.error('Error updating row:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}