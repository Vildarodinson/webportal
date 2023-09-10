import { NextApiRequest, NextApiResponse } from 'next';
import multiparty from 'multiparty';
import fs from 'fs'; // Import 'fs' for file operations (non-promises version)
import db from '../../database';
import PDFDocument from 'pdfkit'; // Import PDFKit

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
      const data = await fs.promises.readFile(file.path, 'utf-8');
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

      // Create a PDF document
      const pdfDoc = new PDFDocument();

      // Specify the file path where you want to save the PDF
      const pdfFilePath = './uploads/generated.pdf';

      console.log('PDF file will be saved at:', pdfFilePath);
      // Pipe the PDF output to the file using 'fs' module
      pdfDoc.pipe(fs.createWriteStream(pdfFilePath));

      // Add content from the uploaded file directly to the PDF
      for (const line of lines) {
        pdfDoc.text(line, { align: 'left' });
      }

      pdfDoc.end(); // End the PDF document

        // Create a CSV file
        const csvContent = lines.join('\n');

        // Specify the file path where you want to save the CSV
        const csvFilePath = './uploads/generated.csv';

        console.log('CSV file will be saved at:', csvFilePath);
        // Write the CSV content to the file using 'fs' module
        await fs.promises.writeFile(csvFilePath, csvContent, 'utf-8');

      // Create a JSON string with line breaks similar to the original data file
        const jsonContent = '[' + lines.map((line) => {
          const values = line.split('|');
          return JSON.stringify({
            identifier: values[0],
            code: values[1],
            start_date: values[2],
            end_date: values[3],
            numeric_value: values[4],
            percentage: values[5],
            another_numeric_value: values[6],
            date: values[7],
          }, null, 2);
        }).join(',\n') + ']';

      // Specify the file path where you want to save the JSON
      const jsonFilePath = './uploads/generated.json';

      console.log('JSON file will be saved at:', jsonFilePath);
      // Write the JSON content to the file using 'fs' module
      await fs.promises.writeFile(jsonFilePath, jsonContent, 'utf-8');

      // Delete the temporary file
      await fs.promises.unlink(file.path);

      // Send a success response
      return res.status(200).json({ message: 'Upload successful', data: lines });
    } catch (error) {
      console.error('Error processing file:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
}
