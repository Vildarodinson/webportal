import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database'; // Import database connection

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const id = req.query.id as string;

    // Check if 'id' is not undefined and is a valid number
    if (typeof id !== 'undefined' && !isNaN(Number(id))) {
      const parsedId = parseInt(id);

      try {
        const {
          identifier,
          code,
          start_date,
          end_date,
          numeric_value,
          another_numeric_value,
          date,
        } = req.body;

        // Log the field being edited and the row ID
        console.log(`Editing field for row with ID ${parsedId}`);

        const queryParts = [];
        const queryValues = [parsedId];

        // Check if the 'identifier' field has changed
        if (typeof identifier !== 'undefined') {
          queryParts.push('identifier = $' + (queryValues.length + 1));
          queryValues.push(identifier);
        }

        // Check if the 'code' field has changed
        if (typeof code !== 'undefined') {
          queryParts.push('code = $' + (queryValues.length + 1));
          queryValues.push(code);
        }

        // Check if the 'start_date' field has changed
        if (typeof start_date !== 'undefined') {
          queryParts.push('start_date = $' + (queryValues.length + 1));
          queryValues.push(start_date);
        }

        // Check if the 'end_date' field has changed
        if (typeof end_date !== 'undefined') {
          queryParts.push('end_date = $' + (queryValues.length + 1));
          queryValues.push(end_date);
        }

        // Check if the 'numeric_value' field has changed
        if (typeof numeric_value !== 'undefined') {
          queryParts.push('numeric_value = $' + (queryValues.length + 1));
          queryValues.push(numeric_value);
        }

        // Check if the 'another_numeric_value' field has changed
        if (typeof another_numeric_value !== 'undefined') {
          queryParts.push('another_numeric_value = $' + (queryValues.length + 1));
          queryValues.push(another_numeric_value);
        }

        // Check if the 'date' field has changed
        if (typeof date !== 'undefined') {
          queryParts.push('date = $' + (queryValues.length + 1));
          queryValues.push(date);
        }

        const query = `
          UPDATE data
          SET
            ${queryParts.join(', ')}
          WHERE id = $1
        `;

        await db.query(query, queryValues);

        // Log a success message
        console.log(`Row with ID ${parsedId} edited successfully`);

        return res.status(200).json({ message: 'Row edited successfully' });
      } catch (error: any) {
        // Specify the type as 'any' if the error type is unknown

        // Log the error, the field being edited, and the row ID
        console.error(`Error editing field for row with ID ${parsedId}:`, error);

        // Log a message to indicate the reason for the 500 error
        console.error(`500 error occurred for row with ID ${parsedId}. Possible reasons:`, error);

        return res.status(500).json({ message: 'Internal server error', error: error.message as string });
      }
    } else {
      return res.status(400).json({ message: 'Invalid ID' });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
