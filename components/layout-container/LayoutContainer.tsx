import { Box, SlideFade, useBreakpointValue } from '@chakra-ui/react';

import Nav from '@/components/nav';
import Footer from '@/components/footer';

const LayoutContainer = ({ children }) => {

//<Nav />

	return (
		<>
			<Nav />
			<SlideFade in>
				<Box
					mt="1rem"
					minHeight={useBreakpointValue({
						base: 'calc(100vh - 186px)',
						lg: 'calc(100vh - 140px)',
					})}
				>
					{children}
				</Box>
			</SlideFade>
			<Footer />
		</>
	);
};

export default LayoutContainer;
