import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as firebase from 'firebase';
import { Link, withRouter } from 'react-router-dom';
import { AGE1DECK, AGE2DECK, AGE3DECK, WONDERS } from './misc.js';
import './Lobby.css';

const GAME_NAME_MAX_LENGTH = 24;
const PLAYERS_MIN = 2;
const PLAYERS_MAX = 7;

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
      activeGames: {},
      completedGames: {},
      showCompleted: false
    };
  }

  componentDidMount() {
    this.activeGamesRef = firebase.database().ref('/games/active/').orderByChild('createdAt');
    this.activeGamesRef.on('value', (snapshot) => {
      this.setState({ activeGames: snapshot.val() });
    });
    this.completedGamesRef = firebase.database().ref('/games/completed/').orderByChild('completedAt');
    this.completedGamesRef.on('value', (snapshot) => {
      this.setState({ completedGames: snapshot.val() });
    });
  }

  createGame = (e) => {
    e.preventDefault();
    const elements = e.target.elements;
    const gameName = elements['game'].value.trim().replace(/[^\w- ]/g, '');
    const numPlayers = parseInt(elements['players'].value, 10);
    if (!gameName || gameName.length > GAME_NAME_MAX_LENGTH || !isFinite(numPlayers) ||
        numPlayers < PLAYERS_MIN || numPlayers > PLAYERS_MAX) {
      alert(`Enter a short name, with ${PLAYERS_MIN}-${PLAYERS_MAX} players.`);
      return;
    }

    firebase.database().ref(`/gamenames/${gameName}`).once('value').then((snapshot) => {
      if (snapshot.exists()) {
        const str = 'Game already exists. Please pick a new name.';
        alert(str);
        return Promise.reject(new Error(str));
      }
    }).then(() => {
      const key = firebase.database().ref('/gamedetails').push().key;
      const updates = {};
      updates[`/gamenames/${gameName}`] = key;
      updates[`/games/active/${key}`] = {
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        name: gameName,
        players: [],
        playerCount: numPlayers
      };
      updates[`/gamedetails/${key}`] = {
        boards: shuffleWonders(numPlayers),
        hands: shuffleCards(numPlayers),
        turns: []
      };
      return firebase.database().ref().update(updates);
    }).then(() => {
      this.props.history.push(process.env.PUBLIC_URL + `/game/${gameName}`);
    }).catch((error) => {
      window.console.error(error);
    });
  }

  render() {
    const activeGames = Object.keys(this.state.activeGames).reverse()
        .map((key) => this.state.activeGames[key]).map(this.renderGame);
    const completedGames = this.state.showCompleted ?
        Object.keys(this.state.completedGames).reverse()
            .map((key) => this.state.completedGames[key]).map(this.renderGame): [];
    const games = activeGames.concat(completedGames);
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

  renderGame = (game) => {
    game.players = game.players || [];
    return (
      <tr key={game.name} className={game.completedAt ? 'Lobby-completed' : ''}>
        <td>{game.name}</td>
        <td>{game.players.join(', ')}</td>
        <td>
          <Link to={process.env.PUBLIC_URL + `/game/${game.name}`}>
            <button>Join</button>
          </Link>
        </td>
      </tr>
    );
  }

  toggleShowCompleted = (e) => {
    this.setState({ showCompleted: e.target.checked });
  }

  componentWillUnmount = () => {
    this.activeGamesRef.off();
    this.completedGamesRef.off();
  }
});

export default Lobby
