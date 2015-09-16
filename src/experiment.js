import React from 'react';
import Parametrize from './parametrize';

const Experiment = React.createClass({
  getDefaultProps() {
    return {
      shouldEnroll: true,
      param: null,
      experimentName: null
    };
  },

  getInitialState() {
    return {
      hasRendered: false
    };
  },

  enrolledInVariation() {
    if (!this.state.hasRendered) {
      this.setState({
        hasRendered: true
      });
    }
  },

  renderExposedVariation() {
    const { param, shouldEnroll, experiment, experimentName } = this.props;

    if (!shouldEnroll) {
      return null;
    } else if (!experiment) {
      console.error("You must pass in an experiment instance as a prop");
      return null;
    } else if (!param && !experimentName) {
      console.error("You must pass in either a param name or experiment name as a prop");
      return null;
    }

    return (
      <Parametrize 
        experiment={experiment} 
        experimentName={experimentName}
        param={param} 
        enrolledInVariation={this.enrolledInVariation} 
        hasRendered={this.state.hasRendered}>

          {this.props.children}

      </Parametrize>
    );
  },

  render() {
    return this.renderExposedVariation();
  }
});

export default Experiment;
