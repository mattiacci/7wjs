import React from 'react';
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
  var cardBacks = props.built.map(function(cardOrAge, i) {
    var path = process.env.REACT_APP_ASSET_URL_PREFIX + 'Assets/Age ';
    if (cardOrAge.age) {
      return (
        <div key={i} className="back-container" style={{left: start + delta * i}}>
          <div className="back" style={{
            backgroundImage: 'url("' + path + cardOrAge.age + '/Back.jpg")'
          }} />
          <div className="back hoverable" style={{
            backgroundImage: 'url("' + path + cardOrAge.age + '/' + cardOrAge.minPlayers + ' ' + cardOrAge.name + '.jpg")'
          }} />
        </div>
      );
    } else {
      return (
        <div key={i} className="back" style={{
          backgroundImage: 'url("' + path + cardOrAge + '/Back.jpg")',
          left: start + delta * i
        }} />
      );
    }
  });
  return (
    <div className="WonderBoard wonder">
      {cardBacks}
      <div className="board" style={{
        backgroundImage: 'url("' + process.env.REACT_APP_ASSET_URL_PREFIX + 'Assets/' + props.name + ' ' + props.side + '.jpg")'
      }} />
    </div>
  );
};

export default WonderBoard;
