import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const Dish = ({ dish_info }) => {
  return (
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
          {dish_info?.dish}
        </Text>
      </Box>
      <Box
        alignItems="flex-start"
        display="flex"
        justifyContent="flex-start"
      >
        <Text fontSize={14}>
          <span>Ingredients:</span>{' '}
          <strong>{dish_info?.ingredients}</strong>
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
        {dish_info.allergens ? (
          <Text fontSize={14} ml={1}>
            {dish_info?.allergens}
          </Text>
        ) : (
          <Text fontSize={14} ml={1}>
            No allergens
          </Text>
        )}
      </Box>
    </Box>
	);
};

export default Dish;
