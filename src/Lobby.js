import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as firebase from 'firebase';
import { Link, withRouter } from 'react-router-dom';
import { AGE1DECK, AGE2DECK, AGE3DECK, WONDERS } from './misc.js';
import './Lobby.css';

function shuffleWonders(players) {
  const side = Math.random() < 0.5 ? 'A' : 'B';
  const boards = Array.prototype.slice.call(WONDERS);
  const output = [];
  for (var i = 0; i < players; i++) {
    output.push({
      name: boards.splice(Math.floor(Math.random() * boards.length), 1)[0].name,
      side: side
    });
  }
  return output;
}

function shuffleCards(players) {
  const decks = [];
  decks[0] = AGE1DECK.filter(function(card) {
    return card.minPlayers <= players;
  });
  decks[1] = AGE2DECK.filter(function(card) {
    return card.minPlayers <= players;
  });
  const guildsToDiscard = 8 - players;
  const guilds = AGE3DECK.filter(function(card) {
    return card.minPlayers === 0;
  });
  for (var i = 0; i < guildsToDiscard; i++) {
    guilds.splice(Math.floor(Math.random() * guilds.length), 1);
  }
  decks[2] = AGE3DECK.filter(function(card) {
    return card.minPlayers <= players && card.minPlayers > 0;
  }).concat(guilds);
  // Deal
  const hands = [];
  for (let i = 0; i < 3; i++) {
    hands[i] = [];
    for (let j = 0; j < players; j++) {
      const hand = [];
      for (let k = 0; k < 7; k++) {
        const card = decks[i].splice(Math.floor(Math.random() * decks[i].length), 1)[0];
        hand.push({name: card.name, minPlayers: card.minPlayers, age: card.age});
      }
      hands[i].push(hand);
    }
  }

  return hands;
}

const Lobby = withRouter(class extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      games: {},
      showCompleted: false
    };
    this.rootRef = firebase.database().ref('SevenWonders');
    this.rootRef.on('child_added', (snapshot) => {
      this.state.games[snapshot.key] = snapshot.val();
      this.setState({ games: this.state.games });
    });
    this.rootRef.on('child_changed', (snapshot) => {
      this.state.games[snapshot.key] = snapshot.val();
      this.setState({ games: this.state.games });
    });
  }

  createGame = (e) => {
    e.preventDefault();
    const elements = e.target.elements;
    const gameName = elements['game'].value.trim().replace(/[^\w- ]/g, '');
    const numPlayers = parseInt(elements['players'].value, 10);
    if (!gameName || gameName.length > 24 || !isFinite(numPlayers) ||
        numPlayers < 2 || numPlayers > 7) {
      alert('Enter a short name, with 2-7 players.');
      return;
    }

    this.rootRef.child(gameName).transaction((game) => {
      if (game == null) {
        game = {
          numPlayers: numPlayers,
          playersJoined: 0,
          players: [],
          boards: shuffleWonders(numPlayers),
          hands: shuffleCards(numPlayers),
          completed: 'no'
        };
      } else {
        game = undefined;
        alert('Game already exists, please pick a new name.');
      }
      return game;
    }).then((result) => {
      if (result.committed) {
        this.props.history.push(`/game/${result.snapshot.key}`);
      }
    });
  }

  toggleShowCompleted = (e) => {
    this.setState({ showCompleted: e.target.checked });
  }

  render() {
    const games = Object.keys(this.state.games).map(function(gameName) {
      const game = this.state.games[gameName];
      game.players = game.players || [];
      // TODO: Fix data.
      const completed = game.completed === 'yes' || game.completed == null;
      if (completed && !this.state.showCompleted) {
        return null;
      } else {
        return (
          <tr key={gameName} className={completed ? 'Lobby-completed' : ''}>
            <td>{gameName}</td>
            <td>{game.players.join(', ')}</td>
            <td>
              <Link to={`/game/${gameName}`}>
                <button>Join</button>
              </Link>
            </td>
          </tr>
        );
      }
    }.bind(this));
    return (
      <div className="Lobby">
        <div className="Lobby-input">
          <label>
            <input type="checkbox" onClick={this.toggleShowCompleted} />
            Show completed games
          </label>
        </div>
        <table>
          <thead>
            <tr style={{textAlign: 'left'}}>
              <th>Name</th>
              <th>Players</th>
              <th>Join</th>
            </tr>
          </thead>
          <tbody>
            {games}
          </tbody>
        </table>
        <h3>Create Game</h3>
        <form onSubmit={this.createGame} className="Lobby-form">
          <div className="Lobby-input">
            <label>
              Game name: <input name="game" autoComplete="off" />
            </label>
          </div>
          <div className="Lobby-input">
            <label>
              Number of players: <input name="players" type="number" autoComplete="off" />
            </label>
          </div>
          <div className="Lobby-input">
            <input type="submit" value="Create" />
          </div>
        </form>
      </div>
    );
  }

  componentWillUnmount = () => {
    this.rootRef.off();
  }
});

export default Lobby
