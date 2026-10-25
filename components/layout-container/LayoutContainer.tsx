import { Box, SlideFade, useBreakpointValue } from '@chakra-ui/react';

import Footer from '@/components/footer';
import Nav    from '@/components/nav';

const LayoutContainer = ({ children }) => (
  <>
    <Nav />
    { /* @ts-expect-error children seem to be missing from chakra ui container typings */ }
    <SlideFade in>
      <Box
        mt="1rem"
        minHeight={useBreakpointValue({
          base : 'calc(100vh - 186px)',
          lg   : 'calc(100vh - 140px)',
        })}
      >
        {children}
      </Box>
    </SlideFade>
    <Footer />
  </>
);

export default LayoutContainer;
