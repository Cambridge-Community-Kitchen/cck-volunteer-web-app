import Image from 'next/image';
import {
	Box,
	chakra,
	Container,
	Flex,
	Stack,
	Text,
	useColorModeValue,
	VisuallyHidden,
} from '@chakra-ui/react';
import { FaInstagram, FaTwitter, FaFacebook } from 'react-icons/fa';

const Footer = () => {
	return (
		<Box
			bg={useColorModeValue('gray.50', 'gray.900')}
			color={useColorModeValue('gray.700', 'gray.200')}
		>
			<Container
				as={Stack}
				maxW={'6xl'}
				py={4}
				direction={{ base: 'column', md: 'row' }}
				spacing={4}
				justify={{ base: 'center', md: 'space-between' }}
				align={{ base: 'center', md: 'center' }}
			>
				<Logo />
				<Stack direction="row" spacing={6}>
					<SocialButton
						label="Instagram"
						href="https://www.instagram.com/cambridgecommunitykitchen/"
					>
						<FaInstagram />
					</SocialButton>
					<SocialButton label="Twitter" href="https://twitter.com/camcommunity">
						<FaTwitter />
					</SocialButton>
					<SocialButton
						label="Facebook"
						href="https://www.facebook.com/cambridgecommunitykitchen"
					>
						<FaFacebook />
					</SocialButton>
				</Stack>
			</Container>
		</Box>
	);
};

export default Footer;

const Logo = () => {
	return (
		<Flex>
			<Image
				alt="Cambridge Community Kitchen logo"
				src="/cck-simple.png"
				width="38"
				height="30"
			/>
			<Text fontWeight="bold" ml={3}>
				Cambridge Community Kitchen
			</Text>
		</Flex>
	);
};

const SocialButton = ({ children, label, href }) => {
	return (
		<chakra.button
			bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
			rounded="full"
			w={8}
			h={8}
			cursor="pointer"
			as="a"
			href={href}
			display="inline-flex"
			alignItems="center"
			justifyContent="center"
			transition={'background 0.3s ease'}
			target="_blank"
			_hover={{
				bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
			}}
		>
			<VisuallyHidden>{label}</VisuallyHidden>
			{children}
		</chakra.button>
	);
};
