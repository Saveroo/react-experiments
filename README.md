react-experiments
====================

react-experiments is a Javascript library that assists in defining and managing UI experiments in React.

# Installation

```
npm install react-experiments
```

# Usage

react-experiments was built to work with [PlanOut.js](https://www.github.com/HubSpot/PlanOut.js) and most of its constructs are inspired by the structure of PlanOut.js. This library will work out of the box if you pass it an instantiated PlanOut Namespace or Experiment class, but if you want to use your own methods of assigning experiment parameters and logging exposure then you can extend the base [experiment class](https://github.com/HubSpot/react-experiments/blob/master/src/experimentClass.js) and pass that as the experiment class prop.


## Implementing a simple experiment

This library serves as a way to declaratively implement UI experiments that are defined via PlanOut. The standard usage of this library is as follows:

1) Define experiment via PlanOut script / API. The PlanOut parameters that you set should map to the props on which you want to run an experiment. Let's use the [sample PlanOut.js experiment](https://github.com/HubSpot/PlanOut.js/blob/master/examples/sample_planout_es5.js#L41) as an example, which is effectively: 

```
signupText = uniformChoice(choices=['Signup', 'Join now'])
```

2) Wrap the component where you want to implement your UI experiment with the parametrizeComponent function provided by the library along with an instantiated experiment class and the specific parameter names that you want to parametrize the component with. As an example,

```
const Signup = parametrizeComponent(DummyExperiment, ['signupText'], React.createClass({
  render() {
    return (
      <div>
        {this.props.signupText}
      </div>
    );
  }
}
}));
```

Now you should be all set to run the sample experiment. The Signup component will render 'Sign up' or 'Join now' based on the randomized parameter assigned by PlanOut.js.

To put it all together,

```javascript

exp = new DummyExperiment({ id: 'this_is_the_user_id'});

let Signup = parametrizeComponent(exp, ['signupText'], React.createClass({
  render() {
    return (
      <div>
        {this.props.signupText}
      </div>
    );
  }
});

let Parent = React.createClass({
  render() {
    ...
    <Signup />
  }
});
```


## Base Parametrize Component

The implementation of all the components provided by this library are wrappers around a base ```Parametrize``` component. The ```Parametrize``` component allows for parametrizing a given component with experiment parameters. The following are the props that the ```Parametrize``` component takes:

**experiment**: This is an instance of a PlanOut.js experiment / namespace class or the base experimentClass. [REQUIRED]

**experimentName**: This is the name of the experiment. It is particularly important if you're using a PlanOut.js namespace, since this corresponds to the name of the experiment WITHIN the namespace, not the name of the namespace itself. This is required so that exposure gets logged correctly. [REQUIRED, if params prop not provided]

**params**: This is the list of experiment parameters that you want to use to parametrize the component. [REQUIRED, if experimentName not provided]

[any arbitrary prop]: You can pass arbitrary props to the Parametrize component and they will be available via context.experimentProps in all descendants of the Parametrize component.

### Higher-order Parametrization Components

There are two primary higher-order components to use for parametrization. 

**parametrizeComponent**: The ```parametrizeComponent``` function takes an instantiated experiment class, either an experiment name or a list of params, and a React component. It takes the given component and sets the deterministically and randomly assigned experiment parameters of the experiment class as props.

```parametrizeComponent(exp, ['signupText'], React.createClass({..}));```

**withExperimentParams**: The ```withExperimentParams``` function is used in combination with the base ```Parametrize``` component. It is useful when running an experiment with nested components, but generally the ```parametrizeComponent``` function should be preferred.


```javascript
const Parent = React.createClass({
  render() {
    return (
      <Parametrize experiment={exp} params=['signup_form_text', 'signup_nav_text']>
        <SignupHeader />
        <SignupForm />
      </Parametrize>
    );
  }
});

const SignupHeader = withExperimentParams(React.createClass({
  render() {
    return (
      <div>
        {this.props.signup_nav_text}
      </div>
    );
  }
});

const SignupForm = withExperimentParams(React.createClass({
  render() {
    return (
      <div>
        {this.props.signup_form_text}
      </div>
    );
  }
});
```


## Running A/B Variation experiments:

There are two common types of experimental parameters:

1) Parameters that correspond to parametrizations of existing variables and components. For instance, if one is running an experiment to test which shade of blue optimizes the click rate of the button, then the values to which your experiment parameters map would correspond to something such as the different hex codes for the different shades of blue.

2) "Branching" parameters where the parameter values correspond to different "variations" of the experiment. For instance, if one is testing two completely different user interfaces then it wouldn't make sense to parametrize every aspect that has changed, but rather to bin users into either 'Variation A' or 'Variation B'.

While the core component of this library focuses on the first type of parameter, it also includes some convenience components built around the Parametrize component for running "branching" experiments using the ```ABTest``` component.

```javascript
<ABTest on='foo' experiment={TestNamespace} experimentName='SimpleExperiment' shouldEnroll={this.shouldEnroll()}>
  <When value='foobar'>
    variation 1
  </When>
  <When value='bar'>
    variation 2
  </When>
  <When value='test'>
    variation 3
  </When>
  <Default>
    variation default
  </Default>
</ABTest>
```

The ABTest component above branches off the value of ```this.props.experiment.get(this.props.on);```, ```TestNamespace.get('foo')``` in this case, and renders the When component where ```ABTest.props.experiment.get(ABTest.props.on) === ABTest.props.value```. If it doesn't find a corresponding When component to render then the Default component will render. This component makes implementing an experiment using "branching" parameters easy.

The ABTest component takes the following as props:

**experiment** - an instantiated PlanOut namespace or experiment class or a custom experimentClass. [REQUIRED]

**on** - the parameter name to "branch" off [REQUIRED]

**experimentName** - the name of the experiment with which the component corresponds. This is particularly important if you are passing in a namespace class. If you are passing in a namespace class then experimentName should correspond to the name of the experiment within the namespace that this component should handle. Use this if you want your component to deal with any arbitrary number of parameters. [REQUIRED]

**shouldEnroll** - this determines whether or not the user should be enrolled in the experiment or not. It defaults to true. If false is passed, nothing is returned and no exposure is logged. [OPTIONAL]

## Customized Experiment Components

If you want to create your own experiment component you can extend the base Parametrize component.

## Logging

react-experiments deals with logging experiment exposure. Using the base ```Parametrize``` component always triggers an exposure log when the component is mounted. The ```ABTest``` component also does the same thing unless the ```shouldEnroll``` prop is false.

## Development

This project is written using ES6 and all build steps / transpilation are done by webpack. Be sure to run ```npm install``` to install the necessary development dependencies. In order to develop and test locally, it is necessary to simply run the ```build.sh``` shell script which will take care of transpiling to ES5 and running tests.

To test API changes locally, open the examples/index.html file locally after building with your most recent changes. The index.html file contains a simple example of using this library paired with the [PlanOut.js sample experiment](https://github.com/HubSpot/PlanOut.js/blob/master/examples/sample_planout_es5.js).

Please be sure to add tests to this project when making changes. This project uses [Jest](https://facebook.github.io/jest/) for running tests. Tests can be run either by building the project using build.sh or by using ```npm test```.
