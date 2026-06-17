import {
  ChatIcon,
  CheckIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  NotAllowedIcon,
  PhoneIcon,
} from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react';

import PropTypes       from 'prop-types';
import React, { memo } from 'react';
import styles          from './Item.module.scss';
import { decode }      from 'pluscodes';

const Item = ({ data, markComplete, portions, unmarkComplete }) => {
  const encodedGoogleMapsUrl = `https://www.google.com/maps/place/${ encodeURIComponent(
    data.plusCode
  ) }`;

  const { latitude, longitude } = decode(String(data.plusCode).toUpperCase()) ?? {};
  const encodedOpenStreetMapUrl = `https://www.openstreetmap.org/directions?to=${latitude},${longitude}#map=19/${latitude}/${longitude}`;

  const portionsString = portions > 1 ? 'portions' : 'portion';

  if (data?.completed) {
    return (
      <>
        <li className={styles.item}>
          <Box ml="3" py="3">
            <Box
              display="flex"
              alignItems="baseline"
              justifyContent="space-between"
            >
              <Text
                color="gray.400"
                fontSize="xl"
                fontWeight="bold"
              >
                {data.name}
              </Text>
              <Button
                colorScheme="green"
                mr={2}
                onClick={unmarkComplete}
              >
                <CheckIcon h="5" w="5" />
              </Button>
            </Box>
          </Box>
        </li>
        <Divider />
      </>
    );
  }

  return (
    <>
      <li className={styles.item}>
        <Box ml="3" py="3">
          <Box
            display="flex"
            alignItems="baseline"
            justifyContent="space-between"
          >
            <Text fontSize="xl" fontWeight="bold">
              {data.name}
            </Text>
            <Text color="gray" fontSize="sm" mr="2">
              {data.plusCode}
            </Text>
          </Box>
          <Text color="gray.500">{data.address}</Text>
          <Box display="flex" alignItems="baseline">
            <Badge
              colorScheme="green"
              fontSize={24}
              minWidth={30}
              textAlign="center"
              variant="solid"
            >
              {portions}
            </Badge>
            <Text color="gray.500" ml={1} fontSize={18}>
              {portionsString}
            </Text>
          </Box>
          <Text color="gray.500" fontSize="sm">
            {data.notes}
          </Text>
          <Text color="red.500" fontSize="sm">
            {data.allergies}
          </Text>
          {data.whenNotHome && (
            <Text color="gray.500" fontSize="sm">
              <strong>
                If no-one&#39;s home and you can&#39;t make contact:{' '}
              </strong>
              {data.whenNotHome}
            </Text>
          )}

          <Stack direction="row" mt="4" spacing={3}>
            {data.plusCode && (
              <Menu>
                <MenuButton
                  colorScheme="teal"
                  as={Button}
                  rightIcon={<ChevronDownIcon h="3" w="3" />}
                >
                  Find front door
                </MenuButton>
                <MenuList colorScheme="teal" lineHeight={1.2}>
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
                    <small>{ data.plusCode }</small>
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
            )}
            {data.phone && (
              <Menu>
                <MenuButton
                  colorScheme="teal"
                  as={Button}
                  rightIcon={<ChevronDownIcon h="3" w="3" />}
                >
                  Call
                </MenuButton>
                <MenuList colorScheme="teal">
                  <MenuItem isFocusable={false}>{data.phone}</MenuItem>
                  <MenuItem
                    as="a"
                    href={`tel:${ data.phone }`}
                    icon={<PhoneIcon h="3" w="3" />}
                  >
                    Telephone call
                  </MenuItem>
                  <MenuItem
                    as="a"
                    href={`tel:141${ data.phone }`}
                    icon={<NotAllowedIcon h="3" w="3" />}
                  >
                    Call but withhold your number
                  </MenuItem>
                  {/^([+]44|0044|0)7/.test(data.phone) && (
                    <MenuItem
                      as="a"
                      href={`sms:${ data.phone }`}
                      icon={<ChatIcon h="3" w="3" />}
                    >
                      Text Message
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
            )}
            <Spacer />
            <Button
              colorScheme="green"
              mr={2}
              onClick={markComplete}
              variant="outline"
            >
              <CheckIcon h="5" w="5" />
            </Button>
          </Stack>
        </Box>
      </li>
      <Divider />
    </>
  );
};

Item.propTypes = {
  data           : PropTypes.object.isRequired,
  markComplete   : PropTypes.func.isRequired,
  portions       : PropTypes.string.isRequired,
  unmarkComplete : PropTypes.func.isRequired,
};

export default memo(Item);
