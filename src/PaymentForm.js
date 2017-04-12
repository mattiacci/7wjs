import React, { Component } from 'react';
import { Action } from './misc.js';
import Hand from './Hand.js';
import ResourcePicker from './ResourcePicker.js';

class PaymentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bank: 0,
      card: {},
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
    const data = {
      card: this.state.card,
      payment: {
        bank: this.state.bank,
        east: this.state.east.filter(isFinite),
        west: this.state.west.filter(isFinite)
      }
    };
    let act = this.props.actions.discard;
    if (action === Action.BUILD) {
      act = this.props.actions.build;
    } else if (action === Action.BUILD_WONDER) {
      act = this.props.actions.buildWonder;
    }
    act(data);
    this.resetState();
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

  resetState() {
    this.setState({
      bank: 0,
      card: null,
      cardIndex: -1,
      east: [],
      west: []
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
            <ResourcePicker multi={this.props.west.multi} single={this.props.west.single} selected={this.state.west} onSelectionChange={this.handleWestPaymentChange.bind(this)} />
          </div>
          <div style={{marginLeft: '1em'}}>
            Purchase from eastern (right) neighbor:
            <ResourcePicker multi={this.props.east.multi} single={this.props.east.single} selected={this.state.east} onSelectionChange={this.handleEastPaymentChange.bind(this)} />
          </div>
        </div>
        <div style={{margin: '.5em 0'}}>
          <label>
            <input type="checkbox" checked={!!this.state.bank} onChange={this.handleBankChange.bind(this)} /> Pay bank
          </label>
        </div>
        <div>
          <button onClick={this.handleButtonClick.bind(this, Action.BUILD)}>Build</button>
          <button style={{marginLeft: '.5em'}} onClick={this.handleButtonClick.bind(this, Action.BUILD_WONDER)}>Build Wonder</button>
          <button style={{marginLeft: '.5em'}} onClick={this.handleButtonClick.bind(this, Action.DISCARD)}>Discard</button>
        </div>
      </div>
    );
  }
};

PaymentForm.propTypes = {
  actions: React.PropTypes.object.isRequired,
  east: React.PropTypes.object.isRequired,
  hand: React.PropTypes.array.isRequired,
  west: React.PropTypes.object.isRequired
};

export default PaymentForm;
