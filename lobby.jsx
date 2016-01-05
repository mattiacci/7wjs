window.Lobby = React.createClass({
  propTypes: {
    games: React.PropTypes.object,
    onGameChange: React.PropTypes.func
  },
  getInitialState: function() {
    return {
      newGameName: '',
      numPlayers: '',
      playerName: ''
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
