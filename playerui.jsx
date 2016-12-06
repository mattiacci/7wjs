window.PlayerUI = class PlayerUI extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    let hand = null;
    let paymentForm = null;
    if (this.props.playable) {
      hand = <Hand cards={this.props.hand} selected={this.props.initiallySelectedCard} onSelect={this.props.onSelect} />;
      paymentForm = <PaymentForm east={this.props.payment.east} west={this.props.payment.west} onSubmit={this.props.onSubmit} />;
    }
    return (
      <div className="PlayerUI" style={{background: this.props.playable ? '' : 'rgba(0,0,0,.2)'}}>
        <h3 style={{display: 'inline-block', margin: '0 1em .5em 0'}}>
          {(this.props.age % 2 ? '' : '< ') + this.props.name + (this.props.age % 2 ? ' >' : '')}
        </h3>
        Current Score: <b>{this.props.score}</b>
        {hand}
        {paymentForm}
        <PlayerField battleTokens={this.props.battleTokens} cards={this.props.built} gold={this.props.gold} wonder={this.props.wonder} />
      </div>
    );

  }

};
