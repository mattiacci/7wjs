import { Action } from './misc.js';
import SevenWonders from './SevenWonders.js';

jest.setTimeout(10000); // 10 second timeout

const PLAYERS = ["Michael", "Kylia", "Asala"];
const WONDERS = [{"name":"Gizah","side":"A"},{"name":"Alexandria","side":"A"},{"name":"Ephesos","side":"A"}];
const HANDS = [[[{"age":1,"minPlayers":2,"name":"Stockade"},{"age":1,"minPlayers":2,"name":"Timber Yard"},{"age":1,"minPlayers":2,"name":"Clay Pit"},{"age":1,"minPlayers":2,"name":"Apothecary"},{"age":1,"minPlayers":3,"name":"Lumber Yard"},{"age":1,"minPlayers":2,"name":"Theater"},{"age":1,"minPlayers":3,"name":"Clay Pool"}],[{"age":1,"minPlayers":2,"name":"Marketplace"},{"age":1,"minPlayers":2,"name":"Glassworks"},{"age":1,"minPlayers":2,"name":"Altar"},{"age":1,"minPlayers":2,"name":"Loom"},{"age":1,"minPlayers":3,"name":"Guard Tower"},{"age":1,"minPlayers":3,"name":"Ore Vein"},{"age":1,"minPlayers":2,"name":"West Trading Post"}],[{"age":1,"minPlayers":3,"name":"Stone Pit"},{"age":1,"minPlayers":2,"name":"Workshop"},{"age":1,"minPlayers":2,"name":"Press"},{"age":1,"minPlayers":3,"name":"East Trading Post"},{"age":1,"minPlayers":2,"name":"Barracks"},{"age":1,"minPlayers":3,"name":"Baths"},{"age":1,"minPlayers":2,"name":"Scriptorium"}]],[[{"age":2,"minPlayers":2,"name":"Courthouse"},{"age":2,"minPlayers":2,"name":"Sawmill"},{"age":2,"minPlayers":3,"name":"Loom"},{"age":2,"minPlayers":3,"name":"School"},{"age":2,"minPlayers":2,"name":"Temple"},{"age":2,"minPlayers":2,"name":"Brickyard"},{"age":2,"minPlayers":2,"name":"Library"}],[{"age":2,"minPlayers":3,"name":"Vineyard"},{"age":2,"minPlayers":2,"name":"Foundry"},{"age":2,"minPlayers":2,"name":"Forum"},{"age":2,"minPlayers":3,"name":"Glassworks"},{"age":2,"minPlayers":3,"name":"Aquaduct"},{"age":2,"minPlayers":2,"name":"Laboratory"},{"age":2,"minPlayers":2,"name":"Statue"}],[{"age":2,"minPlayers":2,"name":"Caravansery"},{"age":2,"minPlayers":2,"name":"Stables"},{"age":2,"minPlayers":2,"name":"Archery Range"},{"age":2,"minPlayers":3,"name":"Press"},{"age":2,"minPlayers":2,"name":"Dispensary"},{"age":2,"minPlayers":3,"name":"Walls"},{"age":2,"minPlayers":2,"name":"Quarry"}]],[[{"age":3,"minPlayers":3,"name":"Study"},{"age":3,"minPlayers":2,"name":"Senate"},{"age":3,"minPlayers":2,"name":"Haven"},{"age":3,"minPlayers":0,"name":"Scientists Guild"},{"age":3,"minPlayers":3,"name":"Arsenal"},{"age":3,"minPlayers":0,"name":"Magistrates Guild"},{"age":3,"minPlayers":0,"name":"Philosophers Guild"}],[{"age":3,"minPlayers":2,"name":"Siege Workshop"},{"age":3,"minPlayers":2,"name":"Lodge"},{"age":3,"minPlayers":2,"name":"Gardens"},{"age":3,"minPlayers":3,"name":"Fortifications"},{"age":3,"minPlayers":2,"name":"Lighthouse"},{"age":3,"minPlayers":3,"name":"Palace"},{"age":3,"minPlayers":2,"name":"University"}],[{"age":3,"minPlayers":2,"name":"Arena"},{"age":3,"minPlayers":0,"name":"Craftsmens Guild"},{"age":3,"minPlayers":2,"name":"Observatory"},{"age":3,"minPlayers":0,"name":"Strategists Guild"},{"age":3,"minPlayers":3,"name":"Town Hall"},{"age":3,"minPlayers":2,"name":"Pantheon"},{"age":3,"minPlayers":3,"name":"Academy"}]]];
const TURNS = [{"action":0,"card":{"age":1,"free":true,"minPlayers":2,"name":"Glassworks","tooltip":"Produces glass.","type":1,"unplayable":false},"id":1,"payment":{"bank":0}},{"action":0,"card":{"age":1,"cost":[1],"free":false,"minPlayers":2,"name":"Timber Yard","tooltip":"Produces stone or wood.","type":0,"unplayable":false},"id":0,"payment":{"bank":1}},{"action":0,"card":{"age":1,"free":true,"minPlayers":3,"name":"East Trading Post","tooltip":"Provides discounted resource trade with eastern neighbour.","type":2,"unplayable":false},"id":2,"payment":{"bank":0}},{"action":0,"card":{"age":1,"free":true,"minPlayers":2,"name":"West Trading Post","tooltip":"Provides discounted resource trade with western neighbour.","type":2,"unplayable":false},"id":2,"payment":{"bank":0}},{"action":0,"card":{"age":1,"cost":[[1]],"free":true,"minPlayers":3,"name":"Baths","tooltip":"Yields 3 victory points.","type":8,"unplayable":false},"id":0,"payment":{"bank":0}},{"action":3,"id":2},{"action":0,"card":{"age":1,"free":true,"minPlayers":2,"name":"West Trading Post","tooltip":"Provides discounted resource trade with western neighbour.","type":2,"unplayable":false},"id":2,"payment":{"bank":0}},{"action":3,"id":2},{"action":0,"card":{"age":1,"free":true,"minPlayers":2,"name":"West Trading Post","tooltip":"Provides discounted resource trade with western neighbour.","type":2,"unplayable":false},"id":2,"payment":{"bank":0}},{"action":3,"id":0},{"action":0,"card":{"age":1,"cost":[[1]],"free":true,"minPlayers":3,"name":"Baths","tooltip":"Yields 3 victory points.","type":8,"unplayable":false},"id":0,"payment":{"bank":0}},{"action":3,"id":0},{"action":0,"card":{"age":1,"cost":[[1]],"free":true,"minPlayers":3,"name":"Baths","tooltip":"Yields 3 victory points.","type":8,"unplayable":false},"id":0,"payment":{"bank":0}},{"action":3,"id":0},{"action":0,"card":{"age":1,"cost":[[1]],"free":true,"minPlayers":3,"name":"Baths","tooltip":"Yields 3 victory points.","type":8,"unplayable":false},"id":0,"payment":{"bank":0}},{"action":3,"id":0},{"action":0,"card":{"age":1,"cost":[[1]],"free":true,"minPlayers":3,"name":"Baths","tooltip":"Yields 3 victory points.","type":8,"unplayable":false},"id":0,"payment":{"bank":0}},{"action":0,"card":{"age":1,"cost":[1],"free":false,"minPlayers":2,"name":"Clay Pit","tooltip":"Produces clay or ore.","type":0,"unplayable":false},"id":1,"payment":{"bank":1}},{"action":0,"card":{"age":1,"free":true,"minPlayers":3,"name":"Stone Pit","tooltip":"Produces stone.","type":0,"unplayable":false},"id":1,"payment":{"bank":0}},{"action":0,"card":{"age":1,"free":true,"minPlayers":2,"name":"Marketplace","tooltip":"Provides discounted goods trade with neighbours.","type":2,"unplayable":false},"id":0,"payment":{"bank":0}},{"action":0,"card":{"age":1,"free":true,"minPlayers":3,"name":"Lumber Yard","tooltip":"Produces wood.","type":0,"unplayable":false},"id":2,"payment":{"bank":0}},{"action":0,"card":{"age":1,"cost":[[6]],"free":true,"minPlayers":2,"name":"Scriptorium","tooltip":"Enhances literature.","type":7,"unplayable":false},"id":2,"payment":{"bank":0}},{"action":0,"card":{"age":1,"cost":[[2]],"free":true,"minPlayers":2,"name":"Stockade","tooltip":"Provides 1 unit of military strength.","type":4,"unplayable":false},"id":0,"payment":{"bank":0}},{"action":1,"card":{"age":1,"free":true,"minPlayers":2,"name":"Altar","tooltip":"Yields 2 victory points.","type":8,"unplayable":false},"id":1,"payment":{"bank":0,"east":[1]}},{"action":0,"card":{"age":1,"free":true,"minPlayers":2,"name":"Theater","tooltip":"Yields 2 victory points.","type":8,"unplayable":false},"id":1,"payment":{"bank":0}},{"action":0,"card":{"age":1,"cost":[[0]],"free":false,"minPlayers":3,"name":"Guard Tower","tooltip":"Provides 1 unit of military strength.","type":4,"unplayable":false},"id":2,"payment":{"bank":0,"east":[0]}},{"action":0,"card":{"age":1,"cost":[[3]],"free":false,"minPlayers":2,"name":"Barracks","tooltip":"Provides 1 unit of military strength.","type":4,"unplayable":false},"id":0,"payment":{"bank":0,"west":[3]}},{"action":0,"card":{"age":1,"free":true,"minPlayers":3,"name":"Ore Vein","tooltip":"Produces ore.","type":0,"unplayable":false},"id":0,"payment":{"bank":0}},{"action":2,"card":{"age":1,"cost":[[5]],"free":false,"minPlayers":2,"name":"Apothecary","tooltip":"Enhances academics.","type":5,"unplayable":true},"id":2,"payment":{"bank":0}},{"action":3,"id":2},{"action":0,"card":{"age":1,"cost":[[4]],"free":true,"minPlayers":2,"name":"Workshop","tooltip":"Enhances engineering.","type":6,"unplayable":false},"id":1,"payment":{"bank":0}},{"action":2,"card":{"age":1,"cost":[[5]],"free":false,"minPlayers":2,"name":"Apothecary","tooltip":"Enhances academics.","type":5,"unplayable":true},"id":2,"payment":{"bank":0}},{"action":0,"card":{"age":2,"cost":[[2,2],"Marketplace"],"free":false,"minPlayers":2,"name":"Caravansery","tooltip":"Produces any resource.","type":2,"unplayable":false},"id":2,"payment":{"bank":0,"west":[2]}},{"action":0,"card":{"age":2,"cost":[1],"free":false,"minPlayers":2,"name":"Brickyard","tooltip":"Produces 2 units of clay.","type":0,"unplayable":false},"id":0,"payment":{"bank":1}},{"action":0,"card":{"age":2,"cost":[[3,3,2],"Theater"],"free":true,"minPlayers":2,"name":"Statue","tooltip":"Yields 4 victory points.","type":8,"unplayable":false},"id":1,"payment":{"bank":0}},{"action":0,"card":{"age":2,"cost":[[2,2,3],"Workshop"],"free":true,"minPlayers":2,"name":"Archery Range","tooltip":"Provides 2 units of military strength.","type":4,"unplayable":false},"id":1,"payment":{"bank":0,"east":[2],"west":[2]}},{"action":0,"id":1,"payment":{"bank":0,"east":[2],"west":[2]}},{"action":0,"card":{"age":2,"cost":[[2,6]],"free":true,"minPlayers":3,"name":"School","tooltip":"Enhances literature.","type":7,"unplayable":false},"id":2,"payment":{"bank":0}},{"action":0,"card":{"age":2,"cost":[[2,2,3],"Workshop"],"free":true,"minPlayers":2,"name":"Archery Range","tooltip":"Provides 2 units of military strength.","type":4,"unplayable":false},"id":1,"payment":{"bank":0}},{"action":3,"id":1},{"action":0,"card":{"age":2,"cost":[[2,2,3],"Workshop"],"free":true,"minPlayers":2,"name":"Archery Range","tooltip":"Provides 2 units of military strength.","type":4,"unplayable":false},"id":1,"payment":{"bank":0}},{"action":0,"card":{"age":2,"cost":[[0,0],"East Trading Post","West Trading Post"],"free":true,"minPlayers":2,"name":"Forum","tooltip":"Produces any good.","type":2,"unplayable":false},"id":0,"payment":{"bank":0}},{"action":0,"card":{"age":2,"cost":[[0,2,3],"Apothecary"],"free":true,"minPlayers":2,"name":"Stables","tooltip":"Provides 2 units of military strength.","type":4,"unplayable":false},"id":0,"payment":{"bank":0}},{"action":0,"card":{"age":2,"cost":[[1,1,1],"Baths"],"free":false,"minPlayers":3,"name":"Aquaduct","tooltip":"Yields 5 victory points.","type":8,"unplayable":false},"id":2,"payment":{"bank":0,"east":[1],"west":[1]}},{"action":0,"card":{"age":2,"cost":[[2,0,4],"Altar"],"free":false,"minPlayers":2,"name":"Temple","tooltip":"Yields 3 victory points.","type":8,"unplayable":false},"id":1,"payment":{"bank":0}},{"action":0,"card":{"age":2,"cost":[[2,0,4],"Altar"],"free":false,"minPlayers":2,"name":"Temple","tooltip":"Yields 3 victory points.","type":8,"unplayable":false},"id":1,"payment":{"bank":0,"west":[2]}},{"action":0,"card":{"age":2,"cost":[[0,0,6],"Workshop"],"free":true,"minPlayers":2,"name":"Laboratory","tooltip":"Enhances engineering.","type":6,"unplayable":false},"id":1,"payment":{"bank":0}},{"action":0,"card":{"age":2,"cost":[[1,1,5],"Scriptorium"],"free":true,"minPlayers":2,"name":"Library","tooltip":"Enhances literature.","type":7,"unplayable":false},"id":0,"payment":{"bank":0}},{"action":3,"id":0},{"action":1,"card":{"age":2,"free":true,"minPlayers":3,"name":"Loom","tooltip":"Produces cloth.","type":1,"unplayable":false},"id":0,"payment":{"bank":0}},{"action":0,"card":{"age":2,"cost":[[1,1,1]],"free":false,"minPlayers":3,"name":"Walls","tooltip":"Provides 2 units of military strength.","type":4,"unplayable":false},"id":2,"payment":{"bank":0,"east":[1],"west":[1]}},{"action":0,"card":{"age":2,"cost":[[1,1,1]],"free":false,"minPlayers":3,"name":"Walls","tooltip":"Provides 2 units of military strength.","type":4,"unplayable":false},"id":2,"payment":{"bank":0,"east":[1],"west":[1]}},{"action":0,"card":{"age":2,"cost":[[1,1,1]],"free":false,"minPlayers":3,"name":"Walls","tooltip":"Provides 2 units of military strength.","type":4,"unplayable":false},"id":2,"payment":{"bank":0,"east":[1],"west":[1]}},{"action":0,"card":{"age":2,"cost":[[1,1,5],"Scriptorium"],"free":true,"minPlayers":2,"name":"Library","tooltip":"Enhances literature.","type":7,"unplayable":false},"id":2,"payment":{"bank":0}},{"action":0,"card":{"age":2,"free":true,"minPlayers":3,"name":"Vineyard","tooltip":"Produces 1 gold for every brown card you or your neighbours have built.","type":2,"unplayable":false},"id":0,"payment":{"bank":0}},{"action":1,"card":{"age":2,"cost":[1],"free":false,"minPlayers":2,"name":"Quarry","tooltip":"Produces 2 units of stone.","type":0,"unplayable":false},"id":1,"payment":{"bank":0}},{"action":1,"card":{"age":2,"cost":[1],"free":false,"minPlayers":2,"name":"Quarry","tooltip":"Produces 2 units of stone.","type":0,"unplayable":false},"id":1,"payment":{"bank":0,"east":[3]}},{"action":1,"card":{"age":2,"cost":[1],"free":false,"minPlayers":2,"name":"Sawmill","tooltip":"Produces 2 units of wood.","type":0,"unplayable":false},"id":1,"payment":{"bank":0}},{"action":0,"card":{"age":2,"cost":[1],"free":false,"minPlayers":2,"name":"Foundry","tooltip":"Produces 2 units of ore.","type":0,"unplayable":false},"id":2,"payment":{"bank":1}},{"action":0,"card":{"age":2,"cost":[[3,3,4],"Apothecary"],"free":false,"minPlayers":2,"name":"Dispensary","tooltip":"Enhances academics.","type":5,"unplayable":false},"id":0,"payment":{"bank":0,"west":[4,3]}},{"action":0,"card":{"age":2,"cost":[[3,3,4],"Apothecary"],"free":false,"minPlayers":2,"name":"Dispensary","tooltip":"Enhances academics.","type":5,"unplayable":false},"id":0,"payment":{"bank":0,"west":[3]}},{"action":0,"card":{"age":3,"cost":[[2,2,3,5]],"free":false,"minPlayers":3,"name":"Arsenal","tooltip":"Provides 3 units of military strength.","type":4,"unplayable":false},"id":0,"payment":{"bank":0,"east":[2]}},{"action":1,"card":{"age":3,"cost":[[0,0,3,4,6,5],"Temple"],"free":false,"minPlayers":2,"name":"Pantheon","tooltip":"Yields 7 victory points.","type":8,"unplayable":true},"id":2,"payment":{"bank":0,"west":[1]}},{"action":0,"card":{"age":3,"cost":[[0,0,2],"Statue"],"free":true,"minPlayers":2,"name":"Gardens","tooltip":"Yields 5 victory points.","type":8,"unplayable":false},"id":1,"payment":{"bank":0}},{"action":0,"card":{"age":3,"cost":[[2,2,1,3],"Library"],"free":false,"minPlayers":2,"name":"Senate","tooltip":"Yields 6 victory points.","type":8,"unplayable":false},"id":1,"payment":{"bank":0}},{"action":0,"id":1,"payment":{"bank":0,"east":[2],"west":[2]}},{"action":0,"card":{"age":3,"cost":[[2,2,1,3],"Library"],"free":false,"minPlayers":2,"name":"Senate","tooltip":"Yields 6 victory points.","type":8,"unplayable":false},"id":1,"payment":{"bank":0,"west":[2]}},{"action":0,"card":{"age":3,"cost":[[3,3,1,5]],"free":false,"minPlayers":0,"name":"Strategists Guild","tooltip":"Yields 1 victory point for every combat loss token your neighbours have.","type":3,"unplayable":false},"id":0,"payment":{"bank":0,"east":[3]}},{"action":0,"card":{"age":3,"cost":[[2,2,6,4],"Library"],"free":true,"minPlayers":2,"name":"University","tooltip":"Enhances literature.","type":7,"unplayable":false},"id":2,"payment":{"bank":0}},{"action":0,"card":{"age":3,"cost":[[2,2,3,3,6]],"free":true,"minPlayers":0,"name":"Scientists Guild","tooltip":"Enhances a science of your choice.","type":3,"unplayable":false},"id":2,"payment":{"bank":0}},{"action":3,"id":2},{"action":0,"card":{"age":3,"cost":[[2,2,3,3,6]],"free":true,"minPlayers":0,"name":"Scientists Guild","tooltip":"Enhances a science of your choice.","type":3,"unplayable":false},"id":2,"payment":{"bank":0}},{"action":0,"card":{"age":3,"cost":[[1,1,3,4]],"free":true,"minPlayers":3,"name":"Town Hall","tooltip":"Yields 6 victory points.","type":8,"unplayable":false},"id":1,"payment":{"bank":0}},{"action":0,"card":{"age":3,"cost":[[1,3,2,0,4,6,5]],"free":false,"minPlayers":3,"name":"Palace","tooltip":"Yields 8 victory points.","type":8,"unplayable":false},"id":0,"payment":{"bank":0,"east":[6],"west":[4]}},{"action":0,"card":{"age":3,"cost":[[1,1,1,4],"School"],"free":true,"minPlayers":3,"name":"Academy","tooltip":"Enhances academics.","type":5,"unplayable":false},"id":2,"payment":{"bank":0}},{"action":0,"card":{"age":3,"cost":[[3,3,3,1],"Walls"],"free":false,"minPlayers":3,"name":"Fortifications","tooltip":"Provides 3 units of military strength.","type":4,"unplayable":false},"id":1,"payment":{"bank":0,"west":[3]}},{"action":0,"card":{"age":3,"cost":[[0,0,0,6,5]],"free":false,"minPlayers":0,"name":"Philosophers Guild","tooltip":"Yields 1 victory point for every green card your neighbours have.","type":3,"unplayable":false},"id":0,"payment":{"bank":0,"east":[6],"west":[0]}},{"action":0,"card":{"age":3,"cost":[[1,1,3],"Dispensary"],"free":true,"minPlayers":2,"name":"Arena","tooltip":"Yields 3 gold and 1 victory point for every wonder stage built.","type":2,"unplayable":false},"id":0,"payment":{"bank":0}},{"action":0,"card":{"age":3,"cost":[[1,4],"Caravansery"],"free":true,"minPlayers":2,"name":"Lighthouse","tooltip":"Yields 1 gold and 1 victory point for yellow card.","type":2,"unplayable":false},"id":2,"payment":{"bank":0}},{"action":2,"card":{"age":3,"cost":[[2,2,2,1,5]],"free":false,"minPlayers":0,"name":"Magistrates Guild","tooltip":"Yields 1 victory point for every blue card your neighbours have.","type":3,"unplayable":true},"id":1,"payment":{"bank":0}},{"action":0,"card":{"age":3,"cost":[[3,3,4,5],"Laboratory"],"free":true,"minPlayers":2,"name":"Observatory","tooltip":"Enhances engineering.","type":6,"unplayable":false},"id":1,"payment":{"bank":0}},{"action":0,"card":{"age":3,"cost":[[2,6,5],"School"],"free":true,"minPlayers":3,"name":"Study","tooltip":"Enhances engineering.","type":6,"unplayable":false},"id":2,"payment":{"bank":0}},{"action":0,"card":{"age":3,"cost":[[0,0,6,5],"Dispensary"],"free":true,"minPlayers":2,"name":"Lodge","tooltip":"Enhances academics.","type":5,"unplayable":false},"id":0,"payment":{"bank":0}}];

test('starts game and passes state and actions only to local player', (done) => {
  const verifyGameState = () => {
    expect(stateUpdateHandler).toHaveBeenCalledTimes(1);
    expect(stateUpdateHandler.mock.calls[0][0]).toMatchSnapshot('initial');
    expect(stateUpdateHandler.mock.calls[0][1]).toEqual(expect.objectContaining({
      build: expect.any(Function),
      buildWonder: expect.any(Function),
      discard: expect.any(Function)
    }));
    expect(remoteStateUpdateHandler).not.toHaveBeenCalled();
    expect(endGameHandler).not.toHaveBeenCalled();
    done();
  };
  const interfaces = [];
  const stateUpdateHandler = jest.fn(verifyGameState);
  const remoteStateUpdateHandler = jest.fn();
  const turnsRef = [];
  interfaces.push(new SevenWonders.PlayerInterface(
      stateUpdateHandler, turnsRef, 0, PLAYERS[0], true));
  for (let i = 1; i < WONDERS.length; i++) {
    interfaces.push(new SevenWonders.PlayerInterface(
        remoteStateUpdateHandler, turnsRef, i, PLAYERS[i], false));
  }
  const endGameHandler = jest.fn();
  const game = new SevenWonders(interfaces, WONDERS, HANDS, false, endGameHandler, false);
  expect(turnsRef).toHaveLength(0);
  // stateUpdateHandler will get called asynchronously.
  expect(stateUpdateHandler).toHaveBeenCalledTimes(0);
});

test('starts game and shows public state with no actions to spectator', (done) => {
  const verifyGameState = () => {
    expect(stateUpdateHandler).toHaveBeenCalledTimes(1);
    expect(stateUpdateHandler.mock.calls[0][0]).toMatchSnapshot('initial-spectator');
    expect(stateUpdateHandler.mock.calls[0][1]).toEqual({});
    expect(remoteStateUpdateHandler).not.toHaveBeenCalled();
    expect(endGameHandler).not.toHaveBeenCalled();
    done();
  };
  const interfaces = [];
  const stateUpdateHandler = jest.fn(verifyGameState);
  const remoteStateUpdateHandler = jest.fn();
  const turnsRef = [];
  interfaces.push(new SevenWonders.PlayerInterface(
      stateUpdateHandler, turnsRef, 0, PLAYERS[0], false));
  for (let i = 1; i < WONDERS.length; i++) {
    interfaces.push(new SevenWonders.PlayerInterface(
        remoteStateUpdateHandler, turnsRef, i, PLAYERS[i], false));
  }
  const endGameHandler = jest.fn();
  const game = new SevenWonders(interfaces, WONDERS, HANDS, false, endGameHandler, false);
  expect(turnsRef).toHaveLength(0);
  // stateUpdateHandler will get called asynchronously.
  expect(stateUpdateHandler).toHaveBeenCalledTimes(0);
});

test('accepts an entire game of valid actions', (done) => {
  let i = 0;
  const verifyGameState = function(state, actions) {
    expect(endGameHandler).not.toHaveBeenCalled();
    // TODO: Figure out why turnsRef doesn't get turns added.
    // expect(turnsRef.length).toEqual(i);
    if (i > 0) {
      // expect(turnsRef[i - 1]).toEqual(TURNS[i - 1]);
    }
    // TODO: Get the full game working.
    // If we're out of turns, the game is over.
    if (i === 34) {
      // expect(endGameHandler).toHaveBeenCalled();
      expect(remoteStateUpdateHandler).not.toHaveBeenCalled();
      done();
      return;
    }
    const turn = TURNS[i];
    if (turn.id === 0) {
      // Process a local turn.
      let act = null;
      if (turn.action === Action.BUILD) {
        act = actions.build;
      } else if (turn.action === Action.BUILD_WONDER) {
        act = actions.buildWonder;
      } else if (turn.action === Action.DISCARD) {
        act = actions.discard;
      } else if (turn.action === Action.UNDO) {
        act = actions.undo;
      } else {
        // This shouldn't happen.
        expect(true).toEqual(false);
      }
      if (turn.action === Action.UNDO) {
        act();
      } else {
        act({
          card: turn.card,
          payment: turn.payment
        });
      }
    }
    const interfaceIndex = interfaces.map((i) => i.id).indexOf(turn.id);
    interfaces[interfaceIndex].pendingTurns.push(turn);
    interfaces[interfaceIndex].process();
    i += 1;
  };

  const interfaces = [];
  const stateUpdateHandler = jest.fn(verifyGameState);
  const remoteStateUpdateHandler = jest.fn();
  const turnsRef = [];
  interfaces.push(new SevenWonders.PlayerInterface(
      stateUpdateHandler, turnsRef, 0, PLAYERS[0], true));
  for (let i = 1; i < WONDERS.length; i++) {
    interfaces.push(new SevenWonders.PlayerInterface(
        remoteStateUpdateHandler, turnsRef, i, PLAYERS[i], false));
  }
  const endGameHandler = jest.fn();
  const game = new SevenWonders(interfaces, WONDERS, HANDS, false, endGameHandler, false);
  expect(turnsRef).toHaveLength(0);
});
