import React, { Component } from 'react';
import PlayerUI from './PlayerUI.js';
import './GameUI.css';

class GameUI extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const playerUIList = this.props.data.players.map(function(player, i) {
      return (
        <div key={i} style={{display: 'flex', position: 'relative'}}>
          <PlayerUI data={player} game={this.props.data.game} actions={this.props.actions} />
        </div>
      );
    }, this);
    const playablePlayerCenteredPlayerUIList = [];
    const numPlayers = this.props.data.players.length;
    var startIndex = Math.floor(numPlayers / 2 + 1);
    for (var i = 0; i < numPlayers; i++) {
      playablePlayerCenteredPlayerUIList.push(
        playerUIList[(i + startIndex) % numPlayers]);
    }
    return (
      <div className="GameUI">
        {playablePlayerCenteredPlayerUIList}
      </div>
    );
  }
};

export default GameUI;
