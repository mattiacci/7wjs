(function() {

// TODO: Find a better way to pass in URL state.
var params = (function() {
  var result = {};
  if (window.location.search) {
      // split up the query string and store in an associative array
      var params = window.location.search.slice(1).split('&');
      for (var i = 0; i < params.length; i++) {
          var tmp = params[i].split('=');
          result[tmp[0]] = unescape(tmp[1]);
      }
  }
  return result;
})();

window.Lobby = React.createClass({
  propTypes: {
    games: React.PropTypes.object,
    onGameChange: React.PropTypes.func
  },
  getInitialState: function() {
    return {
      newGameName: '',
      numPlayers: '',
      playerName: params['name'] || window.localStorage.getItem('name') || ''
    };
  },
  handleCreateButtonClick: function(e) {
    gameRoom.createGame(this.state.newGameName, this.state.numPlayers, this.state.playerName);
    this.props.onGameChange({
      gameName: this.state.newGameName
    });
  },
  handleJoinButtonClick: function(e) {
    var gameName = e.target.getAttribute('data-game');
    window.localStorage.setItem('name', this.state.playerName);
    gameRoom.joinGame(gameName, this.state.playerName);
    this.props.onGameChange({
      gameName: gameName
    });
  },
  handleNewGameNameChange: function(e) {
    this.setState({newGameName: e.target.value});
  },
  handleNumPlayersChange: function(e) {
    this.setState({numPlayers: parseInt(e.target.value)});
  },
  handlePlayerNameChange: function(e) {
    this.setState({playerName: e.target.value});
  },
  render: function() {
    var games = Object.keys(this.props.games).map(function(gameName) {
      var game = this.props.games[gameName];
      return (
        <tr key={gameName}>
          <td>{gameName}</td>
          <td>{game.players.join(', ')}</td>
          <td>
            <button onClick={this.handleJoinButtonClick} data-game={gameName}>Join</button>
          </td>
        </tr>
      );
    }.bind(this));
    return (
      <div className="Lobby">
        <span><br />Player name: </span>
        <input value={this.state.playerName} onChange={this.handlePlayerNameChange} />
        <div><br />Games</div>
        <table>
          <tbody>
            <tr style={{textAlign: 'left'}}>
              <th>Name</th>
              <th>Players</th>
              <th>Join</th>
            </tr>
            {games}
          </tbody>
        </table>
        <span><br />Create Game<br />Game name:</span>
        <input type="text" onChange={this.handleNewGameNameChange} />
        <span><br />Number of players: </span>
        <input type="text" onChange={this.handleNumPlayersChange} />
        <button onClick={this.handleCreateButtonClick}>Create</button>
      </div>
    );
  }
});

})();
