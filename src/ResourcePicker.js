import React from 'react';
import PropTypes from 'prop-types';
import { Resource } from './misc.js';
import ResourceButton from './ResourceButton.js';
import './ResourcePicker.css';

const ResourceFromNumber = [];
Object.keys(Resource).forEach(function(key) {
  ResourceFromNumber[Resource[key]] = key;
});

const ResourcePicker = React.createClass({
  propTypes: {
    multi: PropTypes.array.isRequired,
    onSelectionChange: PropTypes.func.isRequired,
    selected: PropTypes.array.isRequired,
    single: PropTypes.object.isRequired,
  },
  getDefaultProps: function() {
    return {
      multi: [],
      single: []
    };
  },
  handleSelectionChange: function(index, value, e) {
    var selected = this.props.selected.slice();
    selected[index] = value === selected[index] ? undefined : value;
    this.props.onSelectionChange(selected);
  },
  render: function() {
    var single = [], multi = [], index = 0;
    for (var resourceName in Resource) {
      var value = Resource[resourceName];
      var amount = this.props.single[value];
      for (let i = 0; i < amount; i++) {
        var selected = isFinite(this.props.selected[index]);
        single.push(
          <div key={index} style={{
            display: 'inline-block',
          }}>
            <ResourceButton resource={resourceName} selected={selected} onButtonClick={this.handleSelectionChange.bind(this, index, value)} />
          </div>
        );
        single.push(<span key={'space' + index}> </span>);
        index++;
      }
    }

    var multiResources = this.props.multi.filter(function(m) {
      // Caravansery and Forum are multiResources, so checking for length two filters them out.
      return m.length === 2;
    });
    for (let i = 0; i < multiResources.length; i++) {
      var m = multiResources[i];
      var selectedLeft = this.props.selected[index] === m[0];
      var selectedRight = this.props.selected[index] === m[1];
      multi.push(
        <div className="multi" key={index}>
          <ResourceButton resource={ResourceFromNumber[m[0]]} selected={selectedLeft} onButtonClick={this.handleSelectionChange.bind(this, index, m[0])} />
          <ResourceButton resource={ResourceFromNumber[m[1]]} selected={selectedRight} onButtonClick={this.handleSelectionChange.bind(this, index, m[1])} />
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

export default ResourcePicker;
