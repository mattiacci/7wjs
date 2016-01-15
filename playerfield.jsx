(function() {

// TODO: Use shared CardType definition.
var CardType = {
  RESOURCE: 0, // Brown
  GOODS: 1,    // Grey
  COMMERCE: 2, // Yellow
  GUILD: 3,    // Purple
  MILITARY: 4, // Red
  ACADEMICS: 5,  // Green Sextant
  ENGINEERING: 6, // Green Gear
  LITERATURE: 7, // Green Tablet
  VICTORY: 8,  // Blue
  WONDER: 9
};

window.PlayerField = function(props) {
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
    var marginTop = -45;
    var cards = cardList.map(function(card, i) {
      marginTop += 45;
      return (
        <div key={i} style={{
          display: 'inline-block',
          marginRight: -105,
          marginTop: marginTop,
          verticalAlign: 'top'
        }}>
          <Card data={card} />
        </div>
      );
    });
    return (
      <div key={i} style={{
        display: 'inline-block',
        marginRight: 105
      }}>{cards}</div>
    );
  });

  return (
    <div className="PlayerField">
      <div style={{marginTop: 20}}>Gold: {props.gold}</div>
      <div>Battle Tokens: {props.battleTokens.join(' ')}</div>
      <div>Built:</div>
      <div>{cardTypes}</div>
      <WonderBoard built={props.wonder.built} name={props.wonder.name} side={props.wonder.side} stageCount={props.wonder.stageCount} />
    </div>
  );
};


})();
