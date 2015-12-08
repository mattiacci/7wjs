window.Game = React.createClass({
  render: function() {
    return (
      <div className="Game">
        <button onClick={this.props.onQuitGame}>Quit</button>
      </div>
    );
  },
  componentWillUnmount: function() {
    // TODO: Remove once game field is rendered by React.
    document.querySelector('#legacy').innerHTML = '';
    document.querySelector('#score').innerHTML = '';
  },
});
