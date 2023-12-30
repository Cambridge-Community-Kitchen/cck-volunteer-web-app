import { ArrowForwardIcon }                        from '@chakra-ui/icons';
import { Box, Button, Text, Flex }                 from '@chakra-ui/react';
import dayjs                                       from 'dayjs';
import customParseFormat                           from 'dayjs/plugin/customParseFormat';
import React, { useCallback, useEffect, useState } from 'react';
import { getRouteData }                            from '@/components/api';
import BackToLockon                                from '../back-to-lockon';
import LoadingSpinner                              from '../loading-spinner';
import styles                                      from './DeliveriesList.module.scss';
import Dish                                        from './Dish';
import Item                                        from './item';

dayjs.extend(customParseFormat);

const DeliveriesList = ({ date, id_ref: idRef, passcode, mode, basePath }) => {
  const [ displayDish, setDisplayDish ] = useState(false);
  const [ isLoading, setIsLoading ]     = useState(null);
  const [ routeData, setRouteData ]     = useState();

  const dishes = [
    {
      title : 'Main dish',
      info  : routeData?.event?.addl_info?.dishOfTheDay,
    },
    {
      title : 'Alternate dish',
      info  : routeData?.event?.addl_info?.alternateDish,
    },
  ].filter(dish => dish.info);

  useEffect(() => {
    setIsLoading(true);
    getRouteData({ basePath, date, ref: idRef, passcode, mode }).then((response) => {
      response.json().then((data) => {
        setRouteData(data);
        // Temporarily hardcoded to true; previous logic said only show dish if it's within the last 3 days
        setDisplayDish(true);
        setIsLoading(false);
      });
    });
  }, [ basePath, date, idRef, passcode, mode ]);

  const updateItemCompletion = useCallback(
    (id, value) => {
      const routeDataCopy = JSON.parse(JSON.stringify(routeData));

      routeDataCopy.deliveries[id].completed = value;
      setRouteData(routeDataCopy);
    },
    [ routeData ]
  );

  const markItemComplete = useCallback(
    id => updateItemCompletion(id, true),
    [ updateItemCompletion ]
  );

  const unmarkItemComplete = useCallback(
    id => updateItemCompletion(id, false),
    [ updateItemCompletion ]
  );

  if (!routeData || isLoading) return <LoadingSpinner />;

  const region = routeData.name;

  if (routeData.result) {
    return <div>{routeData.result}</div>;
  }

  const rDate         = new Date(routeData.event.start_date);
  const formattedDate = `${ (rDate.getDate() > 9) ? rDate.getDate() : (`0${  rDate.getDate() }`)  }/${  (rDate.getMonth() > 8) ? (rDate.getMonth() + 1) : (`0${  rDate.getMonth() + 1 }`)  }/${  rDate.getFullYear() }`;

  const googleRouteBaseUrl = 'https://www.google.com/maps/dir';
  const plusCodes          = routeData.deliveries.map(item => item.plus_code);
  const originForUrl       = encodeURIComponent('The Lockon, Fair Street, Cambridge');
  const googleRouteUrl     = `${ googleRouteBaseUrl }/?api=1&origin=${
    originForUrl
  }&waypoints=${
    plusCodes.map(encodeURIComponent).join('|')
  }&destination=${
    originForUrl
  }`;
  // We could also set `&travelmode=${mode}` but mode is never actually passed in.

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
      {displayDish && dishes.length && dishes.map(
        dish => (
          <Dish
            dish_info={dish.info}
            dish_title={dish.title}
            key={dish.title}
          />
        )
      )}
      <Flex direction="row" px={2} py={2}>
        <Button
          as="a"
          mx="auto"
          href={`${ googleRouteUrl }&travelmode=bicycling`}
          rightIcon={<ArrowForwardIcon />}
          colorScheme="blue"
          target="_blank"
        >
          Google Bike Route
        </Button>
      </Flex>
      <Flex direction="row" px={2} py={2}>
        <Button
          as="a"
          mx="auto"
          href={`${ googleRouteUrl }&travelmode=driving`}
          rightIcon={<ArrowForwardIcon />}
          colorScheme="blue"
          target="_blank"
        >
          Google Driving Route
        </Button>
      </Flex>
      {/* This now fails with error: You must enable Billing on the Google Cloud Project...
      <Flex direction="row" px={2} py={2}>
        <Button
          as="a"
          mx="auto"
          onClick={() => {
            router.push({
              pathname : '/api/cck/route.gpx',
              query    : {
                date     : date,
                ref      : idRef,
                passcode : passcode,
                mode     : mode,
              },
            });
          }}
          rightIcon={<ArrowForwardIcon />}
          colorScheme="blue"
          target="_blank"
          tabindex={0}
        >
          Download route as GPX
        </Button>
      </Flex>
      */}
      <Flex direction="row" px={2} py={2}>
        <Button
          as="a"
          mx="auto"
          href="https://bit.ly/CCKroutedebrief"
          rightIcon={<ArrowForwardIcon />}
          colorScheme="blue"
          target="_blank"
        >
          Route Debrief
        </Button>
      </Flex>
      <ul className={styles.list}>
        {routeData.deliveries.map((item, index) => {
          const portions         = item.portions;
          const itemForRendering = {
            ...item,
            plusCode    : item.plus_code,
            whenNotHome : item.when_not_home,
          };

          if (item.plus_code.length <= 13 && item.plus_code.includes('+')) { // then it's a PlusCode
            if (item.plus_code.indexOf('+') === 4) {
              itemForRendering.plus_code = `9f42${ item.plus_code }`;
            }
          }

          return (
            <Item
              data={itemForRendering}
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
