import '../styles/globals.css';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

import { useState } from 'react';
import Splash from '@/components/splash';
import type React from 'react';

const themeConfig = {
  useSystemColorMode: false,
};

const theme = extendTheme({
  themeConfig,
    components: {
      Button: {
        /*variants: {
            solid: (props) => ({
              bg: props.colorMode === 'dark' ? 'red.300' : 'red.500',
            })
        }*/
      }
  }
});

/**
 * @typedef NextJsAppParams
 * @property {React.ReactElement} Component The active Next.js page
 * @property {object} pageProps The properties passed to the component
 */

/**
 * The top-most React component, i.e., the entire app
 * 
 * @param {NextJsAppParams} params The app parameters (as defined by Next.js)
 * @returns {React.ReactElement} The app's top-level component
 * @see {@link https://nextjs.org/docs/advanced-features/custom-app|Next.js documentation}
 */
function VolunteerApp({ Component, pageProps }) {

  const [hasShownSplash, setHasShownSplash] = useState(false);

  return (
    <ChakraProvider theme={theme}>
      { hasShownSplash ? null : <Splash onComplete={() => setHasShownSplash(true)}/> }
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default VolunteerApp;
