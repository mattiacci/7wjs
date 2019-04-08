import React from 'react';
import Card from './Card.js';
import './WonderBoard.css';
import './card.css';

// TODO: Stage count shouldn't need to be passed in. Should all Wonder data be stored here?
const WonderBoard = function(props) {
  var start, delta;
  if (props.side === 'A' || props.stageCount === 6) {
    start = 38;
    delta = 116;
  } else if (props.stageCount === 7) {
    start = 0;
    delta = 105;
  } else if (props.stageCount === 5) {
    start = 155;
    delta = 116;
  } else {
    console.error('WonderBoard: Unknown board');
    return <div />;
  }
  var builtStageCards = props.built.map(function(card, i) {
    return (
      <div key={i} className="builtCard" style={{ left: start + delta * i }}>
        <Card data={card} faceDown={true} />
      </div>
    );
  });
  return (
    <div className="WonderBoard">
      {builtStageCards}
      <div className="board" style={{
        backgroundImage: 'url("' + process.env.REACT_APP_ASSET_URL_PREFIX + 'Assets/' + props.name + ' ' + props.side + '.jpg")'
      }} />
    </div>
  );
};

export default WonderBoard;
