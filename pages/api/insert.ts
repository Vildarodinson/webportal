import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database'; // Import your database connection

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const {
        identifier,
        code,
        start_date,
        end_date,
        numeric_value,
        percentage,
        another_numeric_value,
        date,
      } = req.body;

      const query = `
        INSERT INTO data (identifier, code, start_date, end_date, numeric_value, percentage, another_numeric_value, date, inserted_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())  -- Use a database-specific function to get the current timestamp
        RETURNING id  -- Return the ID of the inserted row
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
      ];

      const result = await db.query(query, values);
      const insertedId = result.rows[0].id; // Get the ID of the inserted row

      // Construct the row data to match your existing format
      const insertedRowData = {
        id: insertedId,
        data: `${identifier}|${code}|${start_date}|${end_date}|${numeric_value}|${percentage}|${another_numeric_value}|${date}`,
      };

      return res.status(200).json({ message: 'Row inserted successfully(check console)', insertedRowData });
    } catch (error) {
      console.error('Error inserting row:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
