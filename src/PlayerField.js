import React from 'react';
import Card from './Card.js';
import { CardType } from './misc.js';
import WonderBoard from './WonderBoard.js';

const PlayerField = function(props) {
  var lastBuiltCard = props.cards.length > 0 ? props.cards[props.cards.length - 1] : null;
  var builtCards = [];
  Object.keys(CardType).forEach(function(type) {
    builtCards[CardType[type]] = [];
  });
  props.cards.filter(function(card) {
    return card.type != CardType.WONDER;
  }).forEach(function(card) {
    builtCards[card.type].push(card);
  });
  // TODO: Determine if sorting is necessary. (Isn't unsorted actually play order?)
  /*
  Object.keys(CardType).forEach(function(type) {
    builtCards[type].sort(function(card1, card2) {
      return card1.age - card2.age;
    });
  });
  */
  var cardTypes = builtCards.map(function(cardList, i) {
    if (!cardList.length) {
      return null;
    }
    var marginTop = -36;
    var cards = cardList.map(function(card, i) {
      marginTop += 36;
      return (
        <div key={i} style={{
          display: 'inline-block',
          marginRight: -86,
          marginTop: marginTop,
          verticalAlign: 'top'
        }}>
          <Card data={card} isLast={card == lastBuiltCard}/>
        </div>
      );
    });
    return (
      <div key={i} style={{
        display: 'inline-block',
        marginRight: 86
      }}>{cards}</div>
    );
  });

  return (
    <div className="PlayerField">
      <div style={{marginTop: 20}}>Gold: {props.gold}</div>
      <div>Battle Tokens: {props.battleTokens.join(' ')}</div>
      <div>Built:</div>
      <div>{cardTypes}</div>
      <WonderBoard isLast={props.wonder.isLast} built={props.wonder.built} name={props.wonder.name} side={props.wonder.side} stageCount={props.wonder.stageCount} />
    </div>
  );
};

export default PlayerField;
