import NextLink from 'next/link';
import classnames from 'classnames';
import { useRouter } from 'next/router';
import Image from 'next/image';
import {
	Box,
	Flex,
	Text,
	IconButton,
	Button,
	Stack,
	Collapse,
	Icon,
	Link,
	Popover,
	useDisclosure,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from '@chakra-ui/icons';
import styles from './Nav.module.scss';
import type React from 'react';
import { setCookie } from 'cookies-next';

/**
 * The navigation bar which appears at the top of the screen
 * 
 * @returns {React.ReactElement} The navigation bar react component
 */
export default function Nav() {
	const { isOpen, onToggle } = useDisclosure();
	const router = useRouter();
	
	const onLogout = async () => {
		setCookie('AuthJWT', '', { maxAge: 0 });
		router.push('/login');
	};

	return (
		<Box>
			<Flex
				bg={'white'}
				color={'gray.600'}
				minH={'60px'}
				py={{ base: 2 }}
				px={{ base: 4 }}
				borderBottom={1}
				borderStyle={'solid'}
				borderColor={'gray.200'}
				align="center"
				justifyContent="space-between"
			>
				<Flex flexBasis="55%" justifyContent="space-between">
					<Flex ml={{ base: -2 }} display={{ base: 'flex', md: 'none' }}>
						<IconButton
							onClick={onToggle}
							icon={
								isOpen ? (
									<CloseIcon w={3} h={3} />
								) : (
									<HamburgerIcon w={5} h={5} />
								)
							}
							variant={'ghost'}
							aria-label={'Toggle Navigation'}
						/>
					</Flex>
					<Flex alignItems="center" justify={{ base: 'center', md: 'start' }}>
						<Link as={NextLink} href="/">
							<a>
								<Image
									alt="Cambridge Community Kitchen logo"
									src="/cck-simple.png"
									width="36"
									height="30"
								/>
							</a>
						</Link>

						<Flex display={{ base: 'none', md: 'flex' }} ml={10}>
							<DesktopNav currentPathname={router.pathname} />
						</Flex>
					</Flex>
				</Flex>

				<Button
					onClick={onLogout}
					fontSize={'sm'}
					fontWeight={600}
					color={'white'}
					bg={'green.400'}
					_hover={{
						bg: 'green.300',
					}}
				>
					Logout
				</Button>
			</Flex>

			<Collapse in={isOpen} animateOpacity>
				<MobileNav />
			</Collapse>
		</Box>
	);
}

const DesktopNav = ({ currentPathname }) => {
	return (
		<Stack direction={'row'} spacing={4}>
			{NAV_ITEMS.map((navItem) => (
				<Flex alignItems="center" key={navItem.label}>
					<Popover trigger={'hover'} placement={'bottom-start'}>
						{navItem.newWindow ? (
							<Link as={NextLink} href={navItem.href} passHref>
								<a
									className={classnames(
										styles.navLink,
										currentPathname === navItem.href && styles.active,
									)}
									target="_blank"
								>
									{navItem.label}
								</a>
							</Link>
						) : (
							<Link as={NextLink} href={navItem.href}>
								<a
									className={classnames(
										styles.navLink,
										currentPathname === navItem.href && styles.active,
									)}
								>
									{navItem.label}
								</a>
							</Link>
						)}
					</Popover>
				</Flex>
			))}
		</Stack>
	);
};

const MobileNav = () => {
	return (
		<Stack bg={'white'} p={4} display={{ md: 'none' }}>
			{NAV_ITEMS.map((navItem) => (
				<MobileNavItem key={navItem.label} {...navItem} />
			))}
		</Stack>
	);
};

const MobileNavItem = ({ label, children, href }) => {
	const { isOpen, onToggle } = useDisclosure();

	return (
		<Stack spacing={4} onClick={children && onToggle}>
			<Flex
				py={2}
				as={Link}
				href={href ?? '#'}
				justify={'space-between'}
				align={'center'}
				_hover={{
					textDecoration: 'none',
				}}
			>
				<Text fontWeight={600} color={'gray.600'}>
					{label}
				</Text>
				{children && (
					<Icon
						as={ChevronDownIcon}
						transition={'all .25s ease-in-out'}
						transform={isOpen ? 'rotate(180deg)' : ''}
						w={6}
						h={6}
					/>
				)}
			</Flex>

			<Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
				<Stack
					mt={2}
					pl={4}
					borderLeft={1}
					borderStyle={'solid'}
					borderColor={'gray.200'}
					align={'start'}
				>
					{children &&
						children.map((child) => (
							<Link as={NextLink} key={child.label} py={2} href={child.href}>
								{child.label}
							</Link>
						))}
				</Stack>
			</Collapse>
		</Stack>
	);
};

const NAV_ITEMS = [
/*	{
		label: 'About',
		href: '/about',
	},
	{
		label: 'Events',
		href: '/events',
	},
	{
		label: 'Blog',
		href: '/blog',
	},
	{
		label: 'Volunteer Info',
		href: 'https://bit.ly/CCKwelcomepack',
		newWindow: true,
	},*/
];
