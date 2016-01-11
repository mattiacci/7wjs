// TODO: Stage count shouldn't need to be passed in. Should all Wonder data be stored here?
window.WonderBoard = function(props) {
  var start, delta;
  if (props.side == 'A' || props.stageCount == 6) {
    start = 37;
    delta = 151;
  } else if (props.stageCount == 7) {
    start = -10;
    delta = 133;
  } else if (props.stageCount == 5) {
    start = 188;
    delta = 151;
  } else {
    console.error('WonderBoard: Unknown board');
    return <div />;
  }
  var cardBacks = props.built.map(function(age, i) {
    return (
      <div className="back" style={{
        backgroundImage: 'url("' + window.ASSET_URL_PREFIX + 'Assets/Age ' + age + '/Back.jpg")',
        left: start + delta * i
      }} />
    );
  });
  return (
    <div className="WonderBoard wonder">
      {cardBacks}
      <div className="board" style={{
        backgroundImage: 'url("' + window.ASSET_URL_PREFIX + 'Assets/' + props.name + ' ' + props.side + '.jpg")'
      }} />
    </div>
  );
};
