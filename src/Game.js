import React, { Component } from 'react';
// TODO: Determine whether prop-types gets into compiled JS and remove it if so.
// See https://facebook.github.io/react/docs/installation.html for info.
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as firebase from 'firebase';
import GameUI from './GameUI.js';
import ScoreCard from './ScoreCard.js';
import SevenWonders from './SevenWonders.js';
import fakeAuth from './fakeAuth.js';
import './Game.css'

class Game extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    if (!fakeAuth.isAuthenticated) {
      window.console.error('Game attempted to render when not authenticated');
      return;
    }
    this.state = {};
  }

  componentDidMount() {
    this.gameName = this.props.match.params.gameId;
    this.legacyGameRef = firebase.database().ref(
        `/SevenWonders/${this.gameName}`);
    // Get the value once to ensure the value exists locally before attempting
    // to run the transaction code.
    this.legacyGameRef.once('value').then((snapshot) => {
      const legacyGame = snapshot.val();
      return legacyGame || Promise.reject(new Error(`No game named ${this.gameName}`));
    }).then((legacyGame) => {
      if (legacyGame.migrated) {
        const key = legacyGame.migrated;
        const activeGameRef = firebase.database().ref(`/games/active/${key}`);
        const completedGameRef = firebase.database().ref(`/games/completed/${key}`);
        Promise.all(
            [activeGameRef.once('value'), completedGameRef.once('value')]).then((snapshots) => {
          return snapshots[0].exists() ? activeGameRef : completedGameRef;
        }).then((gameRef) => {
          return gameRef.transaction((game) => {
            if (game == null) {
              return null;
            }

            game.players = game.players || [];
            if (game.players.indexOf(fakeAuth.name) > -1) {
              return;
            }
            if (game.players.length >= game.playerCount) {
              return;
            }
            game.players.push(fakeAuth.name);
            return game;
          });
        }).then((result) => {
          if (result.error) {
            return Promise.reject(result.error);
          }
          if (!result.snapshot.exists()) {
            return Promise.reject(new Error('Could not find game'));
          }

          const key = result.snapshot.key;
          const game = result.snapshot.val();
          this.gameDetailsRef = firebase.database().ref(`/gamedetails/${key}`);
          return this.gameDetailsRef.once('value').then((snapshot) => {
            const details = snapshot.val();
            return {
              boards: details.boards,
              hands: details.hands,
              name: game.name,
              playerCount: game.playerCount,
              playerNames: game.players,
              turnsRef: this.gameDetailsRef.child('turns')
            };
          });
        }).then(this.loadGame).catch((error) => {
          window.console.error(error);
        });
      } else {
        this.legacyGameRef.transaction((legacyGame) => {
          if (legacyGame == null) {
            return null;
          }

          legacyGame.players = legacyGame.players || [];
          if (legacyGame.players.indexOf(fakeAuth.name) > -1) {
            return;
          }
          if (legacyGame.playersJoined >= legacyGame.numPlayers) {
            return;
          }
          legacyGame.playersJoined++;
          legacyGame.players.push(fakeAuth.name);
          return legacyGame;
        }).then((result) => {
          if (result.error) {
            return Promise.reject(result.error);
          }
          if (!result.snapshot.exists()) {
            return Promise.reject(new Error('Could not find legacy game'));
          }

          this.legacyGameRef.on('value', (snapshot) => {
            if (snapshot.val().migrated) {
              window.location.reload();
            }
          });
          const legacyGame = result.snapshot.val();
          return {
            boards: legacyGame.boards,
            hands: legacyGame.hands,
            name: result.snapshot.key,
            playerCount: legacyGame.numPlayers,
            playerNames: legacyGame.players,
            turnsRef: this.legacyGameRef.child('turns')
          };
        }).then(this.loadGame).catch((error) => {
          window.console.error(error);
        });
      }
    });
  }

  endGame = (scoreCard) => {
    // TODO: Remove legacy game-related code after data migration.
    this.legacyGameRef.once('value').then((snapshot) => {
      const legacyGame = snapshot.val();
      if (legacyGame.completed !== 'yes') {
        window.console.warn('moving legacy active game to completed');
        return this.legacyGameRef.child('completed').set('yes').then(() => legacyGame);
      } else {
        return legacyGame;
      }
    }).then((legacyGame) => {
      if (!legacyGame.migrated) {
        return;
      }
      const key = legacyGame.migrated;
      const activeGameRef = firebase.database().ref(`/games/active/${key}`);
      return activeGameRef.once('value').then((snapshot) => {
        if (snapshot.exists()) {
          window.console.warn('moving migrated active game to completed');
          const updates = {};
          updates[`/games/active/${key}`] = null;
          const completedGame = snapshot.val();
          completedGame.completedAt = firebase.database.ServerValue.TIMESTAMP;
          updates[`/games/completed/${key}`] = completedGame;
          return firebase.database().ref().update(updates);
        }
      });
    }).then(() => {
      this.setState({
        scoreCard: scoreCard
      });
    }).catch((error) => {
      window.console.error(error);
    });
  }

  handleDrawRequest = (data, actions) => {
    this.setState({
      data: data,
      actions: actions
    });
  }

  loadGame = (game) => {
    const interfaces = [];
    for (let i = 0; i < game.playerCount; i++) {
      const playerInterface = new SevenWonders.PlayerInterface(
          this.handleDrawRequest, game.turnsRef, i, game.playerNames[i],
          game.playerNames[i] === fakeAuth.name  /* isLocal */);
      interfaces.push(playerInterface);
    }
    // Handle any new game action (e.g. card being built)
    game.turnsRef.on('child_added', function(snapshot) {
      const turn = snapshot.val();
      const interfaceIndex = interfaces.map((i) => i.id).indexOf(turn.id);
      interfaces[interfaceIndex].pendingTurns.push(turn);
      interfaces[interfaceIndex].process();
    });
    this.currGame = new SevenWonders(
      interfaces, game.boards, game.hands, game.name.indexOf('wreck') === 0, this.endGame);
  }

  render() {
    const gameUI = this.state.data && this.state.actions ?
        (
          <GameUI data={this.state.data} actions={this.state.actions} />
        )
        : null;
    const scoreCard = this.state.scoreCard ?
        (
          <ScoreCard scores={this.state.scoreCard} />
        )
        : null;
    return (
      <div className="Game">
        <Link to={process.env.PUBLIC_URL + '/'}><button>Quit</button></Link>
        {scoreCard}
        {gameUI}
      </div>
    );
  }

  componentWillUnmount = () => {
    // TODO: Remove after data migration.
    this.legacyGameRef.off();
    this.legacyGameRef.child('turns').off();
    if (this.gameDetailsRef) {
      this.gameDetailsRef.child('turns').off();
    }
  }
}

export default Game
