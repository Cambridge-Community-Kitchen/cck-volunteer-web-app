import '@testing-library/jest-dom';
import { Organization, EventCategory, Event, EventRole, EventPosition, Person, OrganizationPerson, CCKPerson, SystemRole } from '@/components/db-connection';
import { makeAPIFriendly } from '@/components/db-connection/Person';
import events from '@/components/seed-data/Events';

const testOrg1: Organization.OrganizationInsert = {
  id_ref: "thf",
  name: "The Human Fund",
  description: "We collect funds for humans",
  event_category: [
    {
      id_ref: "cckmealdelivery",
      name: "Meal prep & delivery",
      description: "Several times a week, CCK prepares and delivers free, hot, plant-based meals to those who need them."
    }
  ]
}

const testRole1: SystemRole.SystemRoleInsert = {
  role: "test-role",
  description: "A test role that does nothing"
}

const testEvent1: Event.EventInsert = {
  id_ref: "cckmealdelivery-03-02-2022",
  name: "Meal prep & delivery Feb 03",
  start_date: new Date(),
  organization: {
    id_ref: testOrg1.id_ref
  },
  event_category: {
    id_ref: testOrg1.event_category[0].id_ref
  }
}

//const testEvent1 = Object.freeze({id_ref: "cckmealdelivery-03-02-2022", name: "Meal prep & delivery Feb 03", start_date: new Date()});


const testEventRole1 = Object.freeze({id_ref: "cckmealdelivery-03-02-2022-delivery", name: "Meal delivery", description: "Delivery volunteers deliver meals using their personal vehicle (typically a bicycle or car)."})
const testEventPosition1 = Object.freeze({id_ref: "cckmealdelivery-03-02-2022-Mill-Rd", name: "Mill Rd."});
const testPerson1: Person.PersonInsert = {
  email: "myfakeemail@test.com",
  totpsecret: "abcdefg",
  roles: [ testRole1.role ],
  organization: {
    [testOrg1.id_ref]: {
      addl_info: { nickname: "MFU" }
    }
  }
}

interface seedDataParams {
  orgs?: Organization.OrganizationInsert[];
  people?: Person.PersonInsert[];
  roles?: SystemRole.SystemRoleInsert[];
  afterSeed: (orgs: Organization.Organization[], people: Person.Person[], roles: SystemRole.SystemRole[]) => Promise<void>
}

async function seedTestData({orgs = [testOrg1], people = [testPerson1], roles = [testRole1], afterSeed}: seedDataParams) {
  
  // Create test orgs and system roles first
  const createdOrgs: Organization.Organization[] =  await Promise.all(orgs.map(async org =>  {
    
    const crOrg = await Organization.create({...org});
    await Promise.all(org.event_category.map(async category => {
      return await EventCategory.create({
        ...category,
        organization: {id: crOrg.id}
      });
    }));
    
    return crOrg;
  }));

  const createdRoles: SystemRole.SystemRole[] =  await Promise.all(roles.map(async role =>  {
    return await SystemRole.create({...role});
  }));

  // Then people, granting roles as you go
  const createdPeople: Person.Person[] =  await Promise.all(people.map(async person =>  {
    return await Person.create({...person});
  }));
  
  try {
    await afterSeed(createdOrgs, createdPeople, createdRoles);
  } catch (e) {
    throw e;
  } finally {
    for (const idx in createdOrgs) {
      await Organization.remove({id: createdOrgs[idx].id});
    }

    for (const idx in createdPeople) {
      await Person.remove({id: createdPeople[idx].id});
    }

    for (const idx in createdRoles) {
      await SystemRole.remove({id: createdRoles[idx].id});
    }
  }
}

async function standupOrg(org, afterStandup) {
  var testOrg = JSON.parse(JSON.stringify(testOrg1));
  let theOrg = await Organization.create(testOrg);
  
  try {
    await afterStandup(theOrg);
  } catch (e) {
    throw e;
  } finally {
    await Organization.remove({id: theOrg.id});
  }
}

async function createEventRole(eventRole, eventId: number) {
  const testEventRole: EventRole.EventRoleInsert = {
    event: {
      id: eventId
    },
    ...eventRole
  }
  
  return await EventRole.create(testEventRole);
}

async function createEventPosition(eventPosition, eventId, eventRoleId) {
  const testEventPosition = JSON.parse(JSON.stringify(eventPosition));
  
  testEventPosition['event'] = {
    id: eventId
  }
  testEventPosition['event_role'] = {
    id: eventRoleId
  } 
  
  return await EventPosition.create(testEventPosition);
}

/**
 * export interface EventPositionInsert extends EventPositionCoreData {
	
	// To insert an event position, you MUST provide the unique event to which this position belongs
	event: Event.EventIdentifier

	// When inserting an event position, you MAY provide the unique event role to which this position belongs
	event_role?: EventRole.EventRoleIdentifier
}
 * 
 */



it('creates an org, fetches an org by id, deletes an org by id', async () => {
  var createdId;
  await standupOrg(testOrg1, async org => {
    expect(org.name).toMatch(testOrg1.name);
    expect(org.description).toMatch(testOrg1.description);
    createdId = org.id;

    let gottenOrg = await Organization.get({id: org.id});
    expect(gottenOrg.name).toMatch(testOrg1.name);
    expect(gottenOrg.description).toMatch(testOrg1.description);

    const gottenEventCategory = await EventCategory.get({id_ref: testOrg1.event_category[0].id_ref, id_organization_ref: gottenOrg.id_ref});
    expect(gottenEventCategory.name).toMatch(testOrg1.event_category[0].name);
    expect(gottenEventCategory.description).toMatch(testOrg1.event_category[0].description);
    
  });

  let gottenOrg = await Organization.get({id: createdId});
  expect(gottenOrg).toBeNull();
});

it('fetches an org by ref', async () => {
  await standupOrg(testOrg1, async org => {
    let gottenOrg = await Organization.get({id_ref: org.id_ref});
    expect(gottenOrg.name).toMatch(testOrg1.name);
    expect(gottenOrg.description).toMatch(testOrg1.description);
  });
});

it('creates an event category, fetches by id', async () => {
  var createdId;
  await seedTestData({afterSeed: async (orgs, people, roles) => {
    
    const theEventCategory = await EventCategory.create({
      ...testOrg1.event_category[0],
      organization: testOrg1
    });
    expect(theEventCategory.name).toMatch(testOrg1.event_category[0].name);
    expect(theEventCategory.description).toMatch(testOrg1.event_category[0].description);
    createdId = theEventCategory.id;

    const gottenEventCategory = await EventCategory.get({id: theEventCategory.id});
    expect(gottenEventCategory.name).toMatch(testOrg1.event_category[0].name);
    expect(gottenEventCategory.description).toMatch(testOrg1.event_category[0].description);
}});

  const gottenCategory = await EventCategory.get({id: createdId});
  expect(gottenCategory).toBeNull();
});

it('fetches an event category using org and category refs', async () => {
  await seedTestData({afterSeed: async (orgs, people, roles) => {
    const theEventCategory = await EventCategory.create({
      ...testOrg1.event_category[0],
      organization: testOrg1
    });
    const categoryId = {
      id_organization_ref: orgs[0].id_ref,
      id_ref: theEventCategory.id_ref
    }
    
    const gottenEventCategory = await EventCategory.get(categoryId);
    expect(gottenEventCategory.id_ref).toMatch(testOrg1.event_category[0].id_ref);
    expect(gottenEventCategory.name).toMatch(testOrg1.event_category[0].name);
    expect(gottenEventCategory.description).toMatch(testOrg1.event_category[0].description);
  }});
});

it('creates an event, fetches by id', async () => {
  let createdId;
  await seedTestData({afterSeed: async (orgs, people, roles) => {
    
    const theEvent = await Event.create(testEvent1);
    expect(theEvent.id_ref).toMatch(testEvent1.id_ref);
    expect(theEvent.name).toMatch(testEvent1.name);
    expect(theEvent.id_organization).toEqual(orgs[0].id);
    createdId = theEvent.id;
    
    const gottenEvent = await Event.get({eventId:{id: createdId}});
    expect(gottenEvent.id_ref).toMatch(testEvent1.id_ref);
    expect(gottenEvent.name).toMatch(testEvent1.name);
    expect(gottenEvent.id_organization).toEqual(orgs[0].id);
  }});
});

it('updates an event', async () => {
  await seedTestData({afterSeed: async (orgs, people, roles) => {
    const theEvent = await Event.create(testEvent1);
    expect(theEvent.name).toMatch(testEvent1.name);

    const newName = "asdf";
    await Event.update({id: theEvent.id}, {
      name: newName
    })

    const gottenEvent = await Event.get({eventId: {id: theEvent.id}});
    expect(gottenEvent.name).toMatch(newName);
  }});
});


it('fetches an event using org and event refs', async () => {
  await seedTestData({afterSeed: async (orgs, people, roles) => {
    const theEvent = await Event.create(testEvent1);
    const eventId = {
      id_organization_ref: orgs[0].id_ref,
      id_ref: theEvent.id_ref
    }

    const gottenEvent = await Event.get({eventId: eventId});
    expect(gottenEvent.id_ref).toMatch(testEvent1.id_ref);
    expect(gottenEvent.name).toMatch(testEvent1.name);
  }});
});

it('creates an event role, fetches by id', async () => {
  var createdId;
  await seedTestData({afterSeed: async (orgs, people, roles) => {
    const theEvent = await Event.create(testEvent1);
    const theEventRole = await createEventRole(testEventRole1, theEvent.id);
    createdId = theEventRole.id;
    expect(createdId).toEqual(expect.any(Number));
    
    const gottenEventRole = await EventRole.get({id: createdId});
    expect(gottenEventRole.id_ref).toMatch(testEventRole1.id_ref);
    expect(gottenEventRole.name).toMatch(testEventRole1.name);
    expect(gottenEventRole.description).toMatch(gottenEventRole.description);
  }});

  expect(createdId).toEqual(expect.any(Number));
  const gottenEventRole = await EventRole.get({id: createdId});
  expect(gottenEventRole).toBeNull();
});

it('fetches an event role using refs', async () => {
  await seedTestData({afterSeed: async (orgs, people, roles) => {
    const theEvent = await Event.create(testEvent1);
    const theEventRole = await createEventRole(testEventRole1, theEvent.id);

    const eventRoleId = {
      id_organization_ref: orgs[0].id_ref,
      id_event_ref: theEvent.id_ref,
      id_ref: theEventRole.id_ref
    }

    const gottenEventRole = await EventRole.get(eventRoleId);
    expect(gottenEventRole.id_ref).toMatch(testEventRole1.id_ref);
    expect(gottenEventRole.name).toMatch(testEventRole1.name);
    expect(gottenEventRole.description).toMatch(gottenEventRole.description);
  }});
});

it('creates an event position, fetches by id', async () => {
  var createdId;
  await standupOrg(testOrg1, async org => {
    const theEvent = await Event.create(testEvent1);
    const theEventRole = await createEventRole(testEventRole1, theEvent.id);
    const theEventPosition = await createEventPosition(testEventPosition1, theEvent.id, theEventRole.id);
    createdId = theEventPosition.id;
    expect(createdId).toEqual(expect.any(Number));
    
    const gottenEventPosition = await EventPosition.get({id: createdId});
    expect(gottenEventPosition.id_ref).toMatch(testEventPosition1.id_ref);
    expect(gottenEventPosition.name).toMatch(testEventPosition1.name);
  });

  expect(createdId).toEqual(expect.any(Number));
  const gottenEventPosition = await EventPosition.get({id: createdId});
  expect(gottenEventPosition).toBeNull();
});

it('fetches an event position using refs', async () => {
  await standupOrg(testOrg1, async org => {
    const theEvent = await Event.create(testEvent1);
    const theEventRole = await createEventRole(testEventRole1, theEvent.id);
    const theEventPosition = await createEventPosition(testEventPosition1, theEvent.id, theEventRole.id);

    const eventPositionId = {
      id_organization_ref: org.id_ref,
      id_event_ref: theEvent.id_ref,
      id_ref: theEventPosition.id_ref
    }

    const gottenEventPosition = await EventPosition.get(eventPositionId);
    expect(gottenEventPosition.id_ref).toMatch(testEventPosition1.id_ref);
    expect(gottenEventPosition.name).toMatch(testEventPosition1.name);
  });
});

it('creates a user for the organization', async () => {
  await seedTestData({afterSeed: async (orgs, people, roles) => {
    
    const gottenPersonOrg = await OrganizationPerson.get({ person: {id:people[0].id}, organization: {id:orgs[0].id}});
    expect(people[0].id).toEqual(gottenPersonOrg.id_person);
    expect(orgs[0].id).toEqual(gottenPersonOrg.id_organization);
    expect(JSON.stringify(testPerson1.organization[testOrg1.id_ref].addl_info)).toMatch(JSON.stringify(gottenPersonOrg.addl_info));

    const addlInfo = testPerson1.organization[testOrg1.id_ref].addl_info as unknown as CCKPerson.CCKPersonOrgData;
    const gottenAddlInfo = gottenPersonOrg.addl_info as unknown as CCKPerson.CCKPersonOrgData;
    
    expect(addlInfo.nickname).toEqual(gottenAddlInfo.nickname);
  }});
});

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

it('gets upcoming events', async () => {
  await seedTestData({afterSeed: async (orgs, people, roles) => {
    
    const theEvent2 = await Event.create({...testEvent1, ...{start_date: addDays(new Date(), 1)}})
    const theEvent3 = await Event.create({...testEvent1, ...{start_date: addDays(new Date(), 2)}})
    const theEvent5 = await Event.create({...testEvent1, ...{start_date: addDays(new Date(), 3)}})
    const theEvent6 = await Event.create({...testEvent1, ...{start_date: addDays(new Date(), 21)}})
    const theEvent4 = await Event.create({...testEvent1, ...{start_date: addDays(new Date(), -1)}})

    const orgEvents = await Person.getUpcomingEvents({id: people[0].id});
    
    expect(orgEvents[0].events.length).toEqual(3);
  }});
});

it('gets person org detail', async () => {
  await seedTestData({afterSeed: async (orgs, people, roles) => {
  
    const orgDetails = await Person.getPersonOrgDetail(people[0]);

    const fetchedNickname = orgDetails[testOrg1.id_ref].addl_info['nickname'];
    const actualNickname = testPerson1.organization[testOrg1.id_ref].addl_info['nickname']
    
    expect(fetchedNickname).toEqual(actualNickname);
  }});
});

it('gets person roles', async () => {
  await seedTestData({afterSeed: async (orgs, people, roles) => {

    const gottenPerson = await Person.get({person: {id: people[0].id}, includeRoles: true});
    const apiFriendlyPerson = makeAPIFriendly(gottenPerson);
    expect(apiFriendlyPerson.roles[0]).toEqual(testPerson1.roles[0]);
    
  }});
});


it('upserts seed event data', async () => {

  for (const idx in events) {
    const eventId: Event.EventIdentifier = {
      id_ref: events[idx].id_ref,
      id_organization: events[idx].organization.id,
      id_organization_ref: events[idx].organization.id_ref
    }
    
    await Event.upsert(eventId, events[idx]);
  }
});
