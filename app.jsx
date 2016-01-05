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
  handleGameChange: function(context) {
    this.setState({
      currentGameName: context && context.gameName || ''
    });
  },
  render: function() {
    var view;
    if (this.state.currentGameName) {
      view = <Game data={this.state.games[this.state.currentGameName]} onQuitGame={this.handleGameChange} />;
    } else {
      view = <Lobby games={this.state.games} onGameChange={this.handleGameChange} />;
    }
    return (
      <div className="App">
       {view}
      </div>
    );
  }
});
