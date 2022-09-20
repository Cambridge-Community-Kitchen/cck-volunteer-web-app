import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Text, Flex } from '@chakra-ui/react';
import dayjs from 'dayjs';
import Item from './item';
import LoadingSpinner from '../loading-spinner';
import BackToLockon from '../../components/back-to-lockon';
import styles from './DeliveriesList.module.scss';
import { getRouteData } from '@/components/api';
import { useRouter } from 'next/router';
import { ArrowForwardIcon } from '@chakra-ui/icons';

import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const DeliveriesList = ({ date, id_ref, passcode, mode, basePath }) => {
	const [displayDish, setDisplayDish] = useState(false);
	const [isLoading, setIsLoading] = useState(null);
	const [routeData, setRouteData] = useState();

	const dishOfTheDay = routeData?.event?.addl_info?.dishOfTheDay;
	const router = useRouter();

	useEffect(() => {
		setIsLoading(true);
		getRouteData({basePath, date, ref:id_ref, passcode, mode}).then((response) => {
			response.json().then((data) => {
				setRouteData(data);
				// Temporarily hardcoded to true; previous logic said only show dish if it's within the last 3 days
				setDisplayDish(true);
				setIsLoading(false);
			});
		});
	}, [basePath, date, id_ref, passcode, mode]);

	const updateItemCompletion = useCallback(
		(id, value) => {
			const routeDataCopy = JSON.parse(JSON.stringify(routeData));
			routeDataCopy.deliveries[id]['completed'] = value;
			setRouteData(routeDataCopy);
		},
		[routeData],
	);

	const markItemComplete = useCallback(
		(id) => updateItemCompletion(id, true),
		[updateItemCompletion],
	);

	const unmarkItemComplete = useCallback(
		(id) => updateItemCompletion(id, false),
		[updateItemCompletion],
	);

	if (!routeData || isLoading) return <LoadingSpinner />;

	const region = routeData.name;

	if (routeData.result) {
		return <div>{routeData.result}</div>;
	}
	
	const rDate = new Date(routeData.event.start_date);
	const formattedDate = ((rDate.getDate() > 9) ? rDate.getDate() : ('0' + rDate.getDate())) + '/' + ((rDate.getMonth() > 8) ? (rDate.getMonth() + 1) : ('0' + (rDate.getMonth() + 1))) + '/' + rDate.getFullYear();
	
	return (
		<div className={styles.root}>
			<Box display="flex" justifyContent="space-between">
				<Box display="flex" ml={2} mr={2}>
					<Text>Deliveries for </Text>
					<Text fontWeight={700} ml={1}>
					{formattedDate}
					</Text>
					<Text>&nbsp;in </Text>
					<Text fontWeight={700} ml={1}>
						{region}
					</Text>
				</Box>
			</Box>
			{displayDish && dishOfTheDay && (
				<Box
					border="2px"
					borderColor="gray.200"
					borderRadius={5}
					p={1}
					m={2}
				>
					<Box
						alignItems="center"
						display="flex"
						justifyContent="flex-start"
					>
						<Text
							fontWeight="bold"
							fontSize={16}
							textTransform="uppercase"
						>
							{dishOfTheDay?.dish}
						</Text>
					</Box>
					<Box
						alignItems="flex-start"
						display="flex"
						justifyContent="flex-start"
					>
						<Text fontSize={14}>
							<span>Ingredients:</span>{' '}
							<strong>{dishOfTheDay?.ingredients}</strong>
						</Text>
					</Box>

					<Box
						alignItems="center"
						display="flex"
						justifyContent="flex-start"
					>
						<Text color="red.400" fontSize={14} fontWeight="bold">
							Allergens:
						</Text>
						{dishOfTheDay.allergens ? (
							<Text fontSize={14} ml={1}>
								{dishOfTheDay?.allergens}
							</Text>
						) : (
							<Text fontSize={14} ml={1}>
								No allergens
							</Text>
						)}
					</Box>
				</Box>
			)}
			<Flex direction="row">
			<Button
				margin="auto"
				as="a"
				onClick={() => {
					router.push({
						pathname: '/api/cck/route.gpx',
						query: {
							date: date,
							ref: id_ref,
							passcode: passcode,
							mode: mode
						}
					});
				}}
				rightIcon={<ArrowForwardIcon />}
				colorScheme="blue"
				target="_blank"
			>
				Download route as GPX
			</Button></Flex>
			<ul className={styles.list}>
				{routeData.deliveries.map((item, index) => {
					const portions = item.portions;
					
					if (item.plus_code.length <= 13 && item.plus_code.includes("+")) { //then it's a PlusCode
						if (item.plus_code.indexOf("+")==4) {
							item.plus_code = "9f42"+item.plus_code;
						}
					}
					item.plusCode = item.plus_code;
					item.whenNotHome = item.when_not_home;
					return (
						<Item
							data={item}
							key={index.toString()}
							markComplete={() => markItemComplete(index)}
							portions={portions.toString()}
							unmarkComplete={() => unmarkItemComplete(index)}
						/>
					);
				})}
			</ul>
			<BackToLockon />
		</div>
	);
};

export default DeliveriesList;
