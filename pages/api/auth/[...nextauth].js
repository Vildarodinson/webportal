import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import pool from '../../../db';

export default NextAuth({
    providers: [
        Providers.Credentials({
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            authorize: async (credentials) => {
                const client = await pool.connect();

            try {
                const { rows } = await client.query(
                'SELECT * FROM users WHERE username = $1',
                [credentials.username]
            );

            if (rows.length === 1 && rows[0].password === credentials.password) {
                // Authentication successful
                return Promise.resolve({ id: rows[0].id, username: rows[0].username });
             } else {
                // Authentication failed
                return Promise.resolve(null);
            }
        } finally {
            client.release();
        }
      },
    }),
  ],
  callbacks: {
    async session(session, user) {
        session.user.id = user.id;
        session.user.username = user.username;
        return session;
    },
  },
});
