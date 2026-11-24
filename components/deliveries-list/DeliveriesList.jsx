import { Box, Button, Text, Flex }                 from '@chakra-ui/react';
import { FaWpforms }                               from 'react-icons/fa';
import dayjs                                       from 'dayjs';
import customParseFormat                           from 'dayjs/plugin/customParseFormat';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { getRouteData }                            from '@/components/api';
import BackToLockon                                from '../back-to-lockon';
import LoadingSpinner                              from '../loading-spinner';
import styles                                      from './DeliveriesList.module.scss';
import Dish                                        from './Dish';
import Item                                        from './item';
import RoutePreviewButton                          from './RoutePreviewButton';

dayjs.extend(customParseFormat);

const MAX_DROPS_PER_GOOGLE_MAPS_ROUTE = 11;

/**
 *
 * @param {string} originalCode
 * @returns {string}
 */

const addPlusCodePrefix = (originalCode) => {
  if (originalCode.length <= 13 && originalCode.includes('+')) { // then it's a PlusCode
    if (originalCode.indexOf('+') === 4) {
      return `9f42${ originalCode }`;
    }
  }

  return originalCode;
};

const buildRoutePreviewLinks = (routeData) => {
  const googleRouteBaseUrl = 'https://www.google.com/maps/dir';

  const originForUrl       = 'The Lockon, Fair Street, Cambridge';
  console.log(`routeData.deliveries.length`, routeData.deliveries.length)
  const uniquePlusCodesAndLockonStartAndFinish = [ originForUrl, ...new Set(routeData.deliveries.map(item => addPlusCodePrefix(item.plus_code))), originForUrl ].map(encodeURIComponent);

  console.log(`uniquePlusCodesAndLockonStartAndFinish.length`, uniquePlusCodesAndLockonStartAndFinish.length)

  const googleRouteUrls    = [];
  const chunkSize          = MAX_DROPS_PER_GOOGLE_MAPS_ROUTE;

  for (let index = 0; index < uniquePlusCodesAndLockonStartAndFinish.length; index += chunkSize - 1) {
    const selectedPlusCodes = uniquePlusCodesAndLockonStartAndFinish.slice(index, index + chunkSize);
    console.log(`selectedPlusCodes`, selectedPlusCodes);

    const origin = selectedPlusCodes.at(0);
    const destination = selectedPlusCodes.at(-1);
    const waypoints = selectedPlusCodes.slice(1, selectedPlusCodes.length - 1);

    //  NOTE: this for loop can only ever loop twice, so I'm using index===0 to mean "first loop"
    const startplaceText = index === 0 ? 'From Lockon' : `From drop ${index}`;
    const firstDrop = index === 0 ? index + 1 : index;
    const lastDrop = index === 0 ? index + selectedPlusCodes.length - 1 : index + selectedPlusCodes.length - 2;

    let toText = `drops ${firstDrop} - ${lastDrop}`;
    if (firstDrop === uniquePlusCodesAndLockonStartAndFinish.length - 2) {
      // pluscodes is unique
      toText = ``;
    } else if (lastDrop - firstDrop === 1) {
      toText = `drop ${lastDrop}`;
    }
    const endText =  index !== 0 ? `back to Lockon` : undefined;

    googleRouteUrls.push(
      {
        url: `${ googleRouteBaseUrl }/?api=1&origin=${ origin }&waypoints=${ waypoints.join('|') }&destination=${ destination }`,
        dropsDetails: [startplaceText, toText, endText].filter(Boolean).join(", ")
      }
    )
  }

  return googleRouteUrls;
}

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
  const googleRouteUrls = buildRoutePreviewLinks(routeData);

  let uniquePluscodeIndex = 0;
  let prevPluscode = '';
  const deliveries = routeData.deliveries.map((drop) => {
    if (drop.plus_code !== prevPluscode) {
      uniquePluscodeIndex++
    }
    prevPluscode = drop.plus_code
    return {
      ...drop,
      uniquePluscodeIndex
    }
  });

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
      <Flex direction="row" px={2} py={2} justifyContent="center">
        <RoutePreviewButton googleRouteUrls={googleRouteUrls} travelmode="bicycling">
          Cycle route overview
        </RoutePreviewButton>
      </Flex>
      <Flex direction="row" px={2} py={2} justifyContent="center">
        <RoutePreviewButton googleRouteUrls={googleRouteUrls} travelmode="driving">
          Driving route overview
        </RoutePreviewButton>
      </Flex>
      <Flex direction="row" px={2} py={2}>
        <Button
          as="a"
          mx="auto"
          href="https://bit.ly/CCKroutedebrief"
          leftIcon={<FaWpforms />}
          colorScheme="purple"
          target="_blank"
        >
          Submit a debrief form
        </Button>
      </Flex>
      <ul className={styles.list}>
        {deliveries.map((item, index) => {
          const portions         = item.portions;
          const itemForRendering = {
            ...item,
            plusCode    : addPlusCodePrefix(item.plus_code),
            whenNotHome : item.when_not_home,
          };

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
