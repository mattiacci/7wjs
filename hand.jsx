window.Hand = class Hand extends React.Component {

  constructor(props) {
    super(props);
  }

  handleCardClick(e) {
    const index = parseInt(e.currentTarget.getAttribute('data-index'));
    this.props.onSelect(index);
  }

  render() {
    const cards = this.props.cards.map(function(card, i) {
      return (
        <div data-index={i} key={i} style={{display: 'inline-block'}} onClick={this.handleCardClick.bind(this)}>
          <Card data={card} selected={i == this.props.selected} unplayable={card.unplayable} free={card.free}/>
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

Hand.defaultProps = {
  selected: -1
};

Hand.propTypes = {
  cards: React.PropTypes.array.isRequired,
  onSelect: React.PropTypes.func.isRequired,
  selected: React.PropTypes.number
};
