import React from 'react';
import PlayerUI from './PlayerUI.js';
import './GameUI.css';

const GameUI = (props) => {
  const playerUIList = props.data.players.map(function(player, i) {
    return (
      <div key={i} style={{display: 'flex', position: 'relative'}}>
        <PlayerUI data={player} game={props.data.game} actions={props.actions} />
      </div>
    );
  });
  const playablePlayerCenteredPlayerUIList = [];
  const numPlayers = props.data.players.length;
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
};

export default GameUI;
