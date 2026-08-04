import { ArrowForwardIcon, ChevronDownIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Flex, Button, Menu, MenuButton, MenuList, MenuItem }     from '@chakra-ui/react';
import React                from 'react';

const BackToLockon = () => {
  const encodedGoogleMapsUrl = 'https://goo.gl/maps/TKn359eKxHWskMJV6'; // The Lockon
  const latitude = "52.207312";
  const longitude = "0.129301";
  const plusCode = "9F42644H+WRQ";
  const encodedOpenStreetMapUrl = "https://www.openstreetmap.org/directions?to=52.207347%2C0.12940";

  //  const encodedGoogleMapsUrl = `https://goo.gl/maps/yURo7vxnViPK3ngf7`; // Downing Place
  return (
    <Flex direction="row" py={5} justify="center">
      <Menu margin="auto" size="sm">
        <MenuButton
          colorScheme="yellow"
          as={Button}
          rightIcon={<ChevronDownIcon h="3" w="3" />}
        >
          Back to the Lockon
        </MenuButton>
        <MenuList lineHeight={1.2}>
          <MenuItem
            as="a"
            href={`geo:${ latitude },${ longitude }`}
            icon={<ExternalLinkIcon h="3" w="3" />}
          >
            <div>Open in your default app</div>
            <small>{ latitude },{ longitude }</small>
          </MenuItem>
          <MenuItem
            as="a"
            href={encodedGoogleMapsUrl}
            target="_blank"
            icon={<ExternalLinkIcon h="3" w="3" />}
          >
            <div>Google Maps</div>
            <small>{ plusCode }</small>
          </MenuItem>
          <MenuItem
            as="a"
            href={encodedOpenStreetMapUrl}
            target="_blank"
            icon={<ExternalLinkIcon h="3" w="3" />}
          >
            <div>OpenStreetMap</div>
            <small>{ latitude },{ longitude }</small>
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default BackToLockon;
