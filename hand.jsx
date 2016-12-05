window.Hand = class Hand extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selected: isFinite(this.props.selected) ? this.props.selected : -1
    };
  }

  handleCardClick(e) {
    const index = parseInt(e.currentTarget.getAttribute('data-index'));
    this.props.onSelect(index);
    this.setState({selected: index});
  }

  render() {
    const cards = this.props.cards.map(function(card, i) {
      return (
        <div data-index={i} key={i} style={{display: 'inline-block'}} onClick={this.handleCardClick.bind(this)}>
          <Card data={card} selected={i == this.state.selected} unplayable={card.unplayable} free={card.free}/>
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

Hand.propTypes = {
  cards: React.PropTypes.array.isRequired,
  onSelect: React.PropTypes.func,
  selected: React.PropTypes.number
};
