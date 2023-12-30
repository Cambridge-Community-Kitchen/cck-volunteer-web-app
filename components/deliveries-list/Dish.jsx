import { Box, Text } from '@chakra-ui/react';
import React         from 'react';

const Dish = ({ dish_info: dishInfo, dish_title: dishTitle }) => (
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
        {dishTitle}: {dishInfo?.dish}
      </Text>
    </Box>
    <Box
      alignItems="flex-start"
      display="flex"
      justifyContent="flex-start"
    >
      <Text fontSize={14}>
        <span>Ingredients:</span>{' '}
        <strong>{dishInfo?.ingredients}</strong>
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
      {dishInfo.allergens ? (
        <Text fontSize={14} ml={1}>
          {dishInfo?.allergens}
        </Text>
      ) : (
        <Text fontSize={14} ml={1}>
          No allergens
        </Text>
      )}
    </Box>
  </Box>
);

export default Dish;
