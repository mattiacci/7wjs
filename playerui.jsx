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
    let waitingOverlay = null;
    if (this.props.waiting) {
      let undoButton = null;
      if (this.props.playable && this.props.canUndo) {
        undoButton = <button onClick={this.props.onUndo} style={{marginLeft: '4px'}}>Undo</button>;
      }
      waitingOverlay = (
        <div className="waiting-overlay" style={{
            background: this.props.playable ? 'rgba(255, 196, 0, 0.4)' : 'rgba(128, 255, 128, 0.4)',
            color: this.props.playable ? 'white' : 'grey',
            fontSize: this.props.playable ? '25px' : '50px'
        }}>
          {this.props.playable ? 'Waiting for other players' : 'Done'}
          {undoButton}
        </div>
      );
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
        {waitingOverlay}
      </div>
    );

  }

};
