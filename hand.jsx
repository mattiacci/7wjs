window.Hand = React.createClass({
  propTypes: {
    cards: React.PropTypes.array.isRequired,
    onSelect: React.PropTypes.func,
    selected: React.PropTypes.number
  },
  getInitialState: function() {
    return {
      selected: isFinite(this.props.selected) ? this.props.selected : -1
    };
  },
  handleCardClick: function(e) {
    var index = parseInt(e.currentTarget.getAttribute('data-index'));
    this.props.onSelect(index);
    this.setState({selected: index});
  },
  render: function() {
    var cards = this.props.cards.map(function(card, i) {
      return (
        <div data-index={i} key={i} style={{display: 'inline-block'}} onClick={this.handleCardClick}>
          <Card data={card} selected={i == this.state.selected} unplayable={card.unplayable} />
        </div>
      );
    }, this);
    return (
      <div className="Hand">
        {cards}
      </div>
    );
  }
});
