(function() {

var Resource = {
  CLAY: 0,
  STONE: 1,
  WOOD: 2,
  ORE: 3,
  GLASS: 4,
  CLOTH: 5,
  PAPER: 6
};

var Science = {
  ACADEMICS: 0,   // Sextant
  ENGINEERING: 1, // Gear
  LITERATURE: 2  // Tablet
};

// The number assigned to a type is used for ordering (e.g. when displaying all cards).
var CardType = {
  RESOURCE: 0, // Brown
  GOODS: 1,    // Grey
  COMMERCE: 2, // Yellow
  GUILD: 3,    // Purple
  MILITARY: 4, // Red
  ACADEMICS: 5,  // Green Sextant
  ENGINEERING: 6, // Green Gear
  LITERATURE: 7, // Green Tablet
  VICTORY: 8,  // Blue
  WONDER: 9
};

var TradeCost = {
  RESOURCE_EAST: 0,
  RESOURCE_WEST: 1,
  GOODS: 2
};

var getCard = function(details) {
  var fetched = AGE1DECK.concat(AGE2DECK).concat(AGE3DECK).filter(function(card) {
    var minP = Math.max(3, details.minPlayers);
    var minP2 = Math.max(3, card.minPlayers);
    return card.name == details.name && minP == minP2 && card.age == details.age;
  });

  return fetched[0];
};

var Card = function(name, age, cost, type, rewards, minPlayers, tooltip) {
  this.name = name;
  this.age = age;
  this.cost = cost;
  this.type = type;
  this.rewards = rewards;
  this.minPlayers = minPlayers;
  this.tooltip = tooltip;
};
var Wonder = function(name, resource, stage1A, stage2A, stage3A, stage1B, stage2B, stage3B, stage4B) {
  this.name = name;
  this.resource = resource;
  this.stages = [stage1A, stage2A, stage3A, stage1B, stage2B];
  if (stage3B) {
    this.stages.push(stage3B);
  }
  if (stage4B) {
    this.stages.push(stage4B);
  }
};

var Scoring = {
  MILITARY: 0,
  GOLD: 1,
  WONDER: 2,
  VICTORY: 3,
  COMMERCE: 4,
  GUILD: 5,
  SCIENCE: 6
};

var Player = function(board, side, playerInterface) {
  this.sciences = {};
  this.sciences[Science.ACADEMICS] = 0;
  this.sciences[Science.ENGINEERING] = 0;
  this.sciences[Science.LITERATURE] = 0;

  this.tradeCost = {}
  this.tradeCost[TradeCost.RESOURCE_EAST] = 2;
  this.tradeCost[TradeCost.RESOURCE_WEST] = 2;
  this.tradeCost[TradeCost.GOODS] = 2;

  this.resources = {};
  this.resources[Resource.CLAY] = 0;
  this.resources[Resource.STONE] = 0;
  this.resources[Resource.WOOD] = 0;
  this.resources[Resource.ORE] = 0;
  this.resources[Resource.GLASS] = 0;
  this.resources[Resource.CLOTH] = 0;
  this.resources[Resource.PAPER] = 0;

  this.board = board;
  this.bonusSciences = 0;
  this.side = side;
  this.stagesBuilt = [];
  this.playerInterface = playerInterface;
  this.gold = 3;
  this.military = 0;
  this.multiResources = [];
  this.battleTokens = [];
  this.built = [];
  this.endGameRewards = [];
  this.canDoubleBuild = false;
  this.playDiscardedNow = false;
  this.canBuildForFree = [false, false, false];
  this.victoryPoints = {}
  this.victoryPoints[Scoring.MILITARY] = 0;
  this.victoryPoints[Scoring.GOLD] = 0;
  this.victoryPoints[Scoring.WONDER] = 0;
  this.victoryPoints[Scoring.VICTORY] = 0;
  this.victoryPoints[Scoring.COMMERCE] = 0;
  this.victoryPoints[Scoring.GUILD] = 0;
  this.victoryPoints[Scoring.SCIENCE] = 0;

  this.resources[this.board.resource]++;

  this.setEasternNeighbour = function(player) {
    this.east = player;
  };

  this.setWesternNeighbour = function(player) {
    this.west = player;
  };
};

var scienceReward = function(science) {
  return function(player) {
    player.sciences[science]++;
  };
};

var resourceReward = function(resource, amount) {
  return function(player) {
    player.resources[resource] += amount;
  };
};

var goldReward = function(amount) {
  return function(player) {
    player.gold += amount;
  }
};

var pointsReward = function(points, type) {
  return function(player) {
    player.victoryPoints[type] += points;
  };
};

var multiResourceReward = function() {
  var args = Array.prototype.slice.call(arguments);
  return function(player) {
    player.multiResources.push(args);
  };
};

var militaryReward = function(amount) {
  return function(player) {
    player.military += amount;
  };
};

var tradeCostReward = function(type) {
  return function(player) {
    player.tradeCost[type] = 1;
  };
};

var AGE1DECK = [
  new Card('East Trading Post', 1, [], CardType.COMMERCE, tradeCostReward(TradeCost.RESOURCE_EAST), 3, 'Provides discounted resource trade with eastern neighbour.'),
  new Card('East Trading Post', 1, [], CardType.COMMERCE, tradeCostReward(TradeCost.RESOURCE_EAST), 7, 'Provides discounted resource trade with eastern neighbour.'),
  new Card('Marketplace', 1, [], CardType.COMMERCE, tradeCostReward(TradeCost.GOODS), 2, 'Provides discounted goods trade with neighbours.'),
  new Card('Marketplace', 1, [], CardType.COMMERCE, tradeCostReward(TradeCost.GOODS), 6, 'Provides discounted goods trade with neighbours.'),
  new Card('Tavern', 1, [], CardType.COMMERCE, goldReward(5), 4, 'Produces 5 gold.'),
  new Card('Tavern', 1, [], CardType.COMMERCE, goldReward(5), 5, 'Produces 5 gold.'),
  new Card('Tavern', 1, [], CardType.COMMERCE, goldReward(5), 7, 'Produces 5 gold.'),
  new Card('West Trading Post', 1, [], CardType.COMMERCE, tradeCostReward(TradeCost.RESOURCE_WEST), 2, 'Provides discounted resource trade with western neighbour.'),
  new Card('West Trading Post', 1, [], CardType.COMMERCE, tradeCostReward(TradeCost.RESOURCE_WEST), 7, 'Provides discounted resource trade with western neighbour.'),

  new Card('Glassworks', 1, [], CardType.GOODS, resourceReward(Resource.GLASS, 1), 2, 'Produces glass.'),
  new Card('Glassworks', 1, [], CardType.GOODS, resourceReward(Resource.GLASS, 1), 6, 'Produces glass.'),
  new Card('Press', 1, [], CardType.GOODS, resourceReward(Resource.PAPER, 1), 2, 'Produces paper.'),
  new Card('Press', 1, [], CardType.GOODS, resourceReward(Resource.PAPER, 1), 6, 'Produces paper.'),
  new Card('Loom', 1, [], CardType.GOODS, resourceReward(Resource.CLOTH, 1), 2, 'Produces cloth.'),
  new Card('Loom', 1, [], CardType.GOODS, resourceReward(Resource.CLOTH, 1), 6, 'Produces cloth.'),

  new Card('Barracks', 1, [[Resource.ORE]], CardType.MILITARY, militaryReward(1), 2, 'Provides 1 unit of military strength.'),
  new Card('Barracks', 1, [[Resource.ORE]], CardType.MILITARY, militaryReward(1), 5, 'Provides 1 unit of military strength.'),
  new Card('Guard Tower', 1, [[Resource.CLAY]], CardType.MILITARY, militaryReward(1), 3, 'Provides 1 unit of military strength.'),
  new Card('Guard Tower', 1, [[Resource.CLAY]], CardType.MILITARY, militaryReward(1), 4, 'Provides 1 unit of military strength.'),
  new Card('Stockade', 1, [[Resource.WOOD]], CardType.MILITARY, militaryReward(1), 2, 'Provides 1 unit of military strength.'),
  new Card('Stockade', 1, [[Resource.WOOD]], CardType.MILITARY, militaryReward(1), 7, 'Provides 1 unit of military strength.'),

  new Card('Clay Pit', 1, [1], CardType.RESOURCE, multiResourceReward(Resource.CLAY, Resource.ORE), 2, 'Produces clay or ore.'),
  new Card('Clay Pool', 1, [], CardType.RESOURCE, resourceReward(Resource.CLAY, 1), 3, 'Produces clay.'),
  new Card('Clay Pool', 1, [], CardType.RESOURCE, resourceReward(Resource.CLAY, 1), 5, 'Produces clay.'),
  new Card('Excavation', 1, [1], CardType.RESOURCE, multiResourceReward(Resource.STONE, Resource.CLAY), 4, 'Produces stone or clay.'),
  new Card('Forest Cave', 1, [1], CardType.RESOURCE, multiResourceReward(Resource.WOOD, Resource.ORE), 5, 'Produces wood or clay.'),
  new Card('Lumber Yard', 1, [], CardType.RESOURCE, resourceReward(Resource.WOOD, 1), 3, 'Produces wood.'),
  new Card('Lumber Yard', 1, [], CardType.RESOURCE, resourceReward(Resource.WOOD, 1), 4, 'Produces wood.'),
  new Card('Mine', 1, [1], CardType.RESOURCE, multiResourceReward(Resource.STONE, Resource.ORE), 6, 'Produces stone or ore.'),
  new Card('Ore Vein', 1, [], CardType.RESOURCE, resourceReward(Resource.ORE, 1), 3, 'Produces ore.'),
  new Card('Ore Vein', 1, [], CardType.RESOURCE, resourceReward(Resource.ORE, 1), 4, 'Produces ore.'),
  new Card('Stone Pit', 1, [], CardType.RESOURCE, resourceReward(Resource.STONE, 1), 3, 'Produces stone.'),
  new Card('Stone Pit', 1, [], CardType.RESOURCE, resourceReward(Resource.STONE, 1), 5, 'Produces stone.'),
  new Card('Timber Yard', 1, [1], CardType.RESOURCE, multiResourceReward(Resource.STONE, Resource.WOOD), 2, 'Produces stone or wood.'),
  new Card('Tree Farm', 1, [1], CardType.RESOURCE, multiResourceReward(Resource.WOOD, Resource.CLAY), 6, 'Produces wood or clay.'),

  new Card('Apothecary', 1, [[Resource.CLOTH]], CardType.ACADEMICS, scienceReward(Science.ACADEMICS), 2, 'Enhances academics.'),
  new Card('Apothecary', 1, [[Resource.CLOTH]], CardType.ACADEMICS, scienceReward(Science.ACADEMICS), 5, 'Enhances academics.'),
  new Card('Scriptorium', 1, [[Resource.PAPER]], CardType.LITERATURE, scienceReward(Science.LITERATURE), 2, 'Enhances literature.'),
  new Card('Scriptorium', 1, [[Resource.PAPER]], CardType.LITERATURE, scienceReward(Science.LITERATURE), 4, 'Enhances literature.'),
  new Card('Workshop', 1, [[Resource.GLASS]], CardType.ENGINEERING, scienceReward(Science.ENGINEERING), 2, 'Enhances engineering.'),
  new Card('Workshop', 1, [[Resource.GLASS]], CardType.ENGINEERING, scienceReward(Science.ENGINEERING), 7, 'Enhances engineering.'),

  new Card('Altar', 1, [], CardType.VICTORY, pointsReward(2, Scoring.VICTORY), 2, 'Yields 2 victory points.'),
  new Card('Altar', 1, [], CardType.VICTORY, pointsReward(2, Scoring.VICTORY), 5, 'Yields 2 victory points.'),
  new Card('Baths', 1, [[Resource.STONE]], CardType.VICTORY, pointsReward(3, Scoring.VICTORY), 3, 'Yields 3 victory points.'),
  new Card('Baths', 1, [[Resource.STONE]], CardType.VICTORY, pointsReward(3, Scoring.VICTORY), 7, 'Yields 3 victory points.'),
  new Card('Pawnshop', 1, [], CardType.VICTORY, pointsReward(3, Scoring.VICTORY), 4, 'Yields 3 victory points.'),
  new Card('Pawnshop', 1, [], CardType.VICTORY, pointsReward(3, Scoring.VICTORY), 7, 'Yields 3 victory points.'),
  new Card('Theater', 1, [], CardType.VICTORY, pointsReward(2, Scoring.VICTORY), 2, 'Yields 2 victory points.'),
  new Card('Theater', 1, [], CardType.VICTORY, pointsReward(2, Scoring.VICTORY), 6, 'Yields 2 victory points.'),
];

var countCards = function(player, types) {
  var count = 0;
  for (var i = 0, card; card = player.built[i]; i++) {
    if (types.indexOf(card.type) != -1) {
      count++;
    }
  }
  return count;
};

var complexReward = function(pointType, types, self, neighbours, gold, victory) {
  return function(player) {
    if (gold > 0) {
      var extraGold = 0;
      if (self) {
        extraGold += (countCards(player, types) * gold);
      }
      if (neighbours) {
        extraGold += (countCards(player.east, types) * gold);
        extraGold += (countCards(player.west, types) * gold);
      }
      player.gold += extraGold;
    }
    if (victory > 0) {
      player.endGameRewards.push(endGameReward(pointType, types, self, neighbours, victory));
    }
  };
};

var endGameReward = function(pointType, types, self, neighbours, victory) {
  return function(player) {
    var points = 0;
    if (self) {
      points += (countCards(player, types) * victory);
    }
    if (neighbours) {
      points += (countCards(player.east, types) * victory);
      points += (countCards(player.west, types) * victory);
    }
    player.victoryPoints[pointType] += points;
    return points;
  }
};

var generatorReward = function(resources, goods) {
  return function(player) {
    if (resources) {
      player.multiResources.push([Resource.CLAY, Resource.STONE, Resource.WOOD, Resource.ORE]);
    } else if (goods) {
      player.multiResources.push([Resource.GLASS, Resource.CLOTH, Resource.PAPER]);
    }
  };
};

var AGE2DECK = [
  new Card('Bazar', 2, [], CardType.COMMERCE, complexReward(Scoring.COMMERCE, [CardType.GOODS], true, true, 2, 0), 4, 'Produces 2 gold for every grey card you or your neighbours have built.'),
  new Card('Bazar', 2, [], CardType.COMMERCE, complexReward(Scoring.COMMERCE, [CardType.GOODS], true, true, 2, 0), 7, 'Produces 2 gold for every grey card you or your neighbours have built.'),
  new Card('Caravansery', 2, [[Resource.WOOD, Resource.WOOD], 'Marketplace'], CardType.COMMERCE, generatorReward(true, false), 2, 'Produces any resource.'),
  new Card('Caravansery', 2, [[Resource.WOOD, Resource.WOOD], 'Marketplace'], CardType.COMMERCE, generatorReward(true, false), 5, 'Produces any resource.'),
  new Card('Caravansery', 2, [[Resource.WOOD, Resource.WOOD], 'Marketplace'], CardType.COMMERCE, generatorReward(true, false), 6, 'Produces any resource.'),
  new Card('Forum', 2, [[Resource.CLAY, Resource.CLAY], 'East Trading Post', 'West Trading Post'], CardType.COMMERCE, generatorReward(false, true), 2, 'Produces any good.'),
  new Card('Forum', 2, [[Resource.CLAY, Resource.CLAY], 'East Trading Post', 'West Trading Post'], CardType.COMMERCE, generatorReward(false, true), 6, 'Produces any good.'),
  new Card('Forum', 2, [[Resource.CLAY, Resource.CLAY], 'East Trading Post', 'West Trading Post'], CardType.COMMERCE, generatorReward(false, true), 7, 'Produces any good.'),
  new Card('Vineyard', 2, [], CardType.COMMERCE, complexReward(Scoring.COMMERCE, [CardType.RESOURCE], true, true, 1, 0), 3, 'Produces 1 gold for every brown card you or your neighbours have built.'),
  new Card('Vineyard', 2, [], CardType.COMMERCE, complexReward(Scoring.COMMERCE, [CardType.RESOURCE], true, true, 1, 0), 6, 'Produces 1 gold for every brown card you or your neighbours have built.'),

  new Card('Glassworks', 2, [], CardType.GOODS, resourceReward(Resource.GLASS, 1), 3, 'Produces glass.'),
  new Card('Glassworks', 2, [], CardType.GOODS, resourceReward(Resource.GLASS, 1), 5, 'Produces glass.'),
  new Card('Press', 2, [], CardType.GOODS, resourceReward(Resource.PAPER, 1), 3, 'Produces paper.'),
  new Card('Press', 2, [], CardType.GOODS, resourceReward(Resource.PAPER, 1), 5, 'Produces paper.'),
  new Card('Loom', 2, [], CardType.GOODS, resourceReward(Resource.CLOTH, 1), 3, 'Produces cloth.'),
  new Card('Loom', 2, [], CardType.GOODS, resourceReward(Resource.CLOTH, 1), 5, 'Produces cloth.'),

  new Card('Archery Range', 2, [[Resource.WOOD, Resource.WOOD, Resource.ORE], 'Workshop'], CardType.MILITARY, militaryReward(2), 2, 'Provides 2 units of military strength.'),
  new Card('Archery Range', 2, [[Resource.WOOD, Resource.WOOD, Resource.ORE], 'Workshop'], CardType.MILITARY, militaryReward(2), 6, 'Provides 2 units of military strength.'),
  new Card('Stables', 2, [[Resource.CLAY, Resource.WOOD, Resource.ORE], 'Apothecary'], CardType.MILITARY, militaryReward(2), 2, 'Provides 2 units of military strength.'),
  new Card('Stables', 2, [[Resource.CLAY, Resource.WOOD, Resource.ORE], 'Apothecary'], CardType.MILITARY, militaryReward(2), 5, 'Provides 2 units of military strength.'),
  new Card('Training Ground', 2, [[Resource.ORE, Resource.ORE, Resource.WOOD]], CardType.MILITARY, militaryReward(2), 4, 'Provides 2 units of military strength.'),
  new Card('Training Ground', 2, [[Resource.ORE, Resource.ORE, Resource.WOOD]], CardType.MILITARY, militaryReward(2), 6, 'Provides 2 units of military strength.'),
  new Card('Training Ground', 2, [[Resource.ORE, Resource.ORE, Resource.WOOD]], CardType.MILITARY, militaryReward(2), 7, 'Provides 2 units of military strength.'),
  new Card('Walls', 2, [[Resource.STONE, Resource.STONE, Resource.STONE]], CardType.MILITARY, militaryReward(2), 3, 'Provides 2 units of military strength.'),
  new Card('Walls', 2, [[Resource.STONE, Resource.STONE, Resource.STONE]], CardType.MILITARY, militaryReward(2), 7, 'Provides 2 units of military strength.'),

  new Card('Brickyard', 2, [1], CardType.RESOURCE, resourceReward(Resource.CLAY, 2), 2, 'Produces 2 units of clay.'),
  new Card('Brickyard', 2, [1], CardType.RESOURCE, resourceReward(Resource.CLAY, 2), 4, 'Produces 2 units of clay.'),
  new Card('Foundry', 2, [1], CardType.RESOURCE, resourceReward(Resource.ORE, 2), 2, 'Produces 2 units of ore.'),
  new Card('Foundry', 2, [1], CardType.RESOURCE, resourceReward(Resource.ORE, 2), 4, 'Produces 2 units of ore.'),
  new Card('Quarry', 2, [1], CardType.RESOURCE, resourceReward(Resource.STONE, 2), 2, 'Produces 2 units of stone.'),
  new Card('Quarry', 2, [1], CardType.RESOURCE, resourceReward(Resource.STONE, 2), 4, 'Produces 2 units of stone.'),
  new Card('Sawmill', 2, [1], CardType.RESOURCE, resourceReward(Resource.WOOD, 2), 2, 'Produces 2 units of wood.'),
  new Card('Sawmill', 2, [1], CardType.RESOURCE, resourceReward(Resource.WOOD, 2), 4, 'Produces 2 units of wood.'),

  new Card('Dispensary', 2, [[Resource.ORE, Resource.ORE, Resource.GLASS], 'Apothecary'], CardType.ACADEMICS, scienceReward(Science.ACADEMICS), 2, 'Enhances academics.'),
  new Card('Dispensary', 2, [[Resource.ORE, Resource.ORE, Resource.GLASS], 'Apothecary'], CardType.ACADEMICS, scienceReward(Science.ACADEMICS), 4, 'Enhances academics.'),
  new Card('Laboratory', 2, [[Resource.CLAY, Resource.CLAY, Resource.PAPER], 'Workshop'], CardType.ENGINEERING, scienceReward(Science.ENGINEERING), 2, 'Enhances engineering.'),
  new Card('Laboratory', 2, [[Resource.CLAY, Resource.CLAY, Resource.PAPER], 'Workshop'], CardType.ENGINEERING, scienceReward(Science.ENGINEERING), 5, 'Enhances engineering.'),
  new Card('Library', 2, [[Resource.STONE, Resource.STONE, Resource.CLOTH], 'Scriptorium'], CardType.LITERATURE, scienceReward(Science.LITERATURE), 2, 'Enhances literature.'),
  new Card('Library', 2, [[Resource.STONE, Resource.STONE, Resource.CLOTH], 'Scriptorium'], CardType.LITERATURE, scienceReward(Science.LITERATURE), 6, 'Enhances literature.'),
  new Card('School', 2, [[Resource.WOOD, Resource.PAPER]], CardType.LITERATURE, scienceReward(Science.LITERATURE), 3, 'Enhances literature.'),
  new Card('School', 2, [[Resource.WOOD, Resource.PAPER]], CardType.LITERATURE, scienceReward(Science.LITERATURE), 7, 'Enhances literature.'),

  new Card('Aquaduct', 2, [[Resource.STONE, Resource.STONE, Resource.STONE], 'Baths'], CardType.VICTORY, pointsReward(5, Scoring.VICTORY), 3, 'Yields 5 victory points.'),
  new Card('Aquaduct', 2, [[Resource.STONE, Resource.STONE, Resource.STONE], 'Baths'], CardType.VICTORY, pointsReward(5, Scoring.VICTORY), 7, 'Yields 5 victory points.'),
  new Card('Courthouse', 2, [[Resource.CLAY, Resource.CLAY, Resource.CLOTH], 'Scriptorium'], CardType.VICTORY, pointsReward(4, Scoring.VICTORY), 2, 'Yields 4 victory points.'),
  new Card('Courthouse', 2, [[Resource.CLAY, Resource.CLAY, Resource.CLOTH], 'Scriptorium'], CardType.VICTORY, pointsReward(4, Scoring.VICTORY), 5, 'Yields 4 victory points.'),
  new Card('Statue', 2, [[Resource.ORE, Resource.ORE, Resource.WOOD], 'Theater'], CardType.VICTORY, pointsReward(4, Scoring.VICTORY), 2, 'Yields 4 victory points.'),
  new Card('Statue', 2, [[Resource.ORE, Resource.ORE, Resource.WOOD], 'Theater'], CardType.VICTORY, pointsReward(4, Scoring.VICTORY), 7, 'Yields 4 victory points.'),
  new Card('Temple', 2, [[Resource.WOOD, Resource.CLAY, Resource.GLASS], 'Altar'], CardType.VICTORY, pointsReward(3, Scoring.VICTORY), 2, 'Yields 3 victory points.'),
  new Card('Temple', 2, [[Resource.WOOD, Resource.CLAY, Resource.GLASS], 'Altar'], CardType.VICTORY, pointsReward(3, Scoring.VICTORY), 6, 'Yields 3 victory points.'),
];

// Change to end of game, greedy does not work.
var anyScienceReward = function() {
  return function(player) {
    player.bonusSciences++;
  };
};
var strategistReward = function() {
  return function(player) {
    player.endGameRewards.push(function(player) {
      var points = 0;
      points += player.east.battleTokens.filter(function(token) {
        return token == -1;
      }).length;
      points += player.west.battleTokens.filter(function(token) {
        return token == -1;
      }).length;
      player.victoryPoints[Scoring.GUILD] += points;
    });
  };
};

var AGE3DECK = [
  new Card('Arena', 3, [[Resource.STONE, Resource.STONE, Resource.ORE], 'Dispensary'], CardType.COMMERCE, complexReward(Scoring.COMMERCE, [CardType.WONDER], true, false, 3, 1), 2, 'Yields 3 gold and 1 victory point for every wonder stage built.'),
  new Card('Arena', 3, [[Resource.STONE, Resource.STONE, Resource.ORE], 'Dispensary'], CardType.COMMERCE, complexReward(Scoring.COMMERCE, [CardType.WONDER], true, false, 3, 1), 5, 'Yields 3 gold and 1 victory point for every wonder stage built.'),
  new Card('Arena', 3, [[Resource.STONE, Resource.STONE, Resource.ORE], 'Dispensary'], CardType.COMMERCE, complexReward(Scoring.COMMERCE, [CardType.WONDER], true, false, 3, 1), 7, 'Yields 3 gold and 1 victory point for every wonder stage built.'),
  new Card('Chamber Of Commerce', 3, [[Resource.CLAY, Resource.CLAY, Resource.PAPER]], CardType.COMMERCE, complexReward(Scoring.COMMERCE, [CardType.GOODS], true, false, 2, 2), 4, 'Yields 2 gold and 2 victory points for grey card.'),
  new Card('Chamber Of Commerce', 3, [[Resource.CLAY, Resource.CLAY, Resource.PAPER]], CardType.COMMERCE, complexReward(Scoring.COMMERCE, [CardType.GOODS], true, false, 2, 2), 6, 'Yields 2 gold and 2 victory points for grey card.'),
  new Card('Haven', 3, [[Resource.WOOD, Resource.ORE, Resource.CLOTH], 'Forum'], CardType.COMMERCE, complexReward(Scoring.COMMERCE, [CardType.RESOURCE], true, false, 1, 1), 2, 'Yields 1 gold and 1 victory point for brown card.'),
  new Card('Haven', 3, [[Resource.WOOD, Resource.ORE, Resource.CLOTH], 'Forum'], CardType.COMMERCE, complexReward(Scoring.COMMERCE, [CardType.RESOURCE], true, false, 1, 1), 4, 'Yields 1 gold and 1 victory point for brown card.'),
  new Card('Lighthouse', 3, [[Resource.STONE, Resource.GLASS], 'Caravansery'], CardType.COMMERCE, complexReward(Scoring.COMMERCE, [CardType.COMMERCE], true, false, 1, 1), 2, 'Yields 1 gold and 1 victory point for yellow card.'),
  new Card('Lighthouse', 3, [[Resource.STONE, Resource.GLASS], 'Caravansery'], CardType.COMMERCE, complexReward(Scoring.COMMERCE, [CardType.COMMERCE], true, false, 1, 1), 6, 'Yields 1 gold and 1 victory point for yellow card.'),

  new Card('Builders Guild', 3, [[Resource.STONE, Resource.STONE, Resource.CLAY, Resource.CLAY, Resource.GLASS]], CardType.GUILD, complexReward(Scoring.GUILD, [CardType.WONDER], true, true, 0, 1), 0, 'Yields 1 victory point for wonder stage you or your neighbours have built.'),
  new Card('Craftsmens Guild', 3, [[Resource.ORE, Resource.ORE, Resource.STONE, Resource.STONE]], CardType.GUILD, complexReward(Scoring.GUILD, [CardType.GOODS], false, true, 0, 2), 0, 'Yields 2 victory points for every grey card your neighbours have.'),
  new Card('Magistrates Guild', 3, [[Resource.WOOD, Resource.WOOD, Resource.WOOD, Resource.STONE, Resource.CLOTH]], CardType.GUILD, complexReward(Scoring.GUILD, [CardType.VICTORY], false, true, 0, 1), 0, 'Yields 1 victory point for every blue card your neighbours have.'),
  new Card('Philosophers Guild', 3, [[Resource.CLAY, Resource.CLAY, Resource.CLAY, Resource.PAPER, Resource.CLOTH]], CardType.GUILD, complexReward(Scoring.GUILD, [CardType.SCIENCE], false, true, 0, 1), 0, 'Yields 1 victory point for every green card your neighbours have.'),
  new Card('Scientists Guild', 3, [[Resource.WOOD, Resource.WOOD, Resource.ORE, Resource.ORE, Resource.PAPER]], CardType.GUILD, anyScienceReward(), 0, 'Enhances a science of your choice.'),
  new Card('Shipowners Guild', 3, [[Resource.WOOD, Resource.WOOD, Resource.WOOD, Resource.GLASS, Resource.PAPER]], CardType.GUILD, complexReward(Scoring.GUILD, [CardType.RESOURCE, CardType.GOODS, CardType.GUILD], true, false, 0, 1), 0, 'Yields 1 victory points for every brown, grey or purple card.'),
  new Card('Spies Guild', 3, [[Resource.CLAY, Resource.CLAY, Resource.CLAY, Resource.GLASS]], CardType.GUILD, complexReward(Scoring.GUILD, [CardType.MILITARY], false, true, 0, 1), 0, 'Yields 1 victory point for every red card your neighbours have.'),
  new Card('Strategists Guild', 3, [[Resource.ORE, Resource.ORE, Resource.STONE, Resource.CLOTH]], CardType.GUILD, strategistReward(), 0, 'Yields 1 victory point for every combat loss token your neighbours have.'),
  new Card('Traders Guild', 3, [[Resource.GLASS, Resource.CLOTH, Resource.PAPER]], CardType.GUILD, complexReward(Scoring.GUILD, [CardType.COMMERCE], false, true, 0, 1), 0, 'Yields 1 victory point for every yellow card your neighbours have.'),
  new Card('Workers Guild', 3, [[Resource.ORE, Resource.ORE, Resource.CLAY, Resource.STONE, Resource.WOOD]], CardType.GUILD, complexReward(Scoring.GUILD, [CardType.RESOURCE], false, true, 0, 1), 0, 'Yields 1 victory point for every brown card your neighbours have.'),

  new Card('Arsenal', 3, [[Resource.WOOD, Resource.WOOD, Resource.ORE, Resource.CLOTH]], CardType.MILITARY, militaryReward(3), 3, 'Provides 3 units of military strength.'),
  new Card('Arsenal', 3, [[Resource.WOOD, Resource.WOOD, Resource.ORE, Resource.CLOTH]], CardType.MILITARY, militaryReward(3), 4, 'Provides 3 units of military strength.'),
  new Card('Arsenal', 3, [[Resource.WOOD, Resource.WOOD, Resource.ORE, Resource.CLOTH]], CardType.MILITARY, militaryReward(3), 7, 'Provides 3 units of military strength.'),
  new Card('Circus', 3, [[Resource.STONE, Resource.STONE, Resource.STONE, Resource.ORE], 'Training Ground'], CardType.MILITARY, militaryReward(3), 4, 'Provides 3 units of military strength.'),
  new Card('Circus', 3, [[Resource.STONE, Resource.STONE, Resource.STONE, Resource.ORE], 'Training Ground'], CardType.MILITARY, militaryReward(3), 5, 'Provides 3 units of military strength.'),
  new Card('Circus', 3, [[Resource.STONE, Resource.STONE, Resource.STONE, Resource.ORE], 'Training Ground'], CardType.MILITARY, militaryReward(3), 6, 'Provides 3 units of military strength.'),
  new Card('Fortifications', 3, [[Resource.ORE, Resource.ORE, Resource.ORE, Resource.STONE], 'Walls'], CardType.MILITARY, militaryReward(3), 3, 'Provides 3 units of military strength.'),
  new Card('Fortifications', 3, [[Resource.ORE, Resource.ORE, Resource.ORE, Resource.STONE], 'Walls'], CardType.MILITARY, militaryReward(3), 7, 'Provides 3 units of military strength.'),
  new Card('Siege Workshop', 3, [[Resource.CLAY, Resource.CLAY, Resource.CLAY, Resource.WOOD], 'Laboratory'], CardType.MILITARY, militaryReward(3), 2, 'Provides 3 units of military strength.'),
  new Card('Siege Workshop', 3, [[Resource.CLAY, Resource.CLAY, Resource.CLAY, Resource.WOOD], 'Laboratory'], CardType.MILITARY, militaryReward(3), 5, 'Provides 3 units of military strength.'),

  new Card('Academy', 3, [[Resource.STONE, Resource.STONE, Resource.STONE, Resource.GLASS], 'School'], CardType.ACADEMICS, scienceReward(Science.ACADEMICS), 3, 'Enhances academics.'),
  new Card('Academy', 3, [[Resource.STONE, Resource.STONE, Resource.STONE, Resource.GLASS], 'School'], CardType.ACADEMICS, scienceReward(Science.ACADEMICS), 7, 'Enhances academics.'),
  new Card('Lodge', 3, [[Resource.CLAY, Resource.CLAY, Resource.PAPER, Resource.CLOTH], 'Dispensary'], CardType.ACADEMICS, scienceReward(Science.ACADEMICS), 2, 'Enhances academics.'),
  new Card('Lodge', 3, [[Resource.CLAY, Resource.CLAY, Resource.PAPER, Resource.CLOTH], 'Dispensary'], CardType.ACADEMICS, scienceReward(Science.ACADEMICS), 6, 'Enhances academics.'),
  new Card('Observatory', 3, [[Resource.ORE, Resource.ORE, Resource.GLASS, Resource.CLOTH], 'Laboratory'], CardType.ENGINEERING, scienceReward(Science.ENGINEERING), 2, 'Enhances engineering.'),
  new Card('Observatory', 3, [[Resource.ORE, Resource.ORE, Resource.GLASS, Resource.CLOTH], 'Laboratory'], CardType.ENGINEERING, scienceReward(Science.ENGINEERING), 7, 'Enhances engineering.'),
  new Card('Study', 3, [[Resource.WOOD, Resource.PAPER, Resource.CLOTH], 'School'], CardType.ENGINEERING, scienceReward(Science.ENGINEERING), 3, 'Enhances engineering.'),
  new Card('Study', 3, [[Resource.WOOD, Resource.PAPER, Resource.CLOTH], 'School'], CardType.ENGINEERING, scienceReward(Science.ENGINEERING), 5, 'Enhances engineering.'),
  new Card('University', 3, [[Resource.WOOD, Resource.WOOD, Resource.PAPER, Resource.GLASS], 'Library'], CardType.LITERATURE, scienceReward(Science.LITERATURE), 2, 'Enhances literature.'),
  new Card('University', 3, [[Resource.WOOD, Resource.WOOD, Resource.PAPER, Resource.GLASS], 'Library'], CardType.LITERATURE, scienceReward(Science.LITERATURE), 4, 'Enhances literature.'),

  new Card('Gardens', 3, [[Resource.CLAY, Resource.CLAY, Resource.WOOD], 'Statue'], CardType.VICTORY, pointsReward(5, Scoring.VICTORY), 2, 'Yields 5 victory points.'),
  new Card('Gardens', 3, [[Resource.CLAY, Resource.CLAY, Resource.WOOD], 'Statue'], CardType.VICTORY, pointsReward(5, Scoring.VICTORY), 4, 'Yields 5 victory points.'),
  new Card('Palace', 3, [[Resource.STONE, Resource.ORE, Resource.WOOD, Resource.CLAY, Resource.GLASS, Resource.PAPER, Resource.CLOTH]], CardType.VICTORY, pointsReward(8, Scoring.VICTORY), 3, 'Yields 8 victory points.'),
  new Card('Palace', 3, [[Resource.STONE, Resource.ORE, Resource.WOOD, Resource.CLAY, Resource.GLASS, Resource.PAPER, Resource.CLOTH]], CardType.VICTORY, pointsReward(8, Scoring.VICTORY), 7, 'Yields 8 victory points.'),
  new Card('Pantheon', 3, [[Resource.CLAY, Resource.CLAY, Resource.ORE, Resource.GLASS, Resource.PAPER, Resource.CLOTH], 'Temple'], CardType.VICTORY, pointsReward(7, Scoring.VICTORY), 2, 'Yields 7 victory points.'),
  new Card('Pantheon', 3, [[Resource.CLAY, Resource.CLAY, Resource.ORE, Resource.GLASS, Resource.PAPER, Resource.CLOTH], 'Temple'], CardType.VICTORY, pointsReward(7, Scoring.VICTORY), 6, 'Yields 7 victory points.'),
  new Card('Senate', 3, [[Resource.WOOD, Resource.WOOD, Resource.STONE, Resource.ORE], 'Library'], CardType.VICTORY, pointsReward(6, Scoring.VICTORY), 2, 'Yields 6 victory points.'),
  new Card('Senate', 3, [[Resource.WOOD, Resource.WOOD, Resource.STONE, Resource.ORE], 'Library'], CardType.VICTORY, pointsReward(6, Scoring.VICTORY), 5, 'Yields 6 victory points.'),
  new Card('Town Hall', 3, [[Resource.STONE, Resource.STONE, Resource.ORE, Resource.GLASS]], CardType.VICTORY, pointsReward(6, Scoring.VICTORY), 3, 'Yields 6 victory points.'),
  new Card('Town Hall', 3, [[Resource.STONE, Resource.STONE, Resource.ORE, Resource.GLASS]], CardType.VICTORY, pointsReward(6, Scoring.VICTORY), 5, 'Yields 6 victory points.'),
  new Card('Town Hall', 3, [[Resource.STONE, Resource.STONE, Resource.ORE, Resource.GLASS]], CardType.VICTORY, pointsReward(6, Scoring.VICTORY), 6, 'Yields 6 victory points.'),
];
var doubleBuildReward = function() {
  return function(player) {
    player.canDoubleBuild = true;
  };
};

var multiReward = function(reward1, reward2, reward3) {
  return function(player) {
    console.log('executing multi reward');
    reward1(player);
    reward2(player);
    if (reward3) {
      reward3(player);
    }
  };
};

var discardedReward = function() {
  return function(player) {
    console.log('setting play discarded now for player', player);
    player.playDiscardedNow = true;
  };
};

var freeBuildReward = function() {
  return function(player) {
    player.canBuildForFree = [true, true, true];
  };
};

var guildCopyReward = function() {
  return function(player) {
    player.endGameRewards.push(function(player) {
      console.log('before', player.victoryPoints);
      var availableGuilds = player.east.built.filter(function(card) {
        return card.type == CardType.GUILD;
      }).concat(player.west.built.filter(function(card) {
        return card.type == CardType.GUILD;
      }));
      console.log('available guilds', availableGuilds);

      if (availableGuilds.length == 0) {
        return;
      }

      // Count score for guilds using cloned player state
      // Get highest score
      var max = 0;
      var bestReward, bestGuild;
      for (var i = 0; i < availableGuilds.length; i++) {
        var currGuild = availableGuilds[i];
        console.log('trying', currGuild);
        var clonedPlayers = clonePlayers([player.east, player, player.west]);

        // Execute reward
        var points = 0;
        currGuild.rewards(clonedPlayers[1]);
        if (clonedPlayers[1].endGameRewards.length > 0) {
          points += clonedPlayers[1].endGameRewards[0](clonedPlayers[1]);
        }

        // Calculate science reward
        points += calcScienceScore(clonedPlayers[1]);
        console.log('points', points);
        if (points > max) {
          console.log('better than max!');
          max = points;
          if (clonedPlayers[1].endGameRewards.length > 0) {
            bestReward = clonedPlayers[1].endGameRewards[0];
          } else {
            bestReward = currGuild.rewards;
          }
          bestGuild = currGuild
        }
      }
      console.log('best reward', bestReward, bestGuild);
      bestReward(player);
      console.log('after', player.victoryPoints);
    });
  };
};

var getBoard = function(name) {
  for (var i = 0; i < WONDERS.length; i++) {
    if (WONDERS[i].name == name) {
      return WONDERS[i];
    }
  }
};

var WONDERS = [
  new Wonder('Alexandria', Resource.GLASS,
    new Card('AA1', 0, [[Resource.STONE, Resource.STONE]], CardType.WONDER, pointsReward(3, Scoring.WONDER), 0, 'Yields 3 victory points.'),
    new Card('AA2', 0, [[Resource.ORE, Resource.ORE]], CardType.WONDER, generatorReward(true, false), 0, 'Produces any resource.'),
    new Card('AA3', 0, [[Resource.GLASS, Resource.GLASS]], CardType.WONDER, pointsReward(7, Scoring.WONDER), 0, 'Yields 7 victory points.'),
    new Card('AB1', 0, [[Resource.CLAY, Resource.CLAY]], CardType.WONDER, generatorReward(true, false), 0, 'Produces any resource.'),
    new Card('AB2', 0, [[Resource.WOOD, Resource.WOOD]], CardType.WONDER, generatorReward(false, true), 0, 'Produces any goods.'),
    new Card('AB3', 0, [[Resource.STONE, Resource.STONE, Resource.STONE]], CardType.WONDER, pointsReward(7, Scoring.WONDER), 0, 'Yields 7 victory points.')
  ),
  new Wonder('Babylon', Resource.CLAY,
    new Card('BA1', 0, [[Resource.CLAY, Resource.CLAY]], CardType.WONDER, pointsReward(3, Scoring.WONDER), 0, 'Yields 3 victory points.'),
    new Card('BA2', 0, [[Resource.WOOD, Resource.WOOD, Resource.WOOD]], CardType.WONDER, anyScienceReward(), 0, 'Enhances a science of your choice.'),
    new Card('BA3', 0, [[Resource.CLAY, Resource.CLAY, Resource.CLAY, Resource.CLAY]], CardType.WONDER, pointsReward(7, Scoring.WONDER), 0, 'Yields 7 victory points.'),
    new Card('BB1', 0, [[Resource.CLOTH, Resource.CLAY]], CardType.WONDER, pointsReward(3, Scoring.WONDER), 0, 'Yields 3 victory points.'),
    new Card('BB2', 0, [[Resource.GLASS, Resource.WOOD, Resource.WOOD]], CardType.WONDER, doubleBuildReward(), 0, 'Both cards may be played at the end of each age.'),
    new Card('BB3', 0, [[Resource.PAPER, Resource.CLAY, Resource.CLAY, Resource.CLAY]], CardType.WONDER, anyScienceReward(), 0, 'Enhances a science of your choice.')
  ),
  new Wonder('Ephesos', Resource.PAPER,
    new Card('EA1', 0, [[Resource.STONE, Resource.STONE]], CardType.WONDER, pointsReward(3, Scoring.WONDER), 0, 'Yields 3 victory points.'),
    new Card('EA2', 0, [[Resource.WOOD, Resource.WOOD]], CardType.WONDER, goldReward(9), 0, 'Produces 9 gold.'),
    new Card('EA3', 0, [[Resource.PAPER, Resource.PAPER]], CardType.WONDER, pointsReward(7, Scoring.WONDER), 0, 'Yields 7 victory points.'),
    new Card('EB1', 0, [[Resource.STONE, Resource.STONE]], CardType.WONDER, multiReward(pointsReward(2, Scoring.WONDER), goldReward(4)), 0, 'Yields 2 victory points and 4 gold.'),
    new Card('EB2', 0, [[Resource.WOOD, Resource.WOOD]], CardType.WONDER, multiReward(pointsReward(3, Scoring.WONDER), goldReward(4)), 0, 'Yields 3 victory points and 4 gold.'),
    new Card('EB3', 0, [[Resource.PAPER, Resource.CLOTH, Resource.GLASS]], CardType.WONDER, multiReward(pointsReward(5, Scoring.WONDER), goldReward(4)), 0, 'Yields 5 victory points and 4 gold.')
  ),
  new Wonder('Gizah', Resource.STONE,
    new Card('GA1', 0, [[Resource.STONE, Resource.STONE]], CardType.WONDER, pointsReward(3, Scoring.WONDER), 0, 'Yields 3 victory points.'),
    new Card('GA2', 0, [[Resource.WOOD, Resource.WOOD, Resource.WOOD]], CardType.WONDER, pointsReward(5, Scoring.WONDER), 0, 'Yields 5 victory points.'),
    new Card('GA3', 0, [[Resource.STONE, Resource.STONE, Resource.STONE, Resource.STONE]], CardType.WONDER, pointsReward(7, Scoring.WONDER), 0, 'Yields 7 victory points.'),
    new Card('GB1', 0, [[Resource.WOOD, Resource.WOOD]], CardType.WONDER, pointsReward(3, Scoring.WONDER), 0, 'Yields 3 victory points.'),
    new Card('GB2', 0, [[Resource.STONE, Resource.STONE, Resource.STONE]], CardType.WONDER, pointsReward(5, Scoring.WONDER), 0, 'Yields 5 victory points.'),
    new Card('GB3', 0, [[Resource.CLAY, Resource.CLAY, Resource.CLAY]], CardType.WONDER, pointsReward(5, Scoring.WONDER), 0, 'Yields 5 victory points.'),
    new Card('GB4', 0, [[Resource.PAPER, Resource.STONE, Resource.STONE, Resource.STONE, Resource.STONE]], CardType.WONDER, pointsReward(7, Scoring.WONDER), 0, 'Yields 7 victory points.')
  ),
  new Wonder('Halikarnassos', Resource.CLOTH,
    new Card('HA1', 0, [[Resource.CLAY, Resource.CLAY]], CardType.WONDER, pointsReward(3, Scoring.WONDER), 0, 'Yields 3 victory points.'),
    new Card('HA2', 0, [[Resource.ORE, Resource.ORE, Resource.ORE]], CardType.WONDER, discardedReward(), 0, 'Play a card from the discard pile for free.'),
    new Card('HA3', 0, [[Resource.CLOTH, Resource.CLOTH]], CardType.WONDER, pointsReward(7, Scoring.WONDER), 0, 'Yields 7 victory points.'),
    new Card('HB1', 0, [[Resource.ORE, Resource.ORE]], CardType.WONDER, multiReward(pointsReward(2, Scoring.WONDER), discardedReward()), 0, 'Yields 2 victory points and allows playing of a card from the discard pile for free.'),
    new Card('HB2', 0, [[Resource.CLAY, Resource.CLAY, Resource.CLAY]], CardType.WONDER, multiReward(pointsReward(1, Scoring.WONDER), discardedReward()), 0, 'Yields 1 victory point and allows playing of a card from the discard pile for free.'),
    new Card('HB3', 0, [[Resource.GLASS, Resource.PAPER, Resource.CLOTH]], CardType.WONDER, discardedReward(), 0, 'Play a card from the discard pile for free.')
  ),
  new Wonder('Olympia', Resource.WOOD,
    new Card('OA1', 0, [[Resource.WOOD, Resource.WOOD]], CardType.WONDER, pointsReward(3, Scoring.WONDER), 0, 'Yields 3 victory points.'),
    new Card('OA2', 0, [[Resource.STONE, Resource.STONE]], CardType.WONDER, freeBuildReward(), 0, 'Once per age, construct a building for free.'),
    new Card('OA3', 0, [[Resource.ORE, Resource.ORE]], CardType.WONDER, pointsReward(7, Scoring.WONDER), 0, 'Yields 7 victory points.'),
    new Card('OB1', 0, [[Resource.WOOD, Resource.WOOD]], CardType.WONDER, multiReward(tradeCostReward(TradeCost.RESOURCE_EAST), tradeCostReward(TradeCost.RESOURCE_WEST)), 0, 'Provides discounted resource trade with neighbours.'),
    new Card('OB2', 0, [[Resource.STONE, Resource.STONE]], CardType.WONDER, pointsReward(5, Scoring.WONDER), 0, 'Yields 5 victory points.'),
    new Card('OB3', 0, [[Resource.CLOTH, Resource.ORE, Resource.ORE]], CardType.WONDER, guildCopyReward(), 0, 'At the end of the game, copy one guild from a neighbour.')
  ),
  new Wonder('Rhodos', Resource.ORE,
    new Card('RA1', 0, [[Resource.WOOD, Resource.WOOD]], CardType.WONDER, pointsReward(3, Scoring.WONDER), 0, 'Yields 3 victory points.'),
    new Card('RA2', 0, [[Resource.CLAY, Resource.CLAY, Resource.CLAY]], CardType.WONDER, militaryReward(2), 0, 'Provides 2 units of military stength.'),
    new Card('RA3', 0, [[Resource.ORE, Resource.ORE, Resource.ORE, Resource.ORE]], CardType.WONDER, pointsReward(7, Scoring.WONDER), 0, 'Yields 7 victory points.'),
    new Card('RB1', 0, [[Resource.STONE, Resource.STONE, Resource.STONE]], CardType.WONDER, multiReward(militaryReward(1), pointsReward(3, Scoring.WONDER), goldReward(3)), 0, 'Yields 3 victory points, 3 gold and provides 1 unit of military stength.'),
    new Card('RB2', 0, [[Resource.ORE, Resource.ORE, Resource.ORE, Resource.ORE]], CardType.WONDER, multiReward(militaryReward(1), pointsReward(4, Scoring.WONDER), goldReward(4)), 0, 'Yields 4 victory points, 4 gold and provides 1 unit of military stength.')
  ),
];

var clonePlayers = function(players) {
  var clonedPlayers = players.map(function(player) {
    var clone = new Player(player.board, player.side, null /* not cloned */);

    clone.sciences[Science.ACADEMICS] = player.sciences[Science.ACADEMICS];
    clone.sciences[Science.ENGINEERING] = player.sciences[Science.ENGINEERING];
    clone.sciences[Science.LITERATURE] = player.sciences[Science.LITERATURE];

    clone.tradeCost[TradeCost.RESOURCE_EAST] = player.tradeCost[TradeCost.RESOURCE_EAST];
    clone.tradeCost[TradeCost.RESOURCE_WEST] = player.tradeCost[TradeCost.RESOURCE_WEST];
    clone.tradeCost[TradeCost.GOODS] = player.tradeCost[TradeCost.GOODS];

    clone.resources[Resource.CLAY] = player.resources[Resource.CLAY];
    clone.resources[Resource.STONE] = player.resources[Resource.STONE];
    clone.resources[Resource.WOOD] = player.resources[Resource.WOOD];
    clone.resources[Resource.ORE] = player.resources[Resource.ORE];
    clone.resources[Resource.GLASS] = player.resources[Resource.GLASS];
    clone.resources[Resource.CLOTH] = player.resources[Resource.CLOTH];
    clone.resources[Resource.PAPER] = player.resources[Resource.PAPER];

    clone.gold = player.gold;
    clone.victoryPoints = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}; // not cloned
    clone.military = player.military;
    clone.battleTokens = Array.prototype.slice.call(player.battleTokens);
    clone.built = Array.prototype.slice.call(player.built);
    clone.endGameRewards = []; // not cloned
    clone.canDoubleBuild = player.canDoubleBuild; // Babylon B
    clone.playDiscardedNow = player.playDiscardedNow; // Halikarnassos
    clone.canBuildForFree = Array.prototype.slice.call(player.canBuildForFree); // Olympia A

    return clone;
  });

  // Clockface
  for (var i = 0, player; player = clonedPlayers[i]; i++) {
    player.setEasternNeighbour(clonedPlayers[(i + clonedPlayers.length - 1) % clonedPlayers.length]);
    player.setWesternNeighbour(clonedPlayers[(i + clonedPlayers.length + 1) % clonedPlayers.length]);
  }

  return clonedPlayers;
};

var Action = {
  BUILD: 0,
  BUILD_WONDER: 1,
  DISCARD: 2
};

var getNextStage = function(player) {
  return player.board.stages.filter(function(candidate) {
    console.log('matching', candidate.name, (player.board.name.charAt(0) + player.side + (player.stagesBuilt.length + 1)));
    return candidate.name == (player.board.name.charAt(0) + player.side + (player.stagesBuilt.length + 1));
  })[0];
};

var executeReward = function(func, player) {
  return function() {
    func(player);
  };
};

var canPay = function(resources /* unspent multi resources that the player has */, needed /* what is needed for building that does not need to be bought */, purchase /* what the player is trying to buy */) {
  console.log('trying', resources.slice(0), needed.slice(0));
  if (needed.length == 0) {
    // once what is needed has been fulfilled, ensure that things to purchase cannot possibly be fulfilled with unspent resources
    if (purchase.length == 0) {
      console.log('no purchases');
      return true;
    } else {
      console.log('searching for purchases', purchase.slice(0), 'from', resources.slice(0));
      for (var i = 0, multiResource; multiResource = resources[i]; i++) {
        for (var j = 0, resourceNeeded; j < purchase.length; j++) {
          resourceNeeded = purchase[j];
          if (multiResource.indexOf(resourceNeeded) != -1) {
            // a needed resource can possibly be fulfilled by player's own generators. invalid purchases attempt.
            console.log('a needed resource can possibly be fulfilled by player\'s own generators. invalid purchases attempt.');
            return false;
          }
          console.log(resourceNeeded, 'not found in', multiResource.slice(0));
        }
        console.log(multiResource.slice(0), 'is not useful');
      }
      return true;
    }
  }
  for (var i = 0, multiResource; multiResource = resources[i]; i++) {
    console.log('searching for', needed[0], 'in', multiResource.slice(0));
    var index = multiResource.indexOf(needed[0]);
    if (index != -1) {
      var resourcesRemaining = resources.slice(0);
      resourcesRemaining.splice(i, 1);
      console.log('remaining', resourcesRemaining.slice(0));
      var possibleNeeded = needed.slice(0);
      possibleNeeded.splice(0, 1);
      var possible = canPay(resourcesRemaining, possibleNeeded, purchase);
      if (possible) {
        return true;
      }
    }
  }
  return false;
};

var fulfillWithSimpleResources = function(needed, player) {
  console.log('fulfilling with simple resources', needed.slice(0));
  for (resource in player.resources) {
    resource = parseInt(resource);
    var amount = player.resources[resource];
    for (var j = 0; j < amount; j++) {
      var index = needed.indexOf(resource);
      if (index != -1) {
        console.log(resource, 'found');
        needed.splice(index, 1);
      } else {
        console.log(resource, 'not needed');
        break;
      }
    }
  }
};

var verify = function(player, card, payment) {
  if (card.cost.length == 0) {
    // Must not pay if it is a free building.
    var ok = payment.east.length == 0 && payment.west.length == 0 && payment.bank == 0;
    if (!ok) {
      console.log('ERROR: attempting to pay for a free building');
    }
    return ok;
  }

  for (var i = card.cost.length - 1, cost; cost = card.cost[i]; i--) {
    switch (typeof cost) {
      case 'string':
        // Search for already built card
        if (player.built.filter(function(built) {
          return built.name == cost;
        }).length > 0) {
          // Qualifies for free build. Must not pay.
          var ok = payment.east.length == 0 && payment.west.length == 0 && payment.bank == 0;
          if (!ok) {
            console.log('ERROR: attempting to pay when can be built for free');
          } else {
            console.log('prereq found');
          }
          return ok;
        }
        break;
      case 'object':
        var needed = cost.slice(0);
        console.log('need', needed.slice(0));
        // check for resources
        fulfillWithSimpleResources(needed, player);
        console.log(needed.slice(0), 'left after fulfillment with simple resources');

        // subtract payment
        for (var j = 0; j < payment.east.length; j++) {
          var index = needed.indexOf(payment.east[j]);
          if (index != -1) {
            needed.splice(index, 1);
          } else {
            // overpay
            console.log('ERROR: Overpayment');
            return false;
          }
        }
        console.log(needed.slice(0), 'after buying from east');

        for (var j = 0; j < payment.west.length; j++) {
          var index = needed.indexOf(payment.west[j]);
          if (index != -1) {
            needed.splice(index, 1);
          } else {
            // overpay
            console.log('ERROR: Overpayment');
            return false;
          }
        }

        console.log(needed.slice(0), 'needs to be fulfilled by generators');
        // check for multi resources
        var resourcesToPurchase = payment.east.concat(payment.west);
        if (!canPay(player.multiResources.slice(0), needed.slice(0), resourcesToPurchase.slice(0))) {
          console.log('ERROR: unable to pay for what is needed using multi resource generators');
          return false;
        }

        // check if neighbours have resources
        var eastPayment = payment.east.slice(0);
        fulfillWithSimpleResources(eastPayment, player.east);
        if (!canPay(player.east.multiResources.filter(function(multiResource) {
          return multiResource.length == 2;
        }), eastPayment, [])) {
          console.log('ERROR: Eastern neighbour unable to cater');
          console.log('ERROR: Eastern neighbour unable to cater', eastPayment, player.east);
          return false;
        }

        var westPayment = payment.west.slice(0);
        fulfillWithSimpleResources(westPayment, player.west);
        if (!canPay(player.west.multiResources.filter(function(multiResource) {
          return multiResource.length == 2;
        }), westPayment, [])) {
          console.log('ERROR: Western neighbour unable to cater');
          console.log('ERROR: Western neighbour unable to cater', westPayment, player.west);
          return false;
        }

        // check if enough gold to pay neighbours
        var goldNeeded = 0;
        for (var j = 0, resource; resource = payment.east[j]; j++) {
          goldNeeded += player.tradeCost[resourceType(resource, true)];
        }
        for (var j = 0, resource; resource = payment.west[j]; j++) {
          goldNeeded += player.tradeCost[resourceType(resource, false)];
        }

        // Must not pay bank unnecessarily.
        if (player.gold < goldNeeded) {
          console.log('ERROR: insufficient gold');
          return false;
        } else {
          var ok = payment.bank == 0;
          if (!ok) {
            console.log('ERROR: attempting to pay bank unnecessarily');
          } else {
            console.log('resources ok');
          }
          return ok;
        }

      case 'number':
        // pay bank
        if (player.gold >= cost && payment.bank == cost) {
          console.log('gold ok');
          return true;
        } else if (player.gold < cost) {
          console.log('ERROR: insufficient gold to pay bank');
        } else {
          console.log('ERROR: need to pay the bank the correct amount of gold');
          return false;
        }
    }
  }
  console.log('ERROR: unable to fulfill any form of payment');
  return false;
}

var resourceType = function(resource, east) {
  if (resource == Resource.CLAY || resource == Resource.STONE || resource == Resource.WOOD || resource == Resource.ORE) {
    if (east) {
      return TradeCost.RESOURCE_EAST;
    } else {
      return TradeCost.RESOURCE_WEST;
    }
  } else {
    return TradeCost.GOODS;
  }
};

var payNeighbours = function(player, payment) {
  return function() {
    for (var i = 0, resource; i < payment.east.length; i++) {
      resource = payment.east[i];
      var amount = player.tradeCost[resourceType(resource, true)];
      player.gold -= amount;
      player.east.gold += amount;
    }
    for (var i = 0, resource; i < payment.west.length; i++) {
      resource = payment.west[i];
      var amount = player.tradeCost[resourceType(resource, false)];
      player.gold -= amount;
      player.west.gold += amount;
    }
    player.gold -= payment.bank;
  };
};

var Payment = function(east, west, bank) {
  this.east = [];
  this.west = [];
  this.bank = 0;

  if (east != undefined) {
    this.east = this.east.concat(east);
  }
  if (west != undefined) {
    this.west = this.west.concat(west);
  }
  if (bank != undefined) {
    this.bank += bank;
  }

  this.payEast = function(resource) {
    this.east.push(resource);
  };

  this.payWest = function(resource) {
    this.west.push(resource);
  };

  this.payBank = function(amount) {
    this.bank += amount;
  };
};

var Turn = function(player, game, hands, index, free) {
  this.playerState = player;
  var played = false;
  this.play = function(action, card, payment /* resources to purchase Payment object */) {
    console.log(player, game, hands, index, action, card, payment);

    // Firebase does not store empty arrays
    if (!payment.east) {
      payment.east = [];
    }

    if (!payment.west) {
      payment.west = [];
    }

    if (played) {
      console.log('ERROR: already played this turn. ignoring attempt');
      return false;
    }
    if (hands[index].indexOf(card) == -1) {
      console.log('ERROR: attempting to play card that is not in hand.');
      return false;
    }

    if (action == Action.BUILD) {
      // check duplicates
      for (var i = 0; i < player.built.length; i++) {
        if (player.built[i].name == card.name) {
          console.log('ERROR: attepting to duplicate build');
          return false;
        }
      }

      if (free) {
        player.built.push(card);
      } else if (verify(player, card, payment)) {
        player.built.push(card);
        game.endOfRoundPayments.push(payNeighbours(player, payment));
      } else if (player.canBuildForFree[game.age]) {
        player.built.push(card);
        player.canBuildForFree[game.age] = false;
      } else {
        console.log('ERROR: Incorrect payment, or unable to play for building.');
        return false;
      }
      // reward at end of round
      game.endOfRoundRewards.push(executeReward(card.rewards, player));
    } else if (action == Action.BUILD_WONDER && !free) {
      var stage = getNextStage(player);
      if (!stage) {
        console.log('ERROR: Invalid wonder stage');
        return false;
      }
      if (!verify(player, stage, payment)) {
        console.log('ERROR: Invalid wonder building attempt');
        return false;
      }
      player.built.push(stage);
      player.stagesBuilt.push(card.age);
      // pay neighbours at end of round
      game.endOfRoundPayments.push(payNeighbours(player, payment));
      // reward at end of round
      game.endOfRoundRewards.push(executeReward(stage.rewards, player));
    } else if (action == Action.DISCARD) {
      game.discarded.push(card);
      player.gold += 3;
    } else {
      console.log('ERROR: attempting to build wonder on playDiscarded or attempting to build a duplicate card');
      return false;
    }
    for (var i = 0; i < hands[index].length; i++) {
      if (hands[index][i] == card) {
        hands[index].splice(i, 1);
        break;
      }
    }
    played = true;
    game.playersDone++;

    game.checkEndRound();

    return true;
  };
};
var scienceScore = function(scores) {
  return scores[0] * scores[0] + scores[1] * scores[1] + scores[2] * scores[2] + 7 * Math.min.apply(null, scores);
}
var calcScienceScore = function(player) {
  var academics = player.sciences[Science.ACADEMICS];
  var engineering = player.sciences[Science.ENGINEERING];
  var literature = player.sciences[Science.LITERATURE];
  var scores = [academics, engineering, literature].sort();
  if (player.bonusSciences == 0) {
    return scienceScore(scores);
  } else if (player.bonusSciences == 1) {
    // Add both to highest
    var longChain = scores.slice(0);
    longChain[2]++;
    var longChainScore = scienceScore(longChain);
    // Add both to lowest
    var manySets = scores.slice(0);
    manySets[0]++;
    var manySetsScore = scienceScore(manySets);
    return Math.max(longChainScore, manySetsScore);
  } else if (player.bonusSciences == 2) {
    // Add both to highest
    var longChain = scores.slice(0);
    longChain[2] += 2;
    var longChainScore = scienceScore(longChain);

    // Add one to highest and one to lowest
    var splitStrat = scores.slice(0);
    splitStrat[0]++;
    splitStrat[2]++;
    var splitStratScore = scienceScore(splitStrat);

    // Add one to middle and one to lowest
    var fillSet = scores.slice(0);
    fillSet[0]++;
    fillSet[1]++;
    var fillSetScore = scienceScore(fillSet);

    // Add both to lowest
    var manySets = scores.slice(0);
    manySets[0] += 2;
    var manySetsScore = scienceScore(manySets);

    return Math.max(longChainScore, splitStratScore, fillSetScore, manySetsScore);
  }
};

var GameRoom = function(appContainer, gameField) {
  this.gameField = gameField;
  var gameRoom = self = this;

  ReactDOM.render(
    React.createElement(App),
    appContainer
  );

  this.server = new Firebase(window.FIREBASE_SERVER);

  this.joinGame = function(gameName, playerName) {
    var ref = this.server.child(gameName);
    var id = -1;
    ref.transaction(function(game) {
      var joinedPlayers = game.players;
      // check if player has already joined game
      for (var i = 0; i < game.numPlayers; i++) {
        if (joinedPlayers[i] == playerName) {
          id = i;
          // start game
          return game;
        }
      }

      id = game.playersJoined;
      if (id >= game.numPlayers) {
        // too many players. fail.
        id = -1;
        console.log('Too many players.');
        return game;
      }

      game.playersJoined++;
      game.players.push(playerName);

      return game;
    }, function(error, committed, snapshot) {
      if (!committed) {
        console.log('Error: ' + error);
      } else if (id == -1) {
        console.log('Failed to join game');
      } else {
        var game = snapshot.val();
        var boards = game.boards;
        var hands = game.hands;
        var interfaces = [];
        var turnsRef = self.server.child(gameName).child('turns');
        var playerField = document.createElement('div');
        var playerInterface = new PlayerInterface(playerField, turnsRef, id, game.players[id]);
        var fields = [];
        for (var i = 0; i < game.numPlayers; i++) {
          if (i == id) {
            interfaces.push(playerInterface);
            fields.push(playerField);
          } else {
            var remotePlayerField = document.createElement('div');
            fields.push(remotePlayerField);
            var remotePlayerInterface = new RemotePlayer(remotePlayerField, turnsRef, i, game.players[i]);
            interfaces.push(remotePlayerInterface);
          }
        }

        // Insert fields in an order that put the active player in the center
        var startIndex = id - Math.floor(game.numPlayers / 2);
        for (var i = 0; i < game.numPlayers; i++) {
          self.gameField.appendChild(fields[(i + startIndex + game.numPlayers) % game.numPlayers]);
        }

        self.currGame = new SevenWonders(interfaces, boards, hands);
      }
    });
  };

  this.createGame = function(gameName, numPlayers, name) {
    this.server.child(gameName).transaction(function(current_value) {
      console.log(current_value);
      if (current_value == null) {
        var boards = self.getBoards(numPlayers);
        var hands = self.getHands(numPlayers);
        var interfaces = [];
        var turnsRef = self.server.child(gameName).child('turns');
        var playerField = document.createElement('div');
        self.gameField.appendChild(playerField);
        var playerInterface = new PlayerInterface(playerField, turnsRef, 0, name);
        interfaces.push(playerInterface);
        for (var i = 1; i < numPlayers; i++) {
          var remotePlayerField = document.createElement('div');
          self.gameField.appendChild(remotePlayerField);
          var remotePlayerInterface = new RemotePlayer(remotePlayerField, turnsRef, i, 'Open slot');
          interfaces.push(remotePlayerInterface);
        }
        self.currGame = new SevenWonders(interfaces, boards, hands);
        return {numPlayers: numPlayers, playersJoined: 1, players: [name], boards: boards, hands: hands};
      } else {
        console.log('Game already exists, please pick a new name.');
        return current_value;
      }
    });
  };

  this.getBoards = function(players) {
    var boards = Array.prototype.slice.call(WONDERS);
    var output = [];
    for (var i = 0; i < players; i++) {
      output.push({name: boards.splice(Math.floor(Math.random() * boards.length), 1)[0].name, side: Math.random() < 0.5 ? 'A' : 'B'});
    }
    return output;
  };

  this.getHands = function(players) {
    var decks = [];
    decks[0] = AGE1DECK.filter(function(card) {
      return card.minPlayers <= players;
    });
    decks[1] = AGE2DECK.filter(function(card) {
      return card.minPlayers <= players;
    });
    var guildsToDiscard = 8 - players;
    var guilds = AGE3DECK.filter(function(card) {
      return card.minPlayers == 0;
    });
    for (var i = 0; i < guildsToDiscard; i++) {
      guilds.splice(Math.floor(Math.random() * guilds.length), 1);
    }
    decks[2] = AGE3DECK.filter(function(card) {
      return card.minPlayers <= players && card.minPlayers > 0;
    }).concat(guilds);
    // Deal
    var hands = [];
    for (var i = 0; i < 3; i++) {
      hands[i] = [];
      for (var j = 0; j < players; j++) {
        hand = [];
        for (var k = 0; k < 7; k++) {
          var card = decks[i].splice(Math.floor(Math.random() * decks[i].length), 1)[0];
          hand.push({name: card.name, minPlayers: card.minPlayers, age: card.age});
        }
        hands[i].push(hand);
      }
    }

    return hands;
  };
};

var RemotePlayer = function(field, turnsRef, id, name) {
  this.field = field;
  this.currHand = [];
  this.currTurn = null;
  this.action;
  this.card;
  this.payment;
  this.pendingTurns = [];
  this.name = name;

  this.doneBox = document.createElement('div');
  this.doneBox.style.display = 'block';
  this.doneBox.style.height = '100%';
  this.doneBox.style.width = '100%';
  this.doneBox.style.position = 'absolute';
  this.doneBox.style.left = 0;
  this.doneBox.style.top = 0;
  this.doneBox.innerHTML = 'DONE';
  this.doneBox.style.textAlign = 'center';
  this.doneBox.style.background = 'rgba(128, 255, 128, 0.4)';
  this.doneBox.style.color = 'grey';
  this.doneBox.style.textShadow = '-2px 0 black, 0 2px black, 2px 0 black, 0 -2px black, -1px -1px black, 1px -1px black, -1px 1px black, 1px 1px black';

  var playerInterface = this;

  this.play = function(hand, turn) {
    this.currHand = hand;
    this.currTurn = turn;
    console.log('RemotePlayer drawing');
    this.draw();
    this.process();
  };
  this.endGame = function(turn) {
    this.currHand = [];
    this.currTurn = turn;
    console.log('RemotePlayer end game');
    this.draw();
  }
  this.playBonus = this.play;

  this.process = function() {
    console.log('RemotePlayer processing', this.currTurn, this.pendingTurns);
    if (this.currTurn != null && this.pendingTurns.length > 0) {
      var turn = this.pendingTurns[0];
      console.log('RemotePlayer processing now', turn);
      this.pendingTurns = this.pendingTurns.slice(1);
      console.log('RemotePlayer executing turn', turn.action, getCard(turn.card), turn.payment);
      // If this is the last payer executing play on the turn, the game will proceed to the next round.
      var currTurn = this.currTurn;
      var success = currTurn.play(turn.action, getCard(turn.card), turn.payment);
      console.log('RemotePlayer checking if successful');
      if (success && this.currTurn == currTurn) {
        console.log('RemotePlayer setting turn to null');
        this.currTurn = null;
        this.drawDone();
      } else {
        console.log('RemotePlayer play turn not successful, try next turn.');
        if (this.pendingTurns.length > 0) {
          this.process();
        }
      }
    }
  };

  turnsRef.on('child_added', function(snapshot) {
    var turn = snapshot.val();
    if (turn.id == id) {
      playerInterface.pendingTurns.push(turn);
      playerInterface.process();
    }
  });

  this.draw = function() {
    this.field.innerHTML = '<h3>' + this.name + '</h3>';
    this.field.style.background = 'rgba(0,0,0,0.2)';
    this.field.style.padding = '15px';

    var container = document.createElement('div');
    this.field.appendChild(container);
    ReactDOM.render(
      React.createFactory(PlayerField)({
        battleTokens: this.currTurn.playerState.battleTokens,
        cards: this.currTurn.playerState.built,
        gold: this.currTurn.playerState.gold,
        wonder: {
          built: this.currTurn.playerState.stagesBuilt,
          name: this.currTurn.playerState.board.name,
          side: this.currTurn.playerState.side,
          stageCount: this.currTurn.playerState.board.stages.length
        }
      }),
      container
    );

    this.field.style.marginBottom = '25px';
    this.field.style.border = '1px solid black';
  };

  this.drawDone = function() {
    this.field.style.position = 'relative';
    this.doneBox.style.lineHeight = this.field.offsetHeight + 'px';
    this.doneBox.style.fontSize = this.field.offsetWidth / 10 + 'px';
    this.field.appendChild(this.doneBox);
  };

};

var SevenWonders = function() {

  this.init = function(interfaces, boards, hands) {
    this.numPlayers = interfaces.length;
    this.playerInterfaces = interfaces.slice(0);

    // Set up players
    var len = this.numPlayers;
    if (!boards) {
      boards = Array.prototype.slice.call(WONDERS);
      this.players = this.playerInterfaces.map(function(playerInterface) {
        return new Player(boards.splice(Math.floor(Math.random() * boards.length), 1)[0], Math.random() < 0.5 ? 'A' : 'B', playerInterface);
      });
    } else {
      this.players = [];
      for (var i = 0; i < len; i++) {
        this.players.push(new Player(getBoard(boards[i].name), boards[i].side, this.playerInterfaces[i]));
      }
    }

    // Clockface
    for (var i = 0, player; player = this.players[i]; i++) {
      player.setEasternNeighbour(this.players[(i + len - 1) % len]);
      player.setWesternNeighbour(this.players[(i + len + 1) % len]);
    }

    // Setup cards
    this.discarded = [];
    // this.discardedWrapper = [];
    // this.discardedWrapper.push(this.discarded);

    if (!hands) {
      var decks = [];
      decks[0] = AGE1DECK.filter(function(card) {
        return card.minPlayers <= len;
      });
      decks[1] = AGE2DECK.filter(function(card) {
        return card.minPlayers <= len;
      });
      var guildsToDiscard = 8 - len;
      var guilds = AGE3DECK.filter(function(card) {
        return card.minPlayers == 0;
      });
      for (var i = 0; i < guildsToDiscard; i++) {
        guilds.splice(Math.floor(Math.random() * guilds.length), 1);
      }
      decks[2] = AGE3DECK.filter(function(card) {
        return card.minPlayers <= len && card.minPlayers > 0;
      }).concat(guilds);

      // Deal
      this.hands = [];
      for (var i = 0; i < 3; i++) {
        this.hands[i] = [];
        for (var j = 0; j < len; j++) {
          var hand = [];
          for (var k = 0; k < 7; k++) {
            hand.push(decks[i].splice(Math.floor(Math.random() * decks[i].length), 1)[0]);
          }
          this.hands[i].push(hand);
        }
      }
    } else {
      this.hands = hands.map(function(hand) {
        return hand.map(function(cards) {
          return cards.map(function(card) {
            return getCard(card);
          });
        });
      });
    }

    // Start
    this.age = 0;
    this.round = 0;
    this.playersDone = 0;

    this.endOfRoundRewards = [];
    this.endOfRoundPayments = [];

    this.start();
  };

  this.playRound = function() {
    console.log('playRound');
    console.log(this.hands, this.age, this.numPlayers);
    for (var i = 0; i < this.numPlayers; i++) {
      console.log(Array.prototype.slice.call(this.hands[this.age][i]), new Turn(this.players[i], this, this.hands[this.age], i));
      this.playerInterfaces[i].play(Array.prototype.slice.call(this.hands[this.age][i]), new Turn(this.players[i], this, this.hands[this.age], i));
    }
  };

  this.start = function() {
    this.playRound();
  };

  this.endGame = function() {
    for (var i = 0; i < this.numPlayers; i++) {
      // player end game functions
      for (var j = 0, reward; reward = this.players[i].endGameRewards[j]; j++) {
        reward(this.players[i]);
      }

      // combat
      this.players[i].victoryPoints[Scoring.MILITARY] = this.players[i].battleTokens.reduce(function(a, b) {
        return a + b;
      }, 0);

      // gold
      this.players[i].victoryPoints[Scoring.GOLD] = Math.floor(this.players[i].gold / 3);

      // player sciences and bonus sciences
      this.players[i].victoryPoints[Scoring.SCIENCE] = calcScienceScore(this.players[i]);

      console.log(this.players[i].victoryPoints);

      this.playerInterfaces[i].endGame(new Turn(this.players[i], this, this.hands[this.age], i));
    }

    var score = document.createElement('div');
    score.style.padding = '10px 0 10px 55px';
    var table = document.createElement('table');
    var row = document.createElement('tr');
    var totals = [];
    for (var i = 0; i < this.numPlayers; i++) {
      var cell = document.createElement('td');
      cell.innerHTML = this.playerInterfaces[i].name.substr(0, 2);
      cell.style.maxWidth = '30px';
      cell.style.width = '30px';
      row.appendChild(cell);
      totals[i] = 0;
    }
    table.appendChild(row);
    for (prop in Scoring) {
      var row = document.createElement('tr');
      for (i = 0; i < this.numPlayers; i++) {
        var cell = document.createElement('td');
        var val = this.players[i].victoryPoints[Scoring[prop]];
        cell.innerHTML = val;
        totals[i] += val;
        row.appendChild(cell);
      }
      table.appendChild(row);
    }

    var total = document.createElement('tr');
    for (var i = 0; i < this.numPlayers; i++) {
      var cell = document.createElement('td');
      cell.innerHTML = totals[i];
      total.appendChild(cell);
    }
    table.appendChild(total);
    score.appendChild(table);
    score.style.backgroundImage = 'url(\'' + window.ASSET_URL_PREFIX + 'Assets/Score.jpg\')';
    score.style.backgroundSize = 'contain';
    score.style.backgroundRepeat = 'no-repeat';

    var scoreContainer = document.querySelector("#score");
    scoreContainer.appendChild(score);
  };
  this.doBattle = function() {
    for (var i = 0; i < this.numPlayers; i++) {
      if (this.players[i].military < this.players[i].east.military) {
        this.players[i].battleTokens.push(-1);
      } else if (this.players[i].military > this.players[i].east.military) {
        this.players[i].battleTokens.push(this.age * 2 + 1);
      }
      if (this.players[i].military < this.players[i].west.military) {
        this.players[i].battleTokens.push(-1);
      } else if (this.players[i].military > this.players[i].west.military) {
        this.players[i].battleTokens.push(this.age * 2 + 1);
      }
    }
  };

  this.checkEndRound = function() {
    var len = this.numPlayers;
    // If all players have played, execute rewards
    if (this.playersDone == len) {
      // Payments, must be before rewards to avoid error due to payment discount
      for (var i = 0, payment; payment = this.endOfRoundPayments[i]; i++) {
        console.log('payment', payment);
        payment();
      }
      this.endOfRoundPayments = [];

      // Rewards
      for (var i = 0, reward; reward = this.endOfRoundRewards[i]; i++) {
        console.log('reward', reward);
        reward();
      }
      this.endOfRoundRewards = [];

      // Double build
      if (this.round == 5) {
        for (var i = 0; i < len; i++) {
          console.log('player', i, 'can double build?', this.players[i].canDoubleBuild);
          if (this.players[i].canDoubleBuild && this.hands[this.age][i].length == 1) {
            this.playersDone--;
            this.playerInterfaces[i].playBonus(Array.prototype.slice.call(this.hands[this.age][i]), new Turn(this.players[i], this, this.hands[this.age], i));
            return;
          }
        }
      }

      // Discard cards if last round, so that Halikarnassos can play.
      if (this.round == 5) {
        for (var i = 0; i < len; i++) {
          if (this.hands[this.age][i].length > 0) {
            this.discarded.push(this.hands[this.age][i][0]);
          }
        }
      }
      // Discarded round
      for (var i = 0; i < len; i++) {
        console.log('player', i, 'play discarded now?', this.players[i].playDiscardedNow);
        if (this.players[i].playDiscardedNow) {
          this.players[i].playDiscardedNow = false;
          if (this.discarded.length > 0) {
            this.playersDone--;
            this.playerInterfaces[i].playBonus(Array.prototype.slice.call(this.discarded), new Turn(this.players[i], this, [this.discarded], 0, true));
            return;
          }
        }
      }
      this.playersDone = 0;

      console.log('done with rewards');
      // Print player gold
      for (var i = 0; i < len; i++) {
        console.log('Player', i, 'has', this.players[i].gold, 'gold');
      }

      // check age, rotate hands, go to next round
      this.round++;
      if (this.round == 6) {
        this.round = 0;
        this.doBattle();
        this.age++;
        if (this.age == 3) {
          // end of game
          this.endGame();
          return;
        }
      } else {
        if (this.age % 2 != 0) {
          this.hands[this.age].push(this.hands[this.age].shift());
        } else {
          this.hands[this.age].unshift(this.hands[this.age].pop());
        }
      }
      this.playRound();
    }
  };
  if (arguments.length > 1) {
    this.init.apply(this, arguments);
  }
};

// Basic player interface
var PlayerInterface = function(field, turnsRef, id, name) {
  this.field = field;
  this.currHand = [];
  this.currTurn = null;
  this.playedTurn;
  this.action;
  this.card;
  this.payment;
  this.pendingTurns = [];
  this.loaded = false;
  this.name = name;

  this.doneBox = document.createElement('div');
  this.doneBox.style.display = 'block';
  this.doneBox.style.height = '100%';
  this.doneBox.style.width = '100%';
  this.doneBox.style.position = 'absolute';
  this.doneBox.style.left = 0;
  this.doneBox.style.top = 0;
  this.doneBox.innerHTML = 'WAITING FOR OTHER PLAYERS';
  this.doneBox.style.textAlign = 'center';
  this.doneBox.style.background = 'rgba(255, 196, 0, 0.4)';
  this.doneBox.style.color = 'white';
  this.doneBox.style.textShadow = '-2px 0 black, 0 2px black, 2px 0 black, 0 -2px black, -1px -1px black, 1px -1px black, -1px 1px black, 1px 1px black';

  var playerInterface = this;

  this.notify = function(msg) {
    if (!('Notification' in window)) {
      alert(msg);
    } else if (Notification.permission === 'granted') {
      var notification = new Notification(msg);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {
        if(!('permission' in Notification)) {
          Notification.permission = permission;
        }
        if (permission === 'granted') {
          var notification = new Notification(msg);
        }
      });
    }
  };

  this.play = function(hand, turn) {
    if (this.loaded) {
      this.notify('It is your turn to play in Seven Wonders!');
    }
    this.currHand = hand;
    this.currTurn = turn;
    console.log('PlayerInterface drawing');
    this.draw();
    this.process();
  };

  this.endGame = function(turn) {
    if (this.loaded) {
      this.notify('Game Over!');
    }
    this.currHand = [];
    this.currTurn = turn;
    console.log('PlayerInterface end game');
    this.draw();
  }

  this.playBonus = this.play;

  this.process = function() {
    console.log('PlayerInterface processing', this.currTurn, this.pendingTurns);
    if (this.currTurn != null && this.pendingTurns.length > 0) {
      var turn = this.pendingTurns[0];
      console.log('PlayerInterface processing now', turn);
      this.pendingTurns = this.pendingTurns.slice(1);
      console.log('PlayerInterface executing turn', turn.action, getCard(turn.card), turn.payment);
      // If this is the last payer executing play on the turn, the game will proceed to the next round.
      var currTurn = this.currTurn;
      var success = currTurn.play(turn.action, getCard(turn.card), turn.payment);
      console.log('PlayerInterface checking if successful', success, this.currTurn, currTurn, this.currTurn == currTurn);
      if (success && this.currTurn == currTurn) {
        console.log('PlayerInterface setting turn to null');
        this.currTurn = null;
        this.drawDone();
      } else {
        console.log('New round or PlayerInterface play turn not successful, try next turn.');
        if (this.pendingTurns.length > 0) {
          this.process();
        } else if (!success && this.loaded) {
          alert('You have made a mistake! Try again...');
        }
      }
    }
  };

  turnsRef.on('child_added', function(snapshot) {
    window.setTimeout(function(interface) {
      return function() {
        interface.loaded = true;
      };
    }(playerInterface), 0);
    var turn = snapshot.val();
    if (turn.id == id) {
      playerInterface.pendingTurns.push(turn);
      playerInterface.process();
    }
  })

  this.draw = function() {
    console.log('draw start');
    this.field.innerHTML = '<h3>' + this.name + '</h3>';
    this.field.style.padding = '15px';

    // cards
    var hand = document.createElement('div');
    this.field.appendChild(hand);
    var selectedCardIndex = this.currHand.indexOf(this.card);
    var handFactory = React.createFactory(Hand);
    ReactDOM.render(
      handFactory({
        cards: this.currHand,
        onSelect: function(index) {
          playerInterface.card = playerInterface.currHand[index];
        },
        selected: selectedCardIndex
      }),
      hand
    );

    // payment
    function makeSimple(context, name, text) {
  	  var label = document.createElement('label');
      label.style.display = 'block';

    	var input = document.createElement('input');
    	input.type = 'checkbox'
    	input.name = name;
      input.onclick = function() {
      	if (input.checked) {
        	context.collection[context.index] = text;
        } else {
        	context.collection[context.index] = '';
        }
        context.output.value = context.collection.filter(function(r) {
        	return r != '';
        }).join(' ');
      };

    	var span = document.createElement('span');
    	span.innerHTML = text;

    	label.appendChild(input);
    	label.appendChild(span);

      return label;
    }

    function makeRadio(context, name, text, selected) {
    	var label = document.createElement('label');

    	var input = document.createElement('input');
    	input.type = 'radio'
    	input.name = name;
      input.onclick = function() {
      	context.collection[context.index] = (text == 'NONE') ? '' : text;
        context.output.value = context.collection.filter(function(r) {
        	return r != '';
        }).join(' ');
      };

      if (selected) {
      	input.checked = true;
      }

    	var span = document.createElement('span');
    	span.innerHTML = text;

    	label.appendChild(input);
    	label.appendChild(span);

      return label;
    }

    function makeMulti(context, name, multi) {
    	var group = document.createElement('div');

      var none = makeRadio(context, name, 'NONE', true);
      group.appendChild(none);

      for (var i = 0; i < multi.length; i++) {
      	var resource = makeRadio(context, name, multi[i]);
        group.appendChild(resource);
      }

      return group;
    }

    function makePaymentOptions(className, simple, multi) {
    	var collection = [];
      var container = document.createElement('div');
      var output = document.createElement('input');
      output.disabled = true;
      output.style.width = '100%';
      output.style.display = 'none';
      output.className = className;

      for (var i = 0; i < simple.length; i++) {
      	var label = makeSimple({collection: collection, index: i, output: output}, className.charAt(0) + 'p' + id + 's' + i, simple[i]);
      	container.appendChild(label);
      }

      for (var j = 0; j < multi.length; j++) {
      	var group = makeMulti({collection: collection, index: i + j, output: output}, className.charAt(0) + 'p' + id + 'm' + j, multi[j]);
        container.appendChild(group);
      }

      container.appendChild(output);

      return container;
    }


    var simple = [];
    for (resource in Resource) {
      var amount = this.currTurn.playerState.east.resources[Resource[resource]];
      for (var i = 0; i < amount; i++) {
        simple.push(resource);
      }
    }

    var multi = this.currTurn.playerState.east.multiResources.filter(function(m) {
      return m.length == 2;
    }).map(function (m) {
      return m.map(function (r) {
        for (resource in Resource) {
          if (Resource[resource] == r) {
            return resource;
          }
        }
      });
    });

    var eastPayment = document.createElement('div');
    eastPayment.style.marginTop = '.5em';
    var eastLabel = document.createElement('div');
    eastLabel.innerHTML = 'Resources to purchase from eastern neighbor: ';
    eastPayment.appendChild(eastLabel);
    eastPayment.appendChild(makePaymentOptions('east', simple, multi));
    this.field.appendChild(eastPayment);

    var simple = [];
    for (resource in Resource) {
      var amount = this.currTurn.playerState.west.resources[Resource[resource]];
      for (var i = 0; i < amount; i++) {
        simple.push(resource);
      }
    }

    var multi = this.currTurn.playerState.west.multiResources.filter(function(m) {
      return m.length == 2;
    }).map(function (m) {
      return m.map(function (r) {
        for (resource in Resource) {
          if (Resource[resource] == r) {
            return resource;
          }
        }
      });
    });

    var westPayment = document.createElement('div');
    westPayment.style.marginTop = '.5em';
    var westLabel = document.createElement('div');
    westLabel.innerHTML = 'Resources to purchase from western neighbor: ';
    westPayment.appendChild(westLabel);
    westPayment.appendChild(makePaymentOptions('west', simple, multi));
    this.field.appendChild(westPayment);

    var bankPayment = document.createElement('div');
    bankPayment.style.marginTop = '.5em';
    bankPayment.style.marginBottom = '.5em';
    var payBank = document.createElement('input');
    payBank.type = 'checkbox';
    payBank.className = 'bank';
    var bankLabel = document.createElement('div');
    bankLabel.innerHTML = 'Pay bank';
    bankLabel.style.display = 'inline';
    bankPayment.appendChild(payBank);
    bankPayment.appendChild(bankLabel);
    this.field.appendChild(bankPayment);

    var go = function() {
      var east = playerInterface.field.querySelector('.east').value.split(' ').map(function(resource) {
        return resourceSymbols.indexOf(resource.toLowerCase());
      }).filter(function(resource) {
        return resource >= 0 && resource <= 6;
      });
      var west = playerInterface.field.querySelector('.west').value.split(' ').map(function(resource) {
        return resourceSymbols.indexOf(resource.toLowerCase());
      }).filter(function(resource) {
        return resource >= 0 && resource <= 6;
      });
      var bank = playerInterface.field.querySelector('.bank').checked ? 1 : 0;
      var payment = {east: east, west: west, bank: bank};

      if (turnsRef) {
        turnsRef.push({id: id, action: playerInterface.action, card: {name: playerInterface.card.name, minPlayers: playerInterface.card.minPlayers, age: playerInterface.card.age}, payment: payment});
      } else {
        console.log('WARNING: no turnsRef');
        playerInterface.currTurn.play(playerInterface.action, playerInterface.card, payment);
      }
    };

    var build = document.createElement('button');
    build.style.marginRight = '.5em';
    build.innerHTML = 'Build';
    build.onclick = function() {
      playerInterface.action = Action.BUILD;
      go();
    };
    this.field.appendChild(build);
    var wonder = document.createElement('button');
    wonder.style.marginRight = '.5em';
    wonder.innerHTML = 'Build Wonder';
    wonder.onclick = function() {
      playerInterface.action = Action.BUILD_WONDER;
      go();
    };
    this.field.appendChild(wonder);
    var discard = document.createElement('button');
    discard.innerHTML = 'Discard';
    discard.onclick = function() {
      playerInterface.action = Action.DISCARD;
      go();
    };
    this.field.appendChild(discard);

    var container = document.createElement('div');
    this.field.appendChild(container);
    ReactDOM.render(
      React.createFactory(PlayerField)({
        battleTokens: this.currTurn.playerState.battleTokens,
        cards: this.currTurn.playerState.built,
        gold: this.currTurn.playerState.gold,
        wonder: {
          built: this.currTurn.playerState.stagesBuilt,
          name: this.currTurn.playerState.board.name,
          side: this.currTurn.playerState.side,
          stageCount: this.currTurn.playerState.board.stages.length
        }
      }),
      container
    );

    this.field.style.marginBottom = '25px';
    this.field.style.border = '1px solid black';

    console.log('draw done');
  };

  this.drawDone = function() {
    this.field.style.position = 'relative';
    this.doneBox.style.lineHeight = this.field.offsetHeight + 'px';
    this.doneBox.style.fontSize = this.field.offsetWidth / 20 + 'px';
    this.field.appendChild(this.doneBox);
  };

};

this.GameRoom = GameRoom;
this.SevenWonders = SevenWonders;
this.Action = Action;
this.PlayerInterface = PlayerInterface;
this.Resource = Resource;

}(this));
