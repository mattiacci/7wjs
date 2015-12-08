window.Lobby = React.createClass({
  propTypes: {
    games: React.PropTypes.object,
    onJoinGame: React.PropTypes.func
  },
  getInitialState: function() {
    return {
      newGameName: '',
      numPlayers: '',
      playerName: ''
    };
  },
  handleCreateGameButtonClick: function(e) {
    gameRoom.createGame(this.state.newGameName, this.state.numPlayers, this.state.playerName);
  },
  handleJoinButtonClick: function(e) {
    this.props.onJoinGame({
      gameName: e.target.getAttribute('data-game'),
      playerName: this.state.playerName
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
        <button>Create</button>
      </div>
    );
  }
});
