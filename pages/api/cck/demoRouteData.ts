type Delivery = {
  portions: number;
  name: string;
  phone?: string;
  address: string;
  plus_code: string;
  allergies?: string;
  notes?: string;
  when_not_home?: string;
};

type Dish = {
  dish: string;
  ingredients: string;
  allergens: string;
};

type RouteData = {
  deliveries: Delivery[];
  route_delivery: string;
  name: string;
  event: {
    start_date: Date | string;
    addl_info: {
      dishOfTheDay?: Dish;
      alternateDish?: Dish;
    }
  };
};

// All of this is fake data. Numbers in ranges from:
// https://www.ofcom.org.uk/phones-telecoms-and-internet/information-for-industry/numbering/numbers-for-drama
export const demoRouteData: RouteData = {
  deliveries: [
    {
      portions: 1,
      name: "Sarina",
      phone: "01632 567890",
      address: "9 Wiegman Road, Cambridge CB9 9SW",
      plus_code: "6574+2F",
      allergies: "",
      notes: "",
      when_not_home: "Don't leave food",
    },
    {
      portions: 9,
      name: "Lucy Bronze",
      phone: "07700 900900",
      address: "10 Lioness Road, Cambridge CB1 1LB",
      plus_code: "647F+26",
      allergies: "No spicy food",
      notes: "",
      when_not_home: "Leave at front door",
    },
    {
      portions: 1,
      name: "Millie Bright",
      phone: "00447700900900",
      address: "2b England Way, Cambridge CB7 1MB",
      plus_code: "643M+XP",
      allergies: "",
      notes: "Please be patient when ringing doorbell",
      when_not_home: "Do not leave if not in",
    },
    {
      portions: 2,
      name: "Georgia Stanway",
      phone: "+447700900900",
      address: "212, Champion Avenue, Cambridge CB7 1GS",
      plus_code: "642Q+29",
      allergies: "",
      notes: "",
      when_not_home: "",
    },
    {
      portions: 3,
      name: "Mary Earps",
      phone: "+441632987654",
      address: "1 Goal Close, Cambridge CB1 1ME",
      plus_code: "642F+MX",
      allergies: "Gluten intolerant",
      notes: "",
      when_not_home: "",
    },
  ],
  route_delivery: "route_delivery",
  name: "Arbury (DEMO)",
  event: {
    start_date: new Date(),
    addl_info: {
      dishOfTheDay:{
        dish        : 'Bean Soup',
        ingredients : 'water, beans, cabbage, onions, lemon juice, salt',
        allergens   : 'sulphites',
      },
      alternateDish:{
        dish        : 'Lentil Soup',
        ingredients : 'water, lentils, cabbage, onions, black pepper, salt',
        allergens   : '',
      }
    }
  }
};
