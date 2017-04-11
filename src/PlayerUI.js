import React, { Component } from 'react';
import PaymentForm from './PaymentForm.js';
import PlayerField from './PlayerField.js';
import './PlayerUI.css';

class PlayerUI extends Component {
  constructor(props) {
    super(props);
  }

  handleUndoClick() {
    if (this.props.actions.undo) {
      this.props.actions.undo();
    }
  }

  render() {
    let paymentForm = null;
    let undoButton = null;
    if (this.props.data.playable) {
      paymentForm = <PaymentForm actions={this.props.actions} hand={this.props.data.cardsInHand} east={this.props.data.resources.east} west={this.props.data.resources.west} />;
    }
    if (this.props.actions && this.props.actions.undo) {
      undoButton = <button className="undo" onClick={this.handleUndoClick.bind(this)}>Undo</button>;
    }
    let overlay = null;
    if (this.props.data.waiting) {
      if (this.props.data.playable) {
        overlay = ( 
          <div className="waiting-overlay playable" style={{
            background: 'rgba(255, 196, 0, 0.4)',
            color: 'white',
            fontSize: '25px'
          }}>
            Waiting for other players
            {undoButton}
          </div>
        );
      } else {
        overlay = ( 
          <div className="waiting-overlay" style={{
            background: 'rgba(128, 255, 128, 0.4)',
            color: 'grey',
            fontSize: '50px'
          }}>
            Done
          </div>
        );
      }
    }
    return (
      <div className="PlayerUI" style={{background: this.props.data.playable ? '' : 'rgba(0,0,0,.2)'}}>
        <h3 style={{display: 'inline-block', margin: '0 1em .5em 0'}}>
          {(this.props.game.age % 2 ? '' : '< ') + this.props.data.name + (this.props.game.age % 2 ? ' >' : '')}
        </h3>
        Current Score: <b>{this.props.data.score}</b>
        {paymentForm}
        <PlayerField battleTokens={this.props.data.battleTokens} cards={this.props.data.built} gold={this.props.data.gold} wonder={this.props.data.wonder} />
        {overlay}
      </div>
    );
  }
};

export default PlayerUI;
