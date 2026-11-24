import { ArrowForwardIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { FaBiking, FaCarAlt } from 'react-icons/fa';


const RoutePreviewButton = ({ googleRouteUrls, travelmode, children }) => {
  if (googleRouteUrls.length === 1) {
    return (
      <Button
        as="a"
        mx="auto"
        href={`${googleRouteUrls[0].url}&travelmode=${travelmode}`}
        rightIcon={<ArrowForwardIcon />}
        leftIcon={travelmode == 'bicycling' ? <FaBiking /> : <FaCarAlt />}
        colorScheme="blue"
        target="_blank"
      >
        {children}
      </Button>
    )
  }
  return (
    <Menu>
      <MenuButton
        colorScheme="blue"
        as={Button}
        rightIcon={<ChevronDownIcon h="3" w="3" />}
        leftIcon={travelmode == 'bicycling' ? <FaBiking /> : <FaCarAlt />}
      >
        {children}
      </MenuButton>
      <MenuList colorScheme="blue">
        <>
        {googleRouteUrls.map(({url, dropsDetails}) => (
          <MenuItem as="a" href={`${url}&travelmode=${travelmode}`} rightIcon={<ArrowForwardIcon />} target="_blank">
            {dropsDetails}
          </MenuItem>
        ))}
        </>
      </MenuList>
    </Menu>
  )
}

export default RoutePreviewButton;