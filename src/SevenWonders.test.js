import SevenWonders from './SevenWonders.js';

const WONDERS = [{"name":"Rhodos","side":"A"},{"name":"Ephesos","side":"A"},{"name":"Olympia","side":"A"}];
const HANDS = [[[{"name":"Scriptorium","age":1,"cost":[[6]],"type":7,"minPlayers":2,"tooltip":"Enhances literature."}],[{"name":"Workshop","age":1,"cost":[[4]],"type":6,"minPlayers":2,"tooltip":"Enhances engineering."}],[{"name":"Baths","age":1,"cost":[[1]],"type":8,"minPlayers":3,"tooltip":"Yields 3 victory points."}]],[[{"name":"Aquaduct","age":2,"cost":[[1,1,1],"Baths"],"type":8,"minPlayers":3,"tooltip":"Yields 5 victory points."}],[{"name":"Press","age":2,"cost":[],"type":1,"minPlayers":3,"tooltip":"Produces paper."}],[{"name":"Walls","age":2,"cost":[[1,1,1]],"type":4,"minPlayers":3,"tooltip":"Provides 2 units of military strength."}]],[[{"name":"Lighthouse","age":3,"cost":[[1,4],"Caravansery"],"type":2,"minPlayers":2,"tooltip":"Yields 1 gold and 1 victory point for yellow card."}],[{"name":"Academy","age":3,"cost":[[1,1,1,4],"School"],"type":5,"minPlayers":3,"tooltip":"Enhances academics."}],[{"name":"Fortifications","age":3,"cost":[[3,3,3,1],"Walls"],"type":4,"minPlayers":3,"tooltip":"Provides 3 units of military strength."}]]];

it('starts game and passes state and actions only to local player', () => {
  const playerInterfaces = [];
  const stateUpdateHandler = jest.fn();
  const remotePlayerStateUpdateHandler = jest.fn();
  const turnsRef = [];
  playerInterfaces.push(new SevenWonders.PlayerInterface(
      stateUpdateHandler, turnsRef, 0, '0', true));
  for (let i = 1; i < WONDERS.length; i++) {
    playerInterfaces.push(new SevenWonders.PlayerInterface(
        remotePlayerStateUpdateHandler, turnsRef, i, String(i), false));
  }
  const endGameHandler = jest.fn();
  const game = new SevenWonders(playerInterfaces, WONDERS, HANDS, false, endGameHandler, false);
  expect(endGameHandler).not.toHaveBeenCalled();
  expect(remotePlayerStateUpdateHandler).not.toHaveBeenCalled();
  expect(turnsRef).toHaveLength(0);
  expect(stateUpdateHandler).toHaveBeenCalledTimes(1);
  const state = stateUpdateHandler.mock.calls[0][0];
  expect(state).toMatchSnapshot('initial');
  const actions = stateUpdateHandler.mock.calls[0][1];
  expect(actions).toHaveProperty('build');
  expect(actions).toHaveProperty('buildWonder');
  expect(actions).toHaveProperty('discard');
});
