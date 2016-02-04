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
    multi: React.PropTypes.object,
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
            padding: 2
          }}>
            <div style={{
              alignItems: 'center',
              background: 'linear-gradient(#f8f8f8, #ccc)',
              borderRadius: '50%',
              boxShadow: selected ? 'inset 0 0 0 1px red' : 'inset 0 0 0 1px #888',
              cursor: 'default',
              display: 'flex',
              fontSize: 12,
              height: 32,
              justifyContent: 'center',
              lineHeight: '32px',
              overflow: 'hidden',
              // padding: selected ? 0 : 1,
              textTransform: 'lowercase',
              mozUserSelect: 'none',
              msUserSelect: 'none',
              WebkitUserSelect: 'none',
              width: 32
            }} onClick={this.handleResourceChange.bind(this, index, value)}>{resourceName}</div>
          </div>
        );
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
        <div key={index} style={{
          display: 'inline-flex',
          fontSize: 12,
          padding: 2,
          textTransform: 'lowercase'
        }}>
          <div style={{
            alignItems: 'center',
            background: 'linear-gradient(#f8f8f8, #ccc)',
            // border: selectedLeft ? '1px solid red' : undefined,
            borderRadius: '16px 0 0 16px',
            boxShadow: selectedLeft ? 'inset 0 0 0 1px red' : 'inset 0 0 0 1px #888',
            boxSizing: 'border-box',
            cursor: 'default',
            display: 'flex',
            height: 32,
            justifyContent: 'center',
            overflow: 'hidden',
            // padding: selectedLeft ? 0 : 1,
            mozUserSelect: 'none',
            msUserSelect: 'none',
            WebkitUserSelect: 'none',
            width: 32
          }} onClick={this.handleResourceChange.bind(this, index, m[0])}>{ResourceFromNumber[m[0]]}</div>
          <div style={{
            alignItems: 'center',
            background: 'linear-gradient(#f8f8f8, #ccc)',
            // border: selectedRight ? '1px solid red' : undefined,
            borderRadius: '0 16px 16px 0',
            boxShadow: selectedRight ? 'inset 0 0 0 1px red' : 'inset 0 0 0 1px #888',
            boxSizing: 'border-box',
            cursor: 'default',
            display: 'flex',
            height: 32,
            justifyContent: 'center',
            overflow: 'hidden',
            // padding: selectedRight ? 0 : 1,
            mozUserSelect: 'none',
            msUserSelect: 'none',
            WebkitUserSelect: 'none',
            width: 32
          }} onClick={this.handleResourceChange.bind(this, index, m[1])}>{ResourceFromNumber[m[1]]}</div>
        </div>
      );
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
