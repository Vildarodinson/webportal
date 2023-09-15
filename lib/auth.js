import { getSession } from 'next-auth/react';

export const requireAuthentication = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login', // Redirect to the login page if not authenticated
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
