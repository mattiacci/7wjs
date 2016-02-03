(function() {

// TODO: Move these elsewhere?
var resourceSymbols = ['clay', 'stone', 'wood', 'ore', 'glass', 'cloth', 'paper'];
var backgroundColors = ['rgb(192,128,96)','rgb(192,192,192)','rgb(255,255,0)','rgb(128,0,128)','rgb(255,0,0)','rgb(0,128,0)','rgb(0,128,0)','rgb(0,128,0)','rgb(0,0,255)','rgb(255,255,255)'];

window.Card = function(props) {
  var data = props.data;
  return (
    <div className={'Card card' + (props.selected ? ' selected' : '') + (props.unplayable ? ' unplayable' : '') + (props.free ? ' free' : '')}
         style={{backgroundColor: backgroundColors[data.type]}}>
      <h4 style={{margin: '0 0 .5em 0'}}>{data.name}</h4>
      {
        data.cost.map(function(cost, i) {
          if (typeof cost == 'string') {
            return (
              <div key={i}>{cost}</div>
            );
          } else if (typeof cost == 'object') {
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
          } else if (typeof cost == 'number') {
            return (
              <div key={i}>1 gold</div>
            );
          } else {
            console.error('Invalid card cost type');
          }
        })
      }
      <p style={{margin: '.5em 0'}}>{data.tooltip}</p>
      <div className="image" style={{
        backgroundImage: 'url("' + window.ASSET_URL_PREFIX + 'Assets/Age ' + data.age + '/' + data.minPlayers + ' ' + data.name + '.jpg")'
      }}></div>
    </div>
  );
};

})();
