import {
  AGE1DECK,
  AGE2DECK,
  AGE3DECK,
  WONDERS,
  Action,
  CardType,
  PlayerState,
  Resource,
  Scoring,
  TradeCost,
  calcScienceScore
} from './misc.js';

var getBoard = function(name) {
  for (var i = 0; i < WONDERS.length; i++) {
    if (WONDERS[i].name === name) {
      return WONDERS[i];
    }
  }
};

var getCard = function(details) {
  if (!details) {
    return null;
  }

  var fetched = AGE1DECK.concat(AGE2DECK).concat(AGE3DECK).filter(function(card) {
    var minP = Math.max(3, details.minPlayers);
    var minP2 = Math.max(3, card.minPlayers);
    return card.name === details.name && minP === minP2 && card.age === details.age;
  });

  return fetched[0];
};

var getNextStage = function(player) {
  return player.board.stages.filter(function(candidate) {
    console.log('matching', candidate.name, (player.board.name.charAt(0) + player.side + (player.stagesBuilt.length + 1)));
    return candidate.name === (player.board.name.charAt(0) + player.side + (player.stagesBuilt.length + 1));
  })[0];
};

var executeReward = function(func, player) {
  return function() {
    func(player);
  };
};

const canGenerate = function(resources, needed) {
  if (needed.length === 0) {
    return true;
  }
  for (let i = 0; i < resources.length; i++) {
    const multiResource = resources[i];
    const index = multiResource.indexOf(needed[0]);
    if (index !== -1) {
      const resourcesRemaining = resources.slice(0);
      resourcesRemaining.splice(i, 1);
      const remainingNeeded = needed.slice(0);
      remainingNeeded.splice(0, 1);
      const possible = canGenerate(resourcesRemaining, remainingNeeded);
      if (possible) {
        return true;
      }
    }
  }
  return false;
};

var canPay = function(resources /* unspent multi resources that the player has */, needed /* what is needed for building that does not need to be bought */, purchase /* what the player is trying to buy */) {
  console.log('trying', resources.slice(0), needed.slice(0));
  if (needed.length === 0) {
    // once what is needed has been fulfilled, ensure that things to purchase cannot possibly be fulfilled with unspent resources
    if (purchase.length === 0) {
      console.log('no purchases');
      return true;
    } else {
      console.log('searching for purchases', purchase.slice(0), 'from', resources.slice(0));
      for (let i = 0; i < resources.length; i++) {
        const multiResource = resources[i];
        for (let j = 0, resourceNeeded; j < purchase.length; j++) {
          resourceNeeded = purchase[j];
          if (multiResource.indexOf(resourceNeeded) !== -1) {
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
  for (let i = 0; i < resources.length; i++) {
    const multiResource = resources[i];
    console.log('searching for', needed[0], 'in', multiResource.slice(0));
    var index = multiResource.indexOf(needed[0]);
    if (index !== -1) {
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
  for (let resource in player.resources) {
    resource = parseInt(resource, 10);
    var amount = player.resources[resource];
    for (var j = 0; j < amount; j++) {
      var index = needed.indexOf(resource);
      if (index !== -1) {
        console.log(resource, 'found');
        needed.splice(index, 1);
      } else {
        console.log(resource, 'not needed');
        break;
      }
    }
  }
};

const resourceType = function(resource, east) {
  if (resource === Resource.CLAY || resource === Resource.STONE || resource === Resource.WOOD || resource === Resource.ORE) {
    if (east) {
      return TradeCost.RESOURCE_EAST;
    } else {
      return TradeCost.RESOURCE_WEST;
    }
  } else {
    return TradeCost.GOODS;
  }
};

const canPlay = function(player, card, free) {
  // check duplicates
  if (player.built.some(function(built) {
    return built.name === card.name;
  })) {
    return false;
  }

  if (free || card.cost.length === 0) {
    return true;
  }

  for (var i = card.cost.length - 1; i > -1; i--) {
    const cost = card.cost[i];
    switch (typeof cost) {
      case 'string':
        // Search for already built card
        if (player.built.some(function(built) {
          return built.name === cost;
        })) {
          return true;
        }
        break;
      case 'number':
        if (player.gold >= cost) {
          return true;
        }
        break;
      case 'object':
        var needed = cost.slice(0);
        fulfillWithSimpleResources(needed, player);
        if (needed.length === 0) {
          // fulfilled by simple resources
          return true;
        }

        if (canGenerate(player.multiResources.slice(0), needed)) {
          // fulfilled by generators
          return true;
        }

        var resources = [[], [], []];
        for (let resource in player.east.resources) {
          resource = parseInt(resource, 10);
          var amount = player.east.resources[resource];
          if (amount === 0) {
            continue;
          }
          var costOfResource = player.tradeCost[resourceType(resource, true)];
          for (var j = 0; j < amount; j++) {
            resources[costOfResource].push(resource);
          }
        }
        for (let resource in player.west.resources) {
          resource = parseInt(resource, 10);
          var amount = player.west.resources[resource];
          if (amount === 0) {
            continue;
          }
          var costOfResource = player.tradeCost[resourceType(resource, false)];
          for (var j = 0; j < amount; j++) {
            resources[costOfResource].push(resource);
          }
        }

        var generators = [player.multiResources.slice(0), [], []];
        for (var j = 0; j < player.east.multiResources.length; j++) {
          if (player.east.multiResources[j].length > 2) {
            // Generators that produces more than 2 resources are not tradable.
            continue;
          }
          var costOfResource = player.tradeCost[resourceType(player.east.multiResources[j][0], true)];
          generators[costOfResource].push(player.east.multiResources[j].slice(0));
        }
        for (var j = 0; j < player.west.multiResources.length; j++) {
          if (player.west.multiResources[j].length > 2) {
            // Generators that produces more than 2 resources are not tradable.
            continue;
          }
          var costOfResource = player.tradeCost[resourceType(player.west.multiResources[j][0], false)];
          generators[costOfResource].push(player.west.multiResources[j].slice(0));
        }

        if (canGenerateOrPay(needed.slice(0), player.gold, resources, generators)) {
          return true;
        }
        break;
      default:
        window.console.error('cost is unsupported type: ' + (typeof cost));
        break;
    }
  }
  return false;
};

const validPlays = function(player, game, hand, free) {
  var plays = [];

  // Check if player can build wonder
  var stage = getNextStage(player);
  if (!!stage && !free && canPlay(player, stage, false)) {
    plays.push(stage);
  }

  // Check if player can play any card in hand
  for (var i = 0; i < hand.length; i++) {
    if (canPlay(player, hand[i], free || player.canBuildForFree[game.age])) {
      plays.push(hand[i]);
    }
  }

  return plays;
};

const noValidPlays = function(player, game, hand, free) {
  return  validPlays(player, game, hand, free).length === 0;
};

var isFree = function(player, card, free) {
  // check duplicates
  if (player.built.some(function(built) {
    return built.name === card.name;
  })) {
    return false;
  }

  if (free || card.cost.length === 0) {
    return true;
  }

  for (var i = card.cost.length - 1, cost; cost = card.cost[i]; i--) {
    switch (typeof cost) {
      case 'string':
        // Search for already built card
        if (player.built.some(function(built) {
          return built.name === cost;
        })) {
          return true;
        }
        break;
      case 'object':
        var needed = cost.slice(0);
        fulfillWithSimpleResources(needed, player);
        if (needed.length === 0) {
          // fulfilled by simple resources
          return true;
        }

        if (canGenerate(player.multiResources.slice(0), needed)) {
          // fulfilled by generators
          return true;
        }
     }
  }
  return false;
}

var canGenerateOrPay = function(needed, gold, resourceList, generatorList) {
  if (needed.length === 0) {
    return true;
  }
  for (var i = 0; i < 3 && i <= gold; i++) {
    var index = resourceList[i].indexOf(needed[0]);
    if (index !== -1) {
      var newResourceList = resourceList.map(function(resources) {
        return resources.slice(0);
      });
      var newGeneratorList = generatorList.map(function(generators) {
        return generators.map(function(generator) {
          return generator.slice(0);
        });
      });

      newResourceList[i].splice(index, 1);
      var remainingNeeded = needed.slice(0);
      remainingNeeded.splice(0, 1);
      var possible = canGenerateOrPay(remainingNeeded, gold - i, newResourceList, newGeneratorList);
      if (possible) {
        return true;
      }
    }

    // Try generators
    var generators = generatorList[i];
    for (var j = 0; j < generators.length; j++) {
      var index = generators[j].indexOf(needed[0]);
      if (index !== -1) {
        var newResourceList = resourceList.map(function(resources) {
          return resources.slice(0);
        });
        var newGeneratorList = generatorList.map(function(generators) {
          return generators.map(function(generator) {
            return generator.slice(0);
          });
        });

        newGeneratorList[i].splice(j, 1);
        var remainingNeeded = needed.slice(0);
        remainingNeeded.splice(0, 1);
        var possible = canGenerateOrPay(remainingNeeded, gold - i, newResourceList, newGeneratorList);
        if (possible) {
          return true;
        }
      }
    }
  }
  return false;
};

var verify = function(player, card, payment) {
  if (card.cost.length === 0) {
    // Must not pay if it is a free building.
    var ok = payment.east.length === 0 && payment.west.length === 0 && payment.bank === 0;
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
          return built.name === cost;
        }).length > 0) {
          // Qualifies for free build. Must not pay.
          var ok = payment.east.length === 0 && payment.west.length === 0 && payment.bank === 0;
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
          if (index !== -1) {
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
          if (index !== -1) {
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
          return multiResource.length === 2;
        }), eastPayment, [])) {
          console.log('ERROR: Eastern neighbour unable to cater');
          console.log('ERROR: Eastern neighbour unable to cater', eastPayment, player.east);
          return false;
        }

        var westPayment = payment.west.slice(0);
        fulfillWithSimpleResources(westPayment, player.west);
        if (!canPay(player.west.multiResources.filter(function(multiResource) {
          return multiResource.length === 2;
        }), westPayment, [])) {
          console.log('ERROR: Western neighbour unable to cater');
          console.log('ERROR: Western neighbour unable to cater', westPayment, player.west);
          return false;
        }

        // check if enough gold to pay neighbours
        var goldNeeded = 0;
        for (var j = 0; j < payment.east.length; j++) {
          goldNeeded += player.tradeCost[resourceType(payment.east[j], true)];
        }
        for (var j = 0; j < payment.west.length; j++) {
          goldNeeded += player.tradeCost[resourceType(payment.west[j], false)];
        }

        // Must not pay bank unnecessarily.
        if (player.gold < goldNeeded) {
          console.log('ERROR: insufficient gold');
          return false;
        } else {
          var ok = payment.bank === 0;
          if (!ok) {
            console.log('ERROR: attempting to pay bank unnecessarily');
          } else {
            console.log('resources ok');
          }
          return ok;
        }

      case 'number':
        if (payment.east.length !== 0 || payment.west.length !== 0) {
          console.log('ERROR: attempting to pay neighbors unnecessarily');
          return false;
        } else if (player.gold >= cost && payment.bank === cost) {
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

  if (east !== undefined) {
    this.east = this.east.concat(east);
  }
  if (west !== undefined) {
    this.west = this.west.concat(west);
  }
  if (bank !== undefined) {
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
  this.game = game;
  this.free = free;
  this.age = game.age;
  this.played = false;
  this.undoStack = [];
  var self = this;
  this.undo = function() {
    while(this.undoStack.length > 0) {
      this.undoStack.pop()();
    }
    window.setTimeout(game.resume.bind(game), 0);
  }
  this.play = function(action, card, payment /* resources to purchase Payment object */) {
    console.log(player, game, hands, index, action, card, payment);

    if (action === Action.UNDO) {
      if (this.played) {
        this.undo();
        return true;
      } else {
        console.log('ERROR: attempting to undo without first taking an action');
        return false;
      }
    }

    // Firebase does not store empty arrays
    if (!payment.east) {
      payment.east = [];
    }

    if (!payment.west) {
      payment.west = [];
    }

    if (this.played) {
      console.log('ERROR: already played this turn. ignoring attempt');
      return false;
    }
    if (hands[index].indexOf(card) === -1) {
      console.log('ERROR: attempting to play card that is not in hand.');
      return false;
    }

    if (action === Action.BUILD) {
      // check duplicates
      for (var i = 0; i < player.built.length; i++) {
        if (player.built[i].name === card.name) {
          console.log('ERROR: attepting to duplicate build');
          return false;
        }
      }

      if (free) {
        player.built.push(card);
        this.undoStack.push(function() {
          player.built.pop();
        });
      } else if (verify(player, card, payment)) {
        player.built.push(card);
        var payNeighboursFn = payNeighbours(player, payment);
        game.endOfRoundPayments.push(payNeighboursFn);
        this.undoStack.push(function() {
          var i = game.endOfRoundPayments.indexOf(payNeighboursFn);
          game.endOfRoundPayments.splice(i, 1);
          player.built.pop();
        });
      } else if (player.canBuildForFree[game.age] && payment.east.length === 0 && payment.west.length === 0 && payment.bank === 0) {
        player.built.push(card);
        player.canBuildForFree[game.age] = false;
        this.undoStack.push(function() {
          player.canBuildForFree[game.age] = true;
          player.built.pop();
        });
      } else {
        console.log('ERROR: Incorrect payment, or unable to play for building.');
        return false;
      }
      // reward at end of round
      var executeRewardsFn = executeReward(card.rewards, player);
      game.endOfRoundRewards.push(executeRewardsFn);
      this.undoStack.push(function() {
        var i = game.endOfRoundRewards.indexOf(executeRewardsFn);
        game.endOfRoundRewards.splice(i, 1);
      });
    } else if (action === Action.BUILD_WONDER && !free) {
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
      player.stagesBuilt.push(card);
      // pay neighbours at end of round
      var payNeighboursFn = payNeighbours(player, payment);
      game.endOfRoundPayments.push(payNeighboursFn);
      // reward at end of round
      var executeRewardsFn = executeReward(stage.rewards, player)
      game.endOfRoundRewards.push(executeRewardsFn);
      this.undoStack.push(function() {
        var i = game.endOfRoundRewards.indexOf(executeRewardsFn);
        game.endOfRoundRewards.splice(i, 1);
        i = game.endOfRoundPayments.indexOf(payNeighboursFn);
        game.endOfRoundPayments.splice(i, 1);
        player.stagesBuilt.pop();
        player.built.pop();
      });
    } else if (action === Action.DISCARD) {
      if (game.wreckANation) {
        if (noValidPlays(player, game, hands[index], free)) {
          console.log('Discard ok. No valid plays.', player, hands[index]);
        } else {
          console.log('ERROR: For wreck-a-nation variant games, discarding is only allowed when there are no other valid plays.');
          return false;
        }
      }
      game.discarded.push(card);
      player.gold += 3;
      this.undoStack.push(function() {
        var i = game.discarded.indexOf(card);
        player.gold -= 3;
        game.discarded.splice(i, 1);
      });
    } else {
      console.log('ERROR: attempting to build wonder on playDiscarded or attempting to build a duplicate card or attempting to undo before playing');
      return false;
    }
    for (var i = 0; i < hands[index].length; i++) {
      if (hands[index][i] === card) {
        hands[index].splice(i, 1);
        this.undoStack.push(function() {
          hands[index].splice(i, 0, card)
        });
        break;
      }
    }
    this.played = true;
    game.playersDone++;
    this.undoStack.push(function() {
      game.playersDone--;
      self.played = false;
    });

    game.checkEndRound();

    return true;
  };
};

var SevenWonders = function() {
  this.resume = function() {
    for (var i = 0; i < this.numPlayers; i++) {
      this.playerInterfaces[i].process();
    }
  };

  this.init = function(interfaces, boards, hands, wreck, endGame) {
    this.numPlayers = interfaces.length;
    this.playerInterfaces = interfaces.slice(0);
    this.wreckANation = !!wreck;
    this.endGameCallback = endGame;

    // Set up players
    var len = this.numPlayers;
    if (!boards) {
      boards = Array.prototype.slice.call(WONDERS);
      var side = Math.random() < 0.5 ? 'A' : 'B';
      this.players = this.playerInterfaces.map(function(playerInterface) {
        return new PlayerState(boards.splice(Math.floor(Math.random() * boards.length), 1)[0], side, playerInterface);
      });
    } else {
      this.players = [];
      for (var i = 0; i < len; i++) {
        this.players.push(new PlayerState(getBoard(boards[i].name), boards[i].side, this.playerInterfaces[i]));
      }
    }

    // Clockface
    for (var i = 0, player; player = this.players[i]; i++) {
      player.east = this.players[(i + len - 1) % len];
      player.west = this.players[(i + len + 1) % len];
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
        return card.minPlayers === 0;
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

  /**
   * Returns a serializable copy of the game state, containing only what's
   * visible to the given player.
  */
  this.getKnownGameStateForPlayer = function(playerState) {
    const state = JSON.parse(JSON.stringify(this.cachedPublicGameState));

    const hand = JSON.parse(JSON.stringify(playerState.playerInterface.currHand));
    const turn = playerState.playerInterface.currTurn;
    // Add data to cards in hand.
    hand.forEach(function(card) {
      card.unplayable = !canPlay(
          playerState,
          card,
          turn.free || playerState.canBuildForFree[turn.age]);
      card.free = isFree(
          playerState,
          card,
          turn.free || playerState.canBuildForFree[turn.age]);
    });

    // Update waiting state of players.
    for (let i = 0; i < state.players.length; i++) {
      state.players[i].waiting = this.playerInterfaces[i].currTurnEnded;
    }
    // Rearrange players so given player comes first.
    const rearrangedPlayers = [];
    for (let i = playerState.playerInterface.id; i < state.players.length; i++) {
      rearrangedPlayers.push(state.players[i]);
    }
    for (let i = 0; i < playerState.playerInterface.id; i++) {
      rearrangedPlayers.push(state.players[i]); 
    }

    // Update state object with current data.
    state.players = rearrangedPlayers;
    state.players[0].built = JSON.parse(JSON.stringify(playerState.built));
    state.players[0].cardsInHand = hand;
    state.players[0].wonder.built =
        JSON.parse(JSON.stringify(playerState.stagesBuilt));
    return state;
  };

  this.cachePublicGameState = function() {
    const players = this.players.map(function(playerState) {
      return {
        battleTokens: playerState.battleTokens,
        built: playerState.built,
        gold: playerState.gold,
        id: playerState.playerInterface.id,
        name: playerState.playerInterface.name,
        // TODO: Remove this, as presence of cards-in-hand or actions is enough.
        playable: playerState.playerInterface.isLocal,
        resources: {
          east: {
            single: playerState.east.resources,
            multi: playerState.east.multiResources
          },
          single: playerState.resources,
          multi: playerState.multiResources,
          west: {
            single: playerState.west.resources,
            multi: playerState.west.multiResources
          }
        },
        score: playerState.scoreTotal,
        waiting: playerState.playerInterface.currTurnEnded,
        wonder: {
          isLast: playerState.built.length > 0 &&
              playerState.built[playerState.built.length - 1].type === CardType.WONDER,
          built: playerState.stagesBuilt.map(function(card) { return card.age; }),
          name: playerState.board.name,
          side: playerState.side,
          stageCount: playerState.board.stages.length
        }
      };
    });
    this.cachedPublicGameState = JSON.parse(JSON.stringify({
      game: {
        age: this.age
      },
      players: players
    }));
    return this.cachedPublicGameState;
  };

  this.playRound = function() {
    console.log('playRound');
    console.log(this.hands, this.age, this.numPlayers);
    this.updateCurrentScores();
    for (var i = 0; i < this.numPlayers; i++) {
      console.log(Array.prototype.slice.call(this.hands[this.age][i]), new Turn(this.players[i], this, this.hands[this.age], i));
      this.playerInterfaces[i].update(Array.prototype.slice.call(this.hands[this.age][i]), new Turn(this.players[i], this, this.hands[this.age], i));
    }
    this.cachePublicGameState();
    for (var i = 0; i < this.numPlayers; i++) {
      this.playerInterfaces[i].play();
    }
  };

  this.start = function() {
    this.playRound();
  };

  this.updateCurrentScores = function() {
    for (var i = 0; i < this.numPlayers; i++) {
      this.players[i].currentScore = this.players[i].victoryPoints.slice(0);
      for (var j = 0, reward; reward = this.players[i].endGameRewards[j]; j++) {
        var score = reward(this.players[i]);
        this.players[i].currentScore[score.type] += score.points;
      }

      // combat
      this.players[i].currentScore[Scoring.MILITARY] = this.players[i].battleTokens.reduce(function(a, b) {
        return a + b;
      }, 0);

      // gold
      this.players[i].currentScore[Scoring.GOLD] = Math.floor(this.players[i].gold / 3);

      // player sciences and bonus sciences
      this.players[i].currentScore[Scoring.SCIENCE] = calcScienceScore(this.players[i]);

      var total = 0;
      for (let prop in Scoring) {
        total += this.players[i].currentScore[Scoring[prop]];
      }
      this.players[i].scoreTotal = total;
    }
  }

  this.endGame = function() {
    this.updateCurrentScores();
    for (let i = 0; i < this.numPlayers; i++) {
      this.players[i].victoryPoints = this.players[i].currentScore.slice(0);
      console.log(this.players[i].victoryPoints);
    }
    this.cachePublicGameState();
    for (let i = 0; i < this.numPlayers; i++) {
      this.playerInterfaces[i].endGame(new Turn(this.players[i], this, this.hands[this.age], i));
    }
    const scoreCard = [];
    for (let i = 0; i < this.players.length; i++) {
      scoreCard.push({
        name: this.playerInterfaces[i].name,
        details: this.players[i].victoryPoints,
        total: this.players[i].scoreTotal
      });
    }
    this.endGameCallback(scoreCard);
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
    if (this.playersDone === len) {
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
      if (this.round === 5) {
        for (var i = 0; i < len; i++) {
          console.log('player', i, 'can double build?', this.players[i].canDoubleBuild);
          if (this.players[i].canDoubleBuild && this.hands[this.age][i].length === 1) {
            this.playersDone--;
            for (var j = 0; j < len; j++) {
              this.playerInterfaces[j].allowUndo = false;
              this.playerInterfaces[j].draw();
            }
            this.playerInterfaces[i].update(Array.prototype.slice.call(this.hands[this.age][i]), new Turn(this.players[i], this, this.hands[this.age], i));
            this.playerInterfaces[i].play();
            return;
          }
        }
      }

      // Discard cards if last round, so that Halikarnassos can play.
      if (this.round === 5) {
        for (var i = 0; i < len; i++) {
          if (this.hands[this.age][i].length > 0) {
            this.discarded.push(this.hands[this.age][i][0]);
            // Probably not necessary.
            this.playerInterfaces[i].draw();
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
            for (var j = 0; j < len; j++) {
              this.playerInterfaces[j].allowUndo = false;
              this.playerInterfaces[j].draw();
            }
            this.playerInterfaces[i].update(Array.prototype.slice.call(this.discarded), new Turn(this.players[i], this, [this.discarded], 0, true));
            this.playerInterfaces[i].play();
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
      if (this.round === 6) {
        this.round = 0;
        this.doBattle();
        this.age++;
        if (this.age === 3) {
          // end of game
          this.endGame();
          return;
        }
      } else {
        if (this.age % 2 !== 0) {
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

var PlayerInterface = function(requestDraw, gameState, id, name, isLocal) {
  if (!requestDraw || !gameState || id === null) {
    console.error('PlayerInterface missing required data');
    return;
  }
  this.id = id;
  this.isLocal = isLocal;
  this.requestDraw = requestDraw;
  this.allowUndo = false;
  this.currHand = [];
  this.currTurn = null;
  this.currTurnEnded = true;
  this.playedTurn;
  this.action;
  this.payment;
  this.pendingTurns = [];
  this.loaded = false;
  this.name = name;
  this.overlay = document.createElement('div');
  var playerInterface = this;

  window.setTimeout(function(ui) {
    return function() {
      ui.loaded = true;
    };
  }(playerInterface), 2000);

  this.process = function() {
    console.log(this.name, 'processing', this.currTurn, this.pendingTurns);
    var turn;
    var isUndo = false;
    if (this.pendingTurns.length > 0) {
      turn = this.pendingTurns[0];
      isUndo = turn.action === Action.UNDO;
    }
    if ((!this.currTurnEnded || isUndo) && this.pendingTurns.length > 0) {
      console.log(this.name, 'processing now', turn);
      this.pendingTurns = this.pendingTurns.slice(1);
      console.log(this.name, 'executing turn', turn.action, getCard(turn.card), turn.payment);
      // If this is the last payer executing play on the turn, the game will proceed to the next round.
      var currTurn = this.currTurn;
      var success = currTurn.play(turn.action, getCard(turn.card), turn.payment);
      console.log(this.name, 'checking if successful', success, this.currTurn, currTurn, this.currTurn === currTurn);
      if (success && this.currTurn === currTurn) {
        console.log(this.name, 'turn successful');
        if (isUndo) {
          this.currTurnEnded = false;
          this.currTurn.game.playerInterfaces.forEach(function(player) {
            if (player.currTurn) {
              player.draw.call(player);
            }
          });
        } else {
          this.currTurnEnded = true;
          this.currTurn.game.playerInterfaces.forEach(function(player) {
            if (player.currTurn) {
              player.draw.call(player);
            }
          });
        }
      } else {
        console.log('New round or PlayerInterface play turn not successful, try next turn.');
        if (!success && this.loaded && this.isLocal) {
          alert('You have made a mistake! Try again...');
        }
      }
      if (this.pendingTurns.length > 0) {
        this.process();
      }
    }
  };

  this.draw = function() {
    if (!this.isLocal) {
      return;
    }

    console.log(this.name, 'draw start');

    const data = this.currTurn.game.getKnownGameStateForPlayer(
        this.currTurn.playerState);
    const actions = this.getActions();

    this.requestDraw(data, actions);

    console.log(this.name, 'draw done');
  };

  /**
   * Returns an object with functions representing the various actions that can
   * be taken in game.
   */
  this.getActions = function() {
    if (this.currTurnEnded && this.allowUndo) {
      return {
        undo: (function() {
          gameState.child('turns').push({id: this.id, action: Action.UNDO});
        }).bind(this)
      };
    } else if (!this.currTurnEnded) {
      const act = (function(data, action) {
        data = JSON.parse(JSON.stringify(data));
        Object.assign(data, {
          id: this.id,
          action: action
        });
        gameState.child('turns').push(data);
      }).bind(this);
      return {
        build: function(data) {
          act(data, 0);
        },
        buildWonder: function(data) {
          act(data, 1);
        },
        discard: function(data) {
          act(data, 2);
        }
      };
    } else {
      return {};
    }
  };

  this.endGame = function(turn) {
    if (this.loaded) {
      this.notify('Game Over!');
    }
    this.currHand = [];
    this.currTurn = turn;
    console.log(this.name, 'end game');
    this.draw();
  }

  this.notify = function(msg) {
    if (!this.isLocal) {
      return;
    }
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

  this.play = function() {
    console.log(this.name, 'drawing');
    this.draw();
    this.process();
  };

  this.update = function(hand, turn) {
    if (this.loaded) {
      this.notify('It is your turn to play in Seven Wonders!');
    }
    this.allowUndo = true;
    this.currHand = hand;
    this.currTurn = turn;
    this.currTurnEnded = false;
  };

};

SevenWonders.PlayerInterface = PlayerInterface;
window.SevenWonders = SevenWonders;
export default SevenWonders;
