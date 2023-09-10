import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../database'; // Import your database connection
import { compare } from 'bcryptjs'; // For comparing passwords
import { sign } from 'jsonwebtoken'; // For JWT

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    // This API route only accepts POST requests
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    const { username, password } = req.body;

    console.log(`User login attempt with username: ${username}`);

    // Check if it's the admin user with the plain text password 'admin'
    if (username === 'admin' && password === 'admin') {
      // If it's the admin user, allow login without JWT or hashed password
      return res.status(200).json({ message: 'Admin login successful' });
    }

    // For regular users, check if the username exists in the database
    const user = await db.query('SELECT * FROM users WHERE username = $1', [username]);

    if (user.rows.length === 0) {
      console.log(`Login failed for username: ${username}`);
      return res.status(401).json({ message: 'Wrong username or password' });
    }

    const hashedPassword = user.rows[0].password; // Get the hashed password from the database

    // Use bcrypt to compare the user-provided password with the stored hashed password
    const isPasswordValid = await compare(password, hashedPassword);

    if (isPasswordValid) {
      // Passwords match, create a JWT token for regular users
      const token = sign({ userId: user.rows[0].id, isAdmin: false }, 'your-secret-key', {
        expiresIn: '1h', // Token expiration time
      });
      return res.status(200).json({ message: 'User login successful', token });
    } else {
      return res.status(401).json({ message: 'Wrong username or password' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
