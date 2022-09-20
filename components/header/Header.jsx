import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import Image from 'next/image';


const Header = () => (
	<div>
		<Box display="flex" alignItems="center" justifyContent="center" mx="4" my="6">
			<Image margin="auto" alt="CCK Logo" src="/logo.png" height={50} width={50} />
			<Heading ml={2}>CCK Deliveries</Heading>
		</Box>
	</div>
);

export default Header;
