window.PaymentForm = class PaymentForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      bank: 0,
      card: null,
      cardIndex: -1,
      east: [],
      west: []
    };
  }

  handleBankChange() {
    this.setState({
      bank: (this.state.bank + 1) % 2
    });
  }

  handleButtonClick(action) {
    this.props.gameState.child('turns').push({
      id: this.props.id,
      action: action,
      card: {
        name: this.state.card.name,
        minPlayers: this.state.card.minPlayers,
        age: this.state.card.age
      },
      payment: {
        bank: this.state.bank,
        east: this.state.east.filter(isFinite),
        west: this.state.west.filter(isFinite)
      }
    });
  }

  handleCardSelection(index) {
    this.setState({
      card: this.props.hand[index],
      cardIndex: index
    });
  }

  handleEastPaymentChange(eastPayment) {
    this.setState({
      east: eastPayment
    });
  }

  handleWestPaymentChange(westPayment) {
    this.setState({
      west: westPayment
    });
  }

  render() {
    return (
      <div className="PaymentForm">
        <Hand cards={this.props.hand} selected={this.state.cardIndex} onSelect={this.handleCardSelection.bind(this)} />
        <div style={{
          display: 'flex',
          marginTop: '.5em'
        }}>
          <div>
            Purchase from western (left) neighbor:
            <ResourcePicker multi={this.props.west.multiResources} single={this.props.west.resources} selected={this.state.west} onSelectionChange={this.handleWestPaymentChange.bind(this)} />
          </div>
          <div style={{marginLeft: '1em'}}>
            Purchase from eastern (right) neighbor:
            <ResourcePicker multi={this.props.east.multiResources} single={this.props.east.resources} selected={this.state.east} onSelectionChange={this.handleEastPaymentChange.bind(this)} />
          </div>
        </div>
        <div style={{margin: '.5em 0'}}>
          <label>
            <input type="checkbox" checked={!!this.state.bank} onChange={this.handleBankChange.bind(this)} /> Pay bank
          </label>
        </div>
        <div>
          <button onClick={this.handleButtonClick.bind(this, PaymentForm.Action.BUILD)}>Build</button>
          <button style={{marginLeft: '.5em'}} onClick={this.handleButtonClick.bind(this, PaymentForm.Action.BUILD_WONDER)}>Build Wonder</button>
          <button style={{marginLeft: '.5em'}} onClick={this.handleButtonClick.bind(this, PaymentForm.Action.DISCARD)}>Discard</button>
        </div>
      </div>
    );
  }
};

PaymentForm.Action = {
  BUILD: 0,
  BUILD_WONDER: 1,
  DISCARD: 2
};

PaymentForm.propTypes = {
  east: React.PropTypes.object.isRequired,
  hand: React.PropTypes.array.isRequired,
  id: React.PropTypes.number.isRequired,
  west: React.PropTypes.object.isRequired
};
