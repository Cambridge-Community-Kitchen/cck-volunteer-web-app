import { ArrowForwardIcon } from '@chakra-ui/icons';
import { Flex, Button }     from '@chakra-ui/react';
import React                from 'react';

const BackToLockon = () => {
  const encodedGoogleMapsUrl = 'https://goo.gl/maps/TKn359eKxHWskMJV6'; // The Lockon

  //  const encodedGoogleMapsUrl = `https://goo.gl/maps/yURo7vxnViPK3ngf7`; // Downing Place
  return (
    <Flex direction="row" py={5}>
      <Button
        as="a"
        margin="auto"
        href={encodedGoogleMapsUrl}
        colorScheme="yellow"
        rightIcon={<ArrowForwardIcon />}
        size="sm"
        target="_blank"
      >
        Back to the Lockon
      </Button>
    </Flex>
  );
};

export default BackToLockon;
