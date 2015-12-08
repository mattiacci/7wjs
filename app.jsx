window.App = React.createClass({
  getInitialState: function() {
    return {
      currentGameName: '',
      games: {}
    };
  },
  componentWillMount: function() {
    this.firebaseRef = new Firebase(FIREBASE_SERVER);
    this.firebaseRef.on('child_added', function(snapshot) {
      this.state.games[snapshot.key()] = snapshot.val();
      this.setState({games: this.state.games});
    }.bind(this));
    this.firebaseRef.on('child_changed', function(snapshot) {
      this.state.games[snapshot.key()] = snapshot.val();
      this.setState({games: this.state.games});
    }.bind(this));
  },
  handleJoinGame: function(context) {
    gameRoom.joinGame(context.gameName, context.playerName);
    this.setState({
      currentGameName: context.gameName
    });
  },
  handleQuitGame: function() {
    this.setState({
      currentGameName: ''
    });
  },
  render: function() {
    var view;
    if (this.state.currentGameName) {
      view = <Game data={this.state.games[this.state.currentGameName]} onQuitGame={this.handleQuitGame} />;
    } else {
      view = <Lobby games={this.state.games} onJoinGame={this.handleJoinGame} />;
    }
    return (
      <div className="App">
       {view}
      </div>
    );
  }
});
