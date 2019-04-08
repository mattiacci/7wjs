import React from 'react';
import './card.css';

// TODO: Move these elsewhere?
const resourceSymbols = ['clay', 'stone', 'wood', 'ore', 'glass', 'cloth', 'paper'];
const backgroundColors = ['rgb(192,128,96)','rgb(192,192,192)','rgb(255,255,0)','rgb(128,0,128)','rgb(255,0,0)','rgb(0,128,0)','rgb(0,128,0)','rgb(0,128,0)','rgb(0,0,255)','rgb(255,255,255)'];
const unknownCardBackgroundColor = 'rgb(224, 224, 224)';

const Card = function(props) {
  const data = props.data;
  const cardBackUrl = process.env.REACT_APP_ASSET_URL_PREFIX + 'Assets/Age ' + data.age + '/Back.jpg';
  // Card is 'unknown' if we only know the back of the card.
  const isUnknownCard = data.type == null;
  const cardFrontUrl = isUnknownCard ? cardBackUrl :
      process.env.REACT_APP_ASSET_URL_PREFIX + 'Assets/Age ' + data.age + '/' + data.minPlayers + ' ' + data.name + '.jpg';
  let cardBack = '';
  if (props.faceDown) {
    cardBack = (
      <div className="image cardBack" style={{ backgroundImage: 'url("' + cardBackUrl + '")' }} />
    );
  }
  return (
    <div className="Card">
    <div className={'card' + (props.selected ? ' selected' : '') + (props.unplayable ? ' unplayable' : '') + (props.free ? ' free' : '') + (props.isLast ? ' last' : '') + (props.faceDown ? ' faceDown' : '')}>
      <div className="image textFallback" style={{ backgroundColor: isUnknownCard ? unknownCardBackgroundColor : backgroundColors[data.type] }}>
        <h4 style={{ margin: '0 0 .5em 0' }}>{data.name}</h4>
        {
          data.cost.map(function(cost, i) {
            if (typeof cost === 'string') {
              return (
                <div key={i}>{cost}</div>
              );
            } else if (typeof cost === 'object') {
              return (
                <div key={i}>
                  {
                    cost.map(function(resource, i) {
                      return (
                        <span key={i}>{resourceSymbols[resource]} </span>
                      );
                    })
                  }
                </div>
              );
            } else if (typeof cost === 'number') {
              return (
                <div key={i}>{cost} gold</div>
              );
            } else {
              window.console.error('Invalid card cost type');
              return null;
            }
          })
        }
        <p style={{ margin: '.5em 0' }}>{data.tooltip}</p>
      </div>
      {cardBack}
      <div className="image cardFront" style={{ backgroundImage: 'url("' + cardFrontUrl + '")' }}></div>
    </div>
    </div>
  );
};

export default Card;
