import {
	Container,
	Stack,
	Flex,
	Box,
	Heading,
	Text,
	Image,
	Icon,
	useColorModeValue,
	useBreakpointValue,
} from '@chakra-ui/react';
import React from 'react';

const Hero = (props) => {
	
	const flexDisp = useBreakpointValue({ base: 'none', md: 'flex' });
	const blobColor = useColorModeValue('red.50', 'red.400');

	if (props.user) {
		return (
			<Container maxW={'7xl'}>
				<Stack
					align={'center'}
					spacing={{ base: 8, md: 10 }}
					py={{ base: 4, md: 14 }}
					direction={{ base: 'column', md: 'row' }}
				>
					<Stack flex={1} spacing={{ base: 5, md: 10 }}>
						<Heading
							lineHeight={1.1}
							fontWeight={600}
							fontSize={{ base: '4xl', lg: '6xl' }}
						>
							<Text as={'span'}>Hi, {props.user.nickname}!</Text>
						</Heading>
						<Text color={'gray.500'}>
							Congratulations, you&#39;ve successfully signed in! Sign up for a new volunteer shift today.
						</Text>
					</Stack>
					<Flex
						display={flexDisp}
						flex={1}
						justify={'center'}
						align={'center'}
						position={'relative'}
						w={'full'}
					>
						<Blob
							w={'150%'}
							h={'150%'}
							position={'absolute'}
							top={'-20%'}
							left={0}
							zIndex={-1}
							color={blobColor}
						/>
						<Box
							position={'relative'}
							height={'300px'}
							rounded={'2xl'}
							width={'full'}
							overflow={'hidden'}
						>
							<Image
								alt={'Hero Image'}
								fit="contain"
								align={'center'}
								w={'100%'}
								h={'100%'}
								src={'/cck-logo-round.png'}
							/>
						</Box>
					</Flex>
				</Stack>
			</Container>
		);

	}

	return null;

	
};

export const Blob = (props) => {
	return (
		<Icon
			width={'100%'}
			viewBox="0 0 578 440"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M239.184 439.443c-55.13-5.419-110.241-21.365-151.074-58.767C42.307 338.722-7.478 282.729.938 221.217c8.433-61.644 78.896-91.048 126.871-130.712 34.337-28.388 70.198-51.348 112.004-66.78C282.34 8.024 325.382-3.369 370.518.904c54.019 5.115 112.774 10.886 150.881 49.482 39.916 40.427 49.421 100.753 53.385 157.402 4.13 59.015 11.255 128.44-30.444 170.44-41.383 41.683-111.6 19.106-169.213 30.663-46.68 9.364-88.56 35.21-135.943 30.551z"
				fill="currentColor"
			/>
		</Icon>
	);
};

export default Hero;

