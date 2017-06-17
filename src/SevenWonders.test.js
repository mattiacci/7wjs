import SevenWonders from './SevenWonders.js';

const WONDERS = [{"name":"Rhodos","side":"A"},{"name":"Ephesos","side":"A"},{"name":"Olympia","side":"A"}];
const CARDS = [[[{"age":1,"minPlayers":3,"name":"Clay Pool"},{"age":1,"minPlayers":2,"name":"Stockade"},{"age":1,"minPlayers":3,"name":"Guard Tower"},{"age":1,"minPlayers":2,"name":"Timber Yard"},{"age":1,"minPlayers":2,"name":"Press"},{"age":1,"minPlayers":2,"name":"Barracks"},{"age":1,"minPlayers":2,"name":"Workshop"}],[{"age":1,"minPlayers":2,"name":"Apothecary"},{"age":1,"minPlayers":2,"name":"West Trading Post"},{"age":1,"minPlayers":2,"name":"Marketplace"},{"age":1,"minPlayers":2,"name":"Theater"},{"age":1,"minPlayers":2,"name":"Loom"},{"age":1,"minPlayers":2,"name":"Altar"},{"age":1,"minPlayers":2,"name":"Glassworks"}],[{"age":1,"minPlayers":2,"name":"Scriptorium"},{"age":1,"minPlayers":2,"name":"Clay Pit"},{"age":1,"minPlayers":3,"name":"East Trading Post"},{"age":1,"minPlayers":3,"name":"Ore Vein"},{"age":1,"minPlayers":3,"name":"Baths"},{"age":1,"minPlayers":3,"name":"Lumber Yard"},{"age":1,"minPlayers":3,"name":"Stone Pit"}]],[[{"age":2,"minPlayers":3,"name":"Press"},{"age":2,"minPlayers":3,"name":"Aquaduct"},{"age":2,"minPlayers":2,"name":"Foundry"},{"age":2,"minPlayers":3,"name":"Walls"},{"age":2,"minPlayers":2,"name":"Stables"},{"age":2,"minPlayers":2,"name":"Archery Range"},{"age":2,"minPlayers":3,"name":"School"}],[{"age":2,"minPlayers":2,"name":"Forum"},{"age":2,"minPlayers":3,"name":"Vineyard"},{"age":2,"minPlayers":2,"name":"Brickyard"},{"age":2,"minPlayers":2,"name":"Temple"},{"age":2,"minPlayers":2,"name":"Sawmill"},{"age":2,"minPlayers":2,"name":"Dispensary"},{"age":2,"minPlayers":3,"name":"Loom"}],[{"age":2,"minPlayers":2,"name":"Statue"},{"age":2,"minPlayers":2,"name":"Caravansery"},{"age":2,"minPlayers":2,"name":"Library"},{"age":2,"minPlayers":2,"name":"Laboratory"},{"age":2,"minPlayers":2,"name":"Quarry"},{"age":2,"minPlayers":2,"name":"Courthouse"},{"age":2,"minPlayers":3,"name":"Glassworks"}]],[[{"age":3,"minPlayers":2,"name":"Arena"},{"age":3,"minPlayers":2,"name":"Pantheon"},{"age":3,"minPlayers":2,"name":"Gardens"},{"age":3,"minPlayers":3,"name":"Fortifications"},{"age":3,"minPlayers":3,"name":"Academy"},{"age":3,"minPlayers":2,"name":"Lighthouse"},{"age":3,"minPlayers":0,"name":"Spies Guild"}],[{"age":3,"minPlayers":0,"name":"Craftsmens Guild"},{"age":3,"minPlayers":0,"name":"Strategists Guild"},{"age":3,"minPlayers":2,"name":"Observatory"},{"age":3,"minPlayers":3,"name":"Palace"},{"age":3,"minPlayers":3,"name":"Arsenal"},{"age":3,"minPlayers":0,"name":"Traders Guild"},{"age":3,"minPlayers":3,"name":"Town Hall"}],[{"age":3,"minPlayers":0,"name":"Builders Guild"},{"age":3,"minPlayers":2,"name":"Senate"},{"age":3,"minPlayers":2,"name":"Siege Workshop"},{"age":3,"minPlayers":3,"name":"Study"},{"age":3,"minPlayers":2,"name":"Lodge"},{"age":3,"minPlayers":2,"name":"University"},{"age":3,"minPlayers":2,"name":"Haven"}]]];

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
  const game = new SevenWonders(playerInterfaces, WONDERS, CARDS, false, endGameHandler);
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
