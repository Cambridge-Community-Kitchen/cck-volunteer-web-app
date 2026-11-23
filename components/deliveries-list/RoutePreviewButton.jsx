import { ArrowForwardIcon, ChevronDownIcon, FaBiking, FaCarAlt } from '@chakra-ui/icons';
import { Button, Menu, MenuButton, MenuItem, MenuList }          from '@chakra-ui/react';

const RoutePreviewButton = ({ googleRouteUrls, travelmode, children }) =>
  googleRouteUrls.length === 1
  ? <Button
    as="a"
    mx="auto"
    href={`${ googleRouteUrls[0] }&travelmode=${ travelmode }`}
    rightIcon={<ArrowForwardIcon />}
    leftIcon={travelmode == 'bicycling' ? <FaBiking /> : <FaCarAlt />}
    colorScheme="blue"
    target="_blank"
  >
    {children}
  </Button>
  : <Menu>
    <MenuButton
      colorScheme="blue"
      as={Button}
      rightIcon={<ChevronDownIcon h="3" w="3" />}
      leftIcon={travelmode == 'bicycling' ? <FaBiking /> : <FaCarAlt />}
    >
      {children}
    </MenuButton>
    <MenuList colorScheme="blue">
      {googleRouteUrls.map((url, index) => (
        <MenuItem as="a" href={`${ url }&travelmode=${ travelmode }`} rightIcon={<ArrowForwardIcon />} target="_blank">
          Preview part {index + 1}
        </MenuItem>
      ))}
    </MenuList>
  </Menu>;

export default RoutePreviewButton;