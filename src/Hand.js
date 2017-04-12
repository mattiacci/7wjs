import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Card from './Card.js';

class Hand extends Component {
  static defaultProps = {
    selected: -1
  }

  static propTypes = {
    cards: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    selected: PropTypes.number
  }

  handleCardClick = (e) => {
    const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
    this.props.onSelect(index);
  }

  render() {
    const cards = this.props.cards.map(function(card, i) {
      return (
        <div data-index={i} key={i} style={{display: 'inline-block'}} onClick={this.handleCardClick}>
          <Card data={card} selected={i === this.props.selected} unplayable={card.unplayable} free={card.free}/>
        </div>
      );
    }, this);
    return (
      <div className="Hand">
        {cards}
      </div>
    );
  }
};

export default Hand;
