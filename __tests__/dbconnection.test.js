import '@testing-library/jest-dom'
import { Organization, EventCategory, Event, EventRole, EventPosition } from '@/components/db-connection';

const testOrg1 = Object.freeze({name: "The Human Fund", description: "We collect funds for humans"});
const testEventCategory1 = Object.freeze({id_ref: "cckmealdelivery", name: "Meal prep & delivery", description: "Several times a week, CCK prepares and delivers free, hot, plant-based meals to those who need them."});
const testEvent1 = Object.freeze({id_ref: "cckmealdelivery-03-02-2022", name: "Meal prep & delivery Feb 03", start_date: new Date()});
const testEventRole1 = Object.freeze({id_ref: "cckmealdelivery-03-02-2022-delivery", name: "Meal delivery", description: "Delivery volunteers deliver meals using their personal vehicle (typically a bicycle or car)."})
const testEventPosition1 = Object.freeze({id_ref: "cckmealdelivery-03-02-2022-Mill-Rd", name: "Mill Rd."});

function getRandomString() {
  return (Math.random() + 1).toString(36);
}

async function standupOrg(org, afterStandup) {
  var testOrg = JSON.parse(JSON.stringify(testOrg1));
  testOrg['id_ref'] = getRandomString();
  let theOrg = await Organization.create(testOrg);

  try {
    await afterStandup(theOrg);
  } catch (e) {
    throw e;
  } finally {
    await Organization.remove({id: theOrg.id});
  }
}

async function createEventCategory(category, orgId) {
  var testEventCategory = JSON.parse(JSON.stringify(category));
  testEventCategory['id_organization'] = orgId;
  return await EventCategory.create(testEventCategory);
}

async function createEvent(event, eventCategoryId) {
  var testEvent = JSON.parse(JSON.stringify(event));
  testEvent['id_event_category'] = eventCategoryId
  if (!testEvent.id_organization && eventCategoryId) {
    const eventCategory = await EventCategory.get({id: eventCategoryId})
    testEvent['id_organization'] = eventCategory.id_organization;
  }
  return await Event.create(testEvent);
}


async function createEventRole(eventRole, eventId) {
  var testEventRole = JSON.parse(JSON.stringify(testEventRole1));
  testEventRole['id_event'] = eventId
  return await EventRole.create(testEventRole);
}

async function createEventPosition(eventPosition, eventId, eventRoleId) {
  
  
  var testEventPosition = JSON.parse(JSON.stringify(testEventPosition1));
  testEventPosition['id_event'] = eventId
  testEventPosition['id_event_role'] = eventRoleId
  
  return await EventPosition.create(testEventPosition);
}


  it('creates an org, fetches an org by id, deletes an org by id', async () => {
    var createdId;
    await standupOrg(testOrg1, async org => {
      expect(org.name).toMatch(testOrg1.name);
      expect(org.description).toMatch(testOrg1.description);
      createdId = org.id;

      let gottenOrg = await Organization.get({id: org.id});
      expect(gottenOrg.name).toMatch(testOrg1.name);
      expect(gottenOrg.description).toMatch(testOrg1.description);
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
    await standupOrg(testOrg1, async org => {
      const theEventCategory = await createEventCategory(testEventCategory1, org.id);
      expect(theEventCategory.name).toMatch(testEventCategory1.name);
      expect(theEventCategory.description).toMatch(testEventCategory1.description);
      createdId = theEventCategory.id;

      const gottenEventCategory = await EventCategory.get({id: theEventCategory.id});
      expect(gottenEventCategory.name).toMatch(testEventCategory1.name);
      expect(gottenEventCategory.description).toMatch(testEventCategory1.description);
    });

    const gottenCategory = await EventCategory.get({id: createdId});
    expect(gottenCategory).toBeNull();
  });

  it('fetches an event category using org and category refs', async () => {
    await standupOrg(testOrg1, async org => {
      const theEventCategory = await createEventCategory(testEventCategory1, org.id);
      const categoryId = {
        id_organization_ref: org.id_ref,
        id_ref: theEventCategory.id_ref
      }
      
      const gottenEventCategory = await EventCategory.get(categoryId);
      expect(gottenEventCategory.id_ref).toMatch(testEventCategory1.id_ref);
      expect(gottenEventCategory.name).toMatch(testEventCategory1.name);
      expect(gottenEventCategory.description).toMatch(testEventCategory1.description);
    });
  });

  it('creates an event, fetches by id', async () => {
    var createdId;
    await standupOrg(testOrg1, async org => {
      const theEventCategory = await createEventCategory(testEventCategory1, org.id);
      const theEvent = await createEvent(testEvent1, theEventCategory.id);
      expect(theEvent.id_ref).toMatch(testEvent1.id_ref);
      expect(theEvent.name).toMatch(testEvent1.name);
      expect(theEvent.id_organization).toEqual(org.id);
      createdId = theEvent.id;
      
      const gottenEvent = await Event.get({id: createdId});
      expect(gottenEvent.id_ref).toMatch(testEvent1.id_ref);
      expect(gottenEvent.name).toMatch(testEvent1.name);
      expect(gottenEvent.id_organization).toEqual(org.id);
    });
  });

  it('fetches an event using org and event refs', async () => {
    await standupOrg(testOrg1, async org => {
      const theEventCategory = await createEventCategory(testEventCategory1, org.id);
      const theEvent = await createEvent(testEvent1, theEventCategory.id);
      const eventId = {
        id_organization_ref: org.id_ref,
        id_ref: theEvent.id_ref
      }

      const gottenEvent = await Event.get(eventId);
      expect(gottenEvent.id_ref).toMatch(testEvent1.id_ref);
      expect(gottenEvent.name).toMatch(testEvent1.name);
    });
  });

  it('creates an event role, fetches by id', async () => {
    var createdId;
    await standupOrg(testOrg1, async org => {
      const theEventCategory = await createEventCategory(testEventCategory1, org.id);
      const theEvent = await createEvent(testEvent1, theEventCategory.id);
      const theEventRole = await createEventRole(testEventRole1, theEvent.id);
      createdId = theEventRole.id;
      expect(createdId).toEqual(expect.any(Number));
      
      const gottenEventRole = await EventRole.get({id: createdId});
      expect(gottenEventRole.id_ref).toMatch(testEventRole1.id_ref);
      expect(gottenEventRole.name).toMatch(testEventRole1.name);
      expect(gottenEventRole.description).toMatch(gottenEventRole.description);
    });

    expect(createdId).toEqual(expect.any(Number));
    const gottenEventRole = await EventRole.get({id: createdId});
    expect(gottenEventRole).toBeNull();
  });

  it('fetches an event role using refs', async () => {
    await standupOrg(testOrg1, async org => {
      const theEventCategory = await createEventCategory(testEventCategory1, org.id);
      const theEvent = await createEvent(testEvent1, theEventCategory.id);
      const theEventRole = await createEventRole(testEventRole1, theEvent.id);

      const eventRoleId = {
        id_organization_ref: org.id_ref,
        id_event_ref: theEvent.id_ref,
        id_ref: theEventRole.id_ref
      }

      const gottenEventRole = await EventRole.get(eventRoleId);
      expect(gottenEventRole.id_ref).toMatch(testEventRole1.id_ref);
      expect(gottenEventRole.name).toMatch(testEventRole1.name);
      expect(gottenEventRole.description).toMatch(gottenEventRole.description);
    });
  });

  it('creates an event position, fetches by id', async () => {
    var createdId;
    await standupOrg(testOrg1, async org => {
      const theEventCategory = await createEventCategory(testEventCategory1, org.id);
      const theEvent = await createEvent(testEvent1, theEventCategory.id);
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
      const theEventCategory = await createEventCategory(testEventCategory1, org.id);
      const theEvent = await createEvent(testEvent1, theEventCategory.id);
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


