import { Pool } from 'pg';

const pool = new Pool({
  user: 'your_database_user',
  host: 'localhost',
  database: 'your_database_name',
  password: 'your_database_password',
  port: 5432, // Change to your PostgreSQL port
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username } = req.body;

    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM users WHERE username = $1',
      [username]);

      if (result.rowCount > 0) {
        // User exists in the database
        res.status(200).json({ exists: true });
      } else {
        // User does not exist in the database
        res.status(200).json({ exists: false });
      }

      client.release();
    } catch (error) {
      console.error('Error checking user existence:', error);
      res.status(500).json({ error: 'An error occurred while checking user existence'
    });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
