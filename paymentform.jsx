(function() {

var Action = {
  BUILD: 0,
  BUILD_WONDER: 1,
  DISCARD: 2
};

window.PaymentForm = React.createClass({
  propTypes: {
    east: React.PropTypes.object.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    west: React.PropTypes.object.isRequired
  },
  getInitialState: function() {
    return {
      bank: 0,
      east: [],
      west: []
    };
  },
  handleBankChange: function() {
    this.setState({
      bank: (this.state.bank + 1) % 2
    });
  },
  handleButtonClick: function(action) {
    this.props.onSubmit(action, {
      bank: this.state.bank,
      east: this.state.east,
      west: this.state.west
    });
  },
  handleEastPaymentChange: function(eastPayment) {
    this.setState({
      east: eastPayment
    });
  },
  handleWestPaymentChange: function(westPayment) {
    this.setState({
      west: westPayment
    });
  },
  render: function() {
    return (
      <div className="PaymentForm">
        <div style={{
          display: 'flex',
          marginTop: '.5em'
        }}>
          <div>
            Purchase from western (left) neighbor:
            <ResourcePicker multi={this.props.west.multiResources} single={this.props.west.resources} onSelectionChange={this.handleWestPaymentChange} />
          </div>
          <div style={{marginLeft: '1em'}}>
            Purchase from eastern (right) neighbor:
            <ResourcePicker multi={this.props.east.multiResources} single={this.props.east.resources} onSelectionChange={this.handleEastPaymentChange} />
          </div>
        </div>
        <div style={{margin: '.5em 0'}}>
          <input type="checkbox" checked={!!this.state.bank} onChange={this.handleBankChange} /> Pay bank
        </div>
        <div>
          <button onClick={this.handleButtonClick.bind(this, Action.BUILD)}>Build</button>
          <button style={{marginLeft: '.5em'}} onClick={this.handleButtonClick.bind(this, Action.BUILD_WONDER)}>Build Wonder</button>
          <button style={{marginLeft: '.5em'}} onClick={this.handleButtonClick.bind(this, Action.DISCARD)}>Discard</button>
        </div>
      </div>
    );
  }
});

})();
