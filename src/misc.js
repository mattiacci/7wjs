const Resource = {
  CLAY: 0,
  STONE: 1,
  WOOD: 2,
  ORE: 3,
  GLASS: 4,
  CLOTH: 5,
  PAPER: 6
};

const Science = {
  ACADEMICS: 0,   // Sextant
  ENGINEERING: 1, // Gear
  LITERATURE: 2  // Tablet
};

// The number assigned to a type is used for ordering (e.g. when displaying all cards).
const CardType = {
  RESOURCE: 0, // Brown
  GOODS: 1,    // Grey
  COMMERCE: 2, // Yellow
  GUILD: 3,    // Purple
  MILITARY: 4, // Red
  ACADEMICS: 5,  // Green Sextant
  ENGINEERING: 6, // Green Gear
  LITERATURE: 7, // Green Tablet
  VICTORY: 8,  // Blue
  WONDER: 9,
  LEADER: 10  // White
};

const TradeCost = {
  RESOURCE_EAST: 0,
  RESOURCE_WEST: 1,
  GOODS: 2
};

const Scoring = {
  MILITARY: 0,
  GOLD: 1,
  WONDER: 2,
  VICTORY: 3,
  COMMERCE: 4,
  GUILD: 5,
  SCIENCE: 6,
  LEADER: 7
};

var Action = ['BUILD', 'BUILD_WONDER', 'DISCARD', 'UNDO'];
Action.forEach((action, i) => { Action[action] = i; });

const Card = function(name, age, cost, type, rewards, minPlayers, tooltip) {
  this.name = name;
  this.age = age;
  this.cost = cost;
  this.type = type;
  this.rewards = rewards;
  this.minPlayers = minPlayers;
  this.tooltip = tooltip;
};
const Wonder = function(name, resource, stage1A, stage2A, stage3A, stage1B, stage2B, stage3B, stage4B) {
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
const makeLeader = function(name, cost, rewards, tooltip) {
  return new Card(name, 0, [cost], CardType.LEADER, rewards, 0, tooltip);
}

const scienceScore = function(scienceSetBonus, scores) {
  return scores[0] * scores[0] + scores[1] * scores[1] + scores[2] * scores[2] +
      scienceSetBonus * Math.min.apply(null, scores);
}
const calcScienceScore = function(player) {
  var academics = player.sciences[Science.ACADEMICS];
  var engineering = player.sciences[Science.ENGINEERING];
  var literature = player.sciences[Science.LITERATURE];
  var scores = [academics, engineering, literature].sort();
  if (player.bonusSciences === 0) {
    return scienceScore(player.scienceSetBonus, scores);
  } else if (player.bonusSciences === 1) {
    // Add both to highest
    let longChain = scores.slice(0);
    longChain[2]++;
    let longChainScore = scienceScore(player.scienceSetBonus, longChain);
    // Add both to lowest
    let manySets = scores.slice(0);
    manySets[0]++;
    let manySetsScore = scienceScore(player.scienceSetBonus, manySets);
    return Math.max(longChainScore, manySetsScore);
  } else if (player.bonusSciences === 2) {
    // Add both to highest
    let longChain = scores.slice(0);
    longChain[2] += 2;
    let longChainScore = scienceScore(player.scienceSetBonus, longChain);

    // Add one to highest and one to lowest
    let splitStrat = scores.slice(0);
    splitStrat[0]++;
    splitStrat[2]++;
    let splitStratScore = scienceScore(player.scienceSetBonus, splitStrat);

    // Add one to middle and one to lowest
    let fillSet = scores.slice(0);
    fillSet[0]++;
    fillSet[1]++;
    let fillSetScore = scienceScore(player.scienceSetBonus, fillSet);

    // Add both to lowest
    var manySets = scores.slice(0);
    manySets[0] += 2;
    var manySetsScore = scienceScore(player.scienceSetBonus, manySets);

    return Math.max(longChainScore, splitStratScore, fillSetScore, manySetsScore);
  }
};

const scienceReward = function(science) {
  return function(player) {
    player.sciences[science]++;
  };
};

const resourceReward = function(resource, amount) {
  return function(player) {
    player.resources[resource] += amount;
  };
};

const goldReward = function(amount) {
  return function(player) {
    player.gold += amount;
  }
};

const pointsReward = function(points, type) {
  return function(player) {
    player.victoryPoints[type] += points;
  };
};

const multiResourceReward = function() {
  var args = Array.prototype.slice.call(arguments);
  return function(player) {
    player.multiResources.push(args);
  };
};

const militaryReward = function(amount) {
  return function(player) {
    player.military += amount;
  };
};

const tradeCostReward = function(type) {
  return function(player) {
    player.tradeCost[type] = 1;
  };
};

const AGE1DECK = [
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

const countCards = function(player, types) {
  var count = 0;
  for (var i = 0; player.built[i]; i++) {
    if (types.indexOf(player.built[i].type) !== -1) {
      count++;
    }
  }
  return count;
};

const endGameReward = function(pointType, types, self, neighbours, victory) {
  return function(player) {
    var points = 0;
    if (self) {
      points += (countCards(player, types) * victory);
    }
    if (neighbours) {
      points += (countCards(player.east, types) * victory);
      points += (countCards(player.west, types) * victory);
    }
    return {type: pointType, points: points};
  }
};

const complexReward = function(pointType, types, self, neighbours, gold, victory) {
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

const generatorReward = function(resources, goods) {
  return function(player) {
    if (resources) {
      player.multiResources.push([Resource.CLAY, Resource.STONE, Resource.WOOD, Resource.ORE]);
    } else if (goods) {
      player.multiResources.push([Resource.GLASS, Resource.CLOTH, Resource.PAPER]);
    }
  };
};

const AGE2DECK = [
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
const anyScienceReward = function() {
  return function(player) {
    player.bonusSciences++;
  };
};
const strategistReward = function() {
  return function(player) {
    player.endGameRewards.push(function(player) {
      var points = 0;
      points += player.east.battleTokens.filter(function(token) {
        return token === -1;
      }).length;
      points += player.west.battleTokens.filter(function(token) {
        return token === -1;
      }).length;
      return {type: Scoring.GUILD, points: points};
    });
  };
};

const AGE3DECK = [
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
  new Card('Philosophers Guild', 3, [[Resource.CLAY, Resource.CLAY, Resource.CLAY, Resource.PAPER, Resource.CLOTH]], CardType.GUILD, complexReward(Scoring.GUILD, [CardType.ACADEMICS, CardType.ENGINEERING, CardType.LITERATURE], false, true, 0, 1), 0, 'Yields 1 victory point for every green card your neighbours have.'),
  new Card('Scientists Guild', 3, [[Resource.WOOD, Resource.WOOD, Resource.ORE, Resource.ORE, Resource.PAPER]], CardType.GUILD, anyScienceReward(), 0, 'Enhances a science of your choice.'),
  new Card('Shipowners Guild', 3, [[Resource.WOOD, Resource.WOOD, Resource.WOOD, Resource.GLASS, Resource.PAPER]], CardType.GUILD, complexReward(Scoring.GUILD, [CardType.RESOURCE, CardType.GOODS, CardType.GUILD], true, false, 0, 1), 0, 'Yields 1 victory point for every brown, grey or purple card.'),
  new Card('Spies Guild', 3, [[Resource.CLAY, Resource.CLAY, Resource.CLAY, Resource.GLASS]], CardType.GUILD, complexReward(Scoring.GUILD, [CardType.MILITARY], false, true, 0, 1), 0, 'Yields 1 victory point for every red card your neighbours have.'),
  new Card('Strategists Guild', 3, [[Resource.ORE, Resource.ORE, Resource.STONE, Resource.CLOTH]], CardType.GUILD, strategistReward(), 0, 'Yields 1 victory point for every combat loss token your neighbours have.'),
  new Card('Traders Guild', 3, [[Resource.GLASS, Resource.CLOTH, Resource.PAPER]], CardType.GUILD, complexReward(Scoring.GUILD, [CardType.COMMERCE], false, true, 0, 1), 0, 'Yields 1 victory point for every yellow card your neighbours have.'),
  new Card('Workers Guild', 3, [[Resource.ORE, Resource.ORE, Resource.CLAY, Resource.STONE, Resource.WOOD]], CardType.GUILD, complexReward(Scoring.GUILD, [CardType.RESOURCE], false, true, 0, 1), 0, 'Yields 1 victory point for every brown card your neighbours have.'),
  new Card('Architects Guild', 3, [[Resource.ORE, Resource.ORE, Resource.ORE, Resource.CLAY, Resource.PAPER, Resource.CLOTH]], CardType.GUILD, complexReward(Scoring.GUILD, [CardType.GUILD], false, true, 0, 3), 0, 'Yields 3 victory points for every purple card your neighbours have.'),
  // Courtesans Guild. Copy a leader.
  new Card('Diplomats Guild', 3, [[Resource.STONE, Resource.WOOD, Resource.GLASS, Resource.PAPER]], CardType.GUILD, complexReward(Scoring.GUILD, [CardType.LEADER], false, true, 0, 1), 0, 'Yields 1 victory point for every leader your neighbours have.'),
  new Card('Gamers Guild', 3, [[Resource.STONE, Resource.CLAY, Resource.WOOD, Resource.ORE]], CardType.GUILD, (player) => {
    player.endGameRewards.push((player) => {
      return {type: Scoring.GUILD, points: Math.floor(player.gold / 3)};
    });
  }, 0, 'Yields 1 victory point for every 3 gold.'),

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
const doubleBuildReward = function() {
  return function(player) {
    player.canDoubleBuild = true;
  };
};

const multiReward = function(reward1, reward2, reward3) {
  return function(player) {
    console.log('executing multi reward');
    reward1(player);
    reward2(player);
    if (reward3) {
      reward3(player);
    }
  };
};

const discardedReward = function() {
  return function(player) {
    console.log('setting play discarded now for player', player);
    player.playDiscardedNow = true;
  };
};

const freeBuildReward = function() {
  return function(player) {
    player.canBuildForFree = [true, true, true];
  };
};

const PlayerState = function(board, side, playerInterface, isLeadersGame) {
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
  this.scienceSetBonus = 7;
  this.side = side;
  this.stagesBuilt = [];
  this.playerInterface = playerInterface;
  this.gold = isLeadersGame ? 6 : 3;
  this.military = 0;
  this.multiResources = [];
  this.battleTokens = [];
  this.built = [];
  this.leaders = [];
  this.endGameRewards = [];
  this.canDoubleBuild = false;
  this.playDiscardedNow = false;
  this.canBuildForFree = [false, false, false];
  this.victoryPoints = [];
  this.victoryPoints[Scoring.MILITARY] = 0;
  this.victoryPoints[Scoring.GOLD] = 0;
  this.victoryPoints[Scoring.WONDER] = 0;
  this.victoryPoints[Scoring.VICTORY] = 0;
  this.victoryPoints[Scoring.COMMERCE] = 0;
  this.victoryPoints[Scoring.GUILD] = 0;
  this.victoryPoints[Scoring.SCIENCE] = 0;
  this.victoryPoints[Scoring.LEADER] = 0;
  this.currentScore = [];
  this.scoreTotal = 0;

  this.resources[this.board.resource]++;
};

const clonePlayers = function(players) {
  var clonedPlayers = players.map(function(player) {
    var clone = new PlayerState(player.board, player.side, null /* not cloned */);

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

    clone.bonusSciences = player.bonusSciences;
    clone.scienceSetBonus = player.scienceSetBonus;
    clone.stagesBuilt = Array.prototype.slice.call(player.stagesBuilt);
    clone.gold = player.gold;
    clone.military = player.military;
    clone.multiResources = Array.prototype.slice.call(player.multiResources.map(function(resources) {
      return Array.prototype.slice.call(resources);
    }));
    clone.battleTokens = Array.prototype.slice.call(player.battleTokens);
    clone.built = Array.prototype.slice.call(player.built);
    clone.leaders = Array.prototype.slice.call(player.leaders);
    clone.endGameRewards = []; // not cloned
    clone.canDoubleBuild = player.canDoubleBuild; // Babylon B
    clone.playDiscardedNow = player.playDiscardedNow; // Halikarnassos
    clone.canBuildForFree = Array.prototype.slice.call(player.canBuildForFree); // Olympia A
    clone.victoryPoints = Array.prototype.slice.call(player.victoryPoints);
    clone.currentScore = Array.prototype.slice.call(player.currentScore);
    clone.scoreTotal = player.scoreTotal;

    return clone;
  });

  // Clockface
  for (var i = 0; clonedPlayers[i]; i++) {
    var player = clonedPlayers[i];
    player.east = clonedPlayers[(i + clonedPlayers.length - 1) % clonedPlayers.length];
    player.west = clonedPlayers[(i + clonedPlayers.length + 1) % clonedPlayers.length];
  }

  return clonedPlayers;
};

// TODO: Refactor this to be simpler since we can calculate current score now.
const guildCopyReward = function() {
  return function(player) {
    player.endGameRewards.push(function(player) {
      console.log('before', player.victoryPoints);
      var availableGuilds = player.east.built.filter(function(card) {
        return card.type === CardType.GUILD;
      }).concat(player.west.built.filter(function(card) {
        return card.type === CardType.GUILD;
      }));
      console.log('available guilds', availableGuilds);

      if (availableGuilds.length === 0) {
        return {type: Scoring.GUILD, points: 0};
      }

      var baseSciencePoints = calcScienceScore(player);

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
          points += clonedPlayers[1].endGameRewards[0](clonedPlayers[1]).points;
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
      return {type: Scoring.GUILD, points: max - baseSciencePoints};
    });
  };
};

const WONDERS = [
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

const LEADERS = [
  makeLeader('Alexander', 3, (player) => {
    player.endGameRewards.push((player) => {
      return {type: Scoring.LEADER, points: player.battleTokens.filter((t) => t !== -1).length};
    });
  }, 'Yields 1 victory point for every victory token.'),
  makeLeader('Amytis', 4, complexReward(Scoring.LEADER, [CardType.WONDER], true, false, 0, 2), 'Yields 2 victory points for every wonder stage built.'),
  // Archimedes. Green cards cost one less resource.
  makeLeader('Aristotle', 3, (player) => {
    player.scienceSetBonus += 3;
  }, 'Yields 3 victory points for every completed set of Sciences.'),
  // Bilkis. Once per turn, resources may be purchased from the bank for 1 gold.
  makeLeader('Caesar', 5, militaryReward(2), 'Provides 2 units of military strength.'),
  makeLeader('Cleopatra', 4, pointsReward(5, Scoring.LEADER), 'Yields 5 victory points.'),
  makeLeader('Croesus', 1, goldReward(6), 'Produces 6 gold.'),
  // Diocletian. Wat.
  makeLeader('Euclid', 5, scienceReward(Science.ACADEMICS), 'Enchances academics.'),
  // Hammurabi. Blue cards cost one less resource.
  makeLeader('Hannibal', 2, militaryReward(1), 'Provides 1 unit of military strength.'),
  // Hatshepsut. Whenever you pay a neighbor, gain 1 gold.
  makeLeader('Hiram', 3, complexReward(Scoring.LEADER, [CardType.GUILD], true, false, 0, 2), 'Yields 2 victory points for every purple card.'),
  makeLeader('Hypatia', 4, complexReward(Scoring.LEADER, [CardType.ACADEMICS, CardType.ENGINEERING, CardType.LITERATURE], true, false, 0, 1), 'Yields 1 victory point for every green card.'),
  // Imhotep. Wonder stages cost one less resource.
  makeLeader('Justinian', 3, (player) => {
    player.endGameRewards.push((player) => {
      return {type: Scoring.LEADER, points: 3 * Math.min(
        countCards(player, [CardType.MILITARY]),
        countCards(player, [CardType.ACADEMICS, CardType.ENGINEERING, CardType.LITERATURE]),
        countCards(player, [CardType.VICTORY])
      )};
    });
  }, 'Yields 3 victory points for every set of Red, Blue and Green cards.'),
  // Leonidas. Red cards cost one less resource.
  makeLeader('Louis', 4, (player) => {
    player.endGameRewards.push((player) => {
      return {type: Scoring.LEADER, points: 7 - player.battleTokens.filter((t) => t !== -1).length};
    });
  }, 'Yields 7 victory points less 1 point for every victory token.'),
  // Maecenas. White cards are free.
  makeLeader('Midas', 3, (player) => {
    player.endGameRewards.push((player) => {
      return {type: Scoring.LEADER, points: Math.floor(player.gold / 3)};
    });
  }, 'Yields 1 victory point for every 3 gold.'),
  makeLeader('Nebuchadnezzar', 4, complexReward(Scoring.LEADER, [CardType.VICTORY], true, false, 0, 1), 'Yields 1 victory point for every blue card.'),
  makeLeader('Nefertiti', 3, pointsReward(4, Scoring.LEADER), 'Yields 4 victory points.'),
  // Nero. Whenever you gain a victory token, gain 2 gold.
  makeLeader('Pericles', 6, complexReward(Scoring.LEADER, [CardType.MILITARY], true, false, 0, 2), 'Yields 2 victory points for every red card.'),
  makeLeader('Phidias', 3, complexReward(Scoring.LEADER, [CardType.RESOURCE], true, false, 0, 1), 'Yields 1 victory point for every brown card.'),
  makeLeader('Plato', 4, (player) => {
    player.endGameRewards.push((player) => {
      return {type: Scoring.LEADER, points: 7 * Math.min(
        countCards(player, [CardType.RESOURCE]),
        countCards(player, [CardType.GOODS]),
        countCards(player, [CardType.VICTORY]),
        countCards(player, [CardType.COMMERCE]),
        countCards(player, [CardType.ACADEMICS, CardType.ENGINEERING, CardType.LITERATURE]),
        countCards(player, [CardType.MILITARY]),
        countCards(player, [CardType.GUILD])
      )};
    });
  }, 'Yields 7 victory points for every set of all Age cards.'),
  makeLeader('Praxiteles', 3, complexReward(Scoring.LEADER, [CardType.GOODS], true, false, 0, 2), 'Yields 2 victory points for every grey card.'),
  makeLeader('Ptolemy', 5, scienceReward(Science.LITERATURE), 'Enchances literature.'),
  makeLeader('Pythagoras', 5, scienceReward(Science.ENGINEERING), 'Enchances engineering.'),
  // Ramses. Purple cards are free.
  makeLeader('Sappho', 1, pointsReward(2, Scoring.LEADER), 'Yields 2 victory points.'),
  // Semiramis. Wat.
  makeLeader('Solomon', 3, discardedReward(), 'Play a card from the discard pile for free.'),
  // Stevie. When building a wonder stage using Stevie, pay gold equal to the number of resources required instead.
  // Tomyris. Whenever you are to gain a defeat token, your neighbor takes it instead.
  makeLeader('Varro', 3, complexReward(Scoring.LEADER, [CardType.COMMERCE], true, false, 0, 1), 'Yields 1 victory point for every yellow card.'),
  // Vitruvius. Whenever you build an Age card by fulfilling its prerequisites, gain 2 gold.
  // Xenophon. Whenever you build a yellow card, gain 2 gold.
  makeLeader('Zenobia', 2, pointsReward(3, Scoring.LEADER), 'Yields 3 victory points.')
];

export {
  AGE1DECK,
  AGE2DECK,
  AGE3DECK,
  WONDERS,
  LEADERS,
  Action,
  CardType,
  PlayerState,
  Resource,
  Scoring,
  TradeCost,
  calcScienceScore
}
