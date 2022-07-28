import React, { Component } from 'react';
// TODO: Determine whether prop-types gets into compiled JS and remove it if so.
// See https://facebook.github.io/react/docs/installation.html for info.
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/database';
import GameUI from './GameUI.js';
import { GameVariant } from './misc.js';
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
    firebase.database().ref(`/gamenames/${this.gameName}`).once('value').then((snapshot) => {
      return snapshot.val() || Promise.reject(new Error(`No game named ${this.gameName}`));
    }).then((key) => {
      this.gameKey = key;
      const activeGameRef = firebase.database().ref(`/games/active/${key}`);
      const completedGameRef = firebase.database().ref(`/games/completed/${key}`);
      return Promise.all(
          [activeGameRef.once('value'), completedGameRef.once('value')]).then((snapshots) => {
        return snapshots[0].exists() ? activeGameRef : completedGameRef;
      });
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

      const game = result.snapshot.val();
      const gameDetailsRef = firebase.database().ref(`/gamedetails/${this.gameKey}`);
      this.turnsRef = gameDetailsRef.child('turns');
      return gameDetailsRef.once('value').then((snapshot) => {
        const details = snapshot.val();
        return {
          boards: details.boards,
          hands: details.hands,
          name: game.name,
          playerCount: game.playerCount,
          playerNames: game.players,
          variant: game.variant,
        };
      });
    }).then(this.loadGame).catch((error) => {
      window.console.error(error);
    });
  }

  endGame = (scoreCard) => {
    const activeGameRef = firebase.database().ref(`/games/active/${this.gameKey}`);
    return activeGameRef.once('value').then((snapshot) => {
      if (snapshot.exists()) {
        window.console.warn('moving active game to completed');
        const updates = {};
        updates[`/games/active/${this.gameKey}`] = null;
        const completedGame = snapshot.val();
        completedGame.completedAt = firebase.database.ServerValue.TIMESTAMP;
        updates[`/games/completed/${this.gameKey}`] = completedGame;
        return firebase.database().ref().update(updates);
      }
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
          this.handleDrawRequest, this.turnsRef, i, game.playerNames[i],
          game.playerNames[i] === fakeAuth.name  /* isLocal */);
      interfaces.push(playerInterface);
    }
    // Handle any new game action (e.g. card being built)
    this.turnsRef.on('child_added', function(snapshot) {
      const turn = snapshot.val();
      const interfaceIndex = interfaces.map((i) => i.id).indexOf(turn.id);
      interfaces[interfaceIndex].pendingTurns.push(turn);
      interfaces[interfaceIndex].process();
    });
    const isWreck = game.variant === GameVariant.WRECK || (!game.variant && game.name.indexOf('wreck') === 0);
    const isLeaders = game.variant === GameVariant.LEADERS || (!game.variant && game.name.indexOf('lead') === 0);
    this.currGame = new SevenWonders(
      interfaces, game.boards, game.hands, isWreck, this.endGame, isLeaders);
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
    if (this.turnsRef) {
      this.turnsRef.off();
    }
  }
}

export default Game
