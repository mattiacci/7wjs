window.ResourceButton = function(props) {
  var backgroundImage = 'url(' + window.ASSET_URL_PREFIX + 'Assets/resources/' + props.resource.toLowerCase() + (props.selected ? '_selected' : '') +  '.png)';
  return (
    <div style={{
      backgroundImage: backgroundImage,
      backgroundSize: 'contain',
      cursor: 'default',
      height: 35,
      MozUserSelect: 'none',
      msUserSelect: 'none',
      WebkitUserSelect: 'none',
      width: 35
    }} onClick={props.onButtonClick}></div>
  );
};
