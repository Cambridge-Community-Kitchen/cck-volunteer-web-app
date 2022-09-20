import styles from './Splash.module.scss';
import {
	Image,
	SlideFade,
	Box,
	Text,
	Heading
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import type React from 'react';


/**
 * Briefly displays a full-splash screen
 * 
 * @returns {React.ReactElement} The splash screen react component
 */
export default function Splash(props): React.ReactElement {
	const [isVisible, setVisible] = useState(true);	

	useEffect(() => {
		const timeout = setTimeout(() => {
			setVisible(false);
			if (props.onComplete !== null && typeof props.onComplete === 'function') {
				props.onComplete();
			}
		}, 2250);

		return () => clearTimeout(timeout);

	}, [props]);

	return isVisible ? <div className={styles.splash}>
			<SlideFade className={styles.logoFade} offsetY='80vh' in>
				<Image
					maxHeight="50vh"
					maxWidth="80vw"
					minHeight="300px"
					alt={'Hero Image'}
					fit="contain"
					align={'center'}
					src={'/cck-logo-round.png'}
				/>
				<Box paddingTop="5" height='20vh'>
				<Heading
						lineHeight={1.1}
						fontWeight={600}
						fontSize={{ base: '4xl', lg: '6xl' }}
					><Text>Volunteer App</Text>
					</Heading>
				</Box>
			</SlideFade>
		</div> : null;
}