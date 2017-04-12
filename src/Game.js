import React, { Component } from 'react';
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
    this.gameRef = firebase.database().ref(
        `SevenWonders/${this.props.match.params.gameId}`);
    window.gameRef = this.gameRef;
    var id = -1;
    // Get the value once to ensure the value exists locally before attempting
    // to run the transaction code.
    this.gameRef.once('value').then((snapshot) => {
      const game = snapshot.val();
      this.gameRef.transaction(() => {
        if (game == null) {
          alert('Could not find a game with that name.');
          return;
        }
        const joinedPlayers = game.players || [];
        // check if player has already joined game
        for (let i = 0; i < game.numPlayers; i++) {
          if (joinedPlayers[i] === fakeAuth.name) {
            id = i;
            // start game
            return game;
          }
        }

        id = game.playersJoined;
        if (id >= game.numPlayers) {
          id = -1;
          alert('Could not join: Game is full.');
          return;
        }

        game.playersJoined++;
        game.players = game.players || [];
        game.players.push(fakeAuth.name);

        return game;
      }).then((result) => {
        const snapshot = result.snapshot;
        if (id !== -1) {
          const game = snapshot.val();
          const boards = game.boards;
          const hands = game.hands;
          const interfaces = [];
          const playerInterface = new SevenWonders.PlayerInterface(this.handleDrawRequest, this.gameRef, id, game.players[id], true  /* isLocal */);
          for (let i = 0; i < game.numPlayers; i++) {
            if (i === id) {
              interfaces.push(playerInterface);
            } else {
              const remotePlayerInterface = new SevenWonders.PlayerInterface(this.handleDrawRequest, this.gameRef, i, game.players[i]);
              interfaces.push(remotePlayerInterface);
            }
          }

          // Handle any new game action (e.g. card being built)
          this.gameRef.child('turns').on('child_added', function(snapshot) {
            const turn = snapshot.val();
            const interfaceIndex = interfaces.map((i) => i.id).indexOf(turn.id);
            interfaces[interfaceIndex].pendingTurns.push(turn);
            interfaces[interfaceIndex].process();
          });

          this.currGame = new SevenWonders(interfaces, boards, hands, snapshot.key.indexOf('wreck') === 0, this.endGame);
        }
      }).catch((error) => {
        window.console.error(error);
      });
    });
  }

  endGame = (scoreCard) => {
    // TODO: Stop using transaction here.
    this.gameRef.once('value').then((snapshot) => {
      const game = snapshot.val();
      if (game.completed === 'yes') {
        this.setState({
            scoreCard: scoreCard
        });
      } else {
        this.gameRef.transaction(() => {
          if (game.completed === 'yes') {
            return;
          }

          game.completed = "yes";
          return game;
        }).then(() => {
          this.setState({
            scoreCard: scoreCard
          });
        }).catch((error) => {
          window.console.error(error);
        });        
      }
    });
  }

  handleDrawRequest = (data, actions) => {
    this.setState({
      data: data,
      actions: actions
    });
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
        <Link to="/"><button>Quit</button></Link>
        {scoreCard}
        {gameUI}
      </div>
    );
  }

  componentWillUnmount = () => {
    this.gameRef.off();
  }
}

export default Game
