// pages/api/register.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { hash } from 'bcryptjs'; // For hashing passwords
import db from '../../database'; // Import your database connection

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    // This API route only accepts POST requests
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    const { username, password } = req.body;

    // Check if the username already exists in the database
    const existingUser = await db.query('SELECT * FROM users WHERE username = $1', [username]);

    if (existingUser.rows.length > 0) {
      console.log(`Registration failed for username: ${username} (Username already exists)`);
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password before storing it in the database
    const hashedPassword = await hash(password, 10);

    // Insert the new user into the database
    await db.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);

    console.log(`User registration successful for username: ${username}`);

    return res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}