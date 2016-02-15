(function() {

var Resource = {
  CLAY: 0,
  STONE: 1,
  WOOD: 2,
  ORE: 3,
  GLASS: 4,
  CLOTH: 5,
  PAPER: 6
};

var ResourceFromNumber = [];
Object.keys(Resource).forEach(function(key) {
  ResourceFromNumber[Resource[key]] = key;
});

window.ResourcePicker = React.createClass({
  propTypes: {
    multi: React.PropTypes.array,
    onSelectionChange: React.PropTypes.func,
    single: React.PropTypes.object,
  },
  getDefaultProps: function() {
    return {
      multi: [],
      single: []
    };
  },
  getInitialState: function() {
    return {
      selected: []
    };
  },
  handleResourceChange: function(index, value, e) {
    var selected = this.state.selected;
    selected[index] = value === selected[index] ? undefined : value;
    this.setState({ selected: selected });
    this.props.onSelectionChange(selected.filter(isFinite));
  },
  render: function() {
    var single = [], multi = [], index = 0;
    for (var resourceName in Resource) {
      var value = Resource[resourceName];
      var amount = this.props.single[value];
      for (var i = 0; i < amount; i++) {
        var selected = isFinite(this.state.selected[index]);
        single.push(
          <div key={index} style={{
            display: 'inline-block',
          }}>
            <ResourceButton resource={resourceName} selected={selected} onButtonClick={this.handleResourceChange.bind(this, index, value)} />
          </div>
        );
        single.push(<span key={'space' + index}> </span>);
        index++;
      }
    }

    var multiResources = this.props.multi.filter(function(m) {
      // Caravansery and Forum are multiResources, so checking for length two filters them out.
      return m.length == 2;
    });
    for (var i = 0; i < multiResources.length; i++) {
      var m = multiResources[i];
      var selectedLeft = this.state.selected[index] === m[0];
      var selectedRight = this.state.selected[index] === m[1];
      multi.push(
        <div className="multi" key={index}>
          <ResourceButton resource={ResourceFromNumber[m[0]]} selected={selectedLeft} onButtonClick={this.handleResourceChange.bind(this, index, m[0])} />
          <ResourceButton resource={ResourceFromNumber[m[1]]} selected={selectedRight} onButtonClick={this.handleResourceChange.bind(this, index, m[1])} />
        </div>
      );
      single.push(<span key={'space' + index}> </span>);
      index++;
    }

    return (
      <div className="ResourcePicker">
        {single}
        {multi}
      </div>
    );
  }
});

})();
