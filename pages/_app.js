import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import "../styles/globals.css";
import { UserProvider } from './api/UserContext';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <ReactQueryDevtools />
    </QueryClientProvider>
    </UserProvider>
  );
}

export default MyApp;
