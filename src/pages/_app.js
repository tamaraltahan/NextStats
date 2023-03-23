import '@/styles/globals.css'
import { createTheme, NextUIProvider } from '@nextui-org/react';
import styles from '../styles/styles.css'


export default function App({ Component, pageProps }) {
  const darkTheme = createTheme({
    type: 'dark',
    theme: {},
  });
  
  return (
  <NextUIProvider theme={darkTheme}>
    <Component {...pageProps} />
  </NextUIProvider>
  );
}
