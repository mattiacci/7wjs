import React, { Component } from 'react';
import {
  BrowserRouter,
  Link,
  Redirect,
  Route,
  Switch,
  withRouter
} from 'react-router-dom';
import * as firebase from 'firebase';
import fakeAuth from './fakeAuth.js';
import Game from './Game.js';
import Lobby from './Lobby.js';
import './App.css';

const AuthenticatedRoute = ({ component, ...rest }) => (
  <Route {...rest} render={props => (
    fakeAuth.isAuthenticated ? (
      React.createElement(component, props)
    ) : (
      <Redirect to={{
        pathname: process.env.PUBLIC_URL + '/login',
        state: { from: props.location }
      }}/>
    )
  )}/>
)

const LoginStatus = withRouter(({ history }) => (
  fakeAuth.isAuthenticated ? (
    <p>
      Welcome, {fakeAuth.name}! <button onClick={() => {
        fakeAuth.logOut(() => history.push(process.env.PUBLIC_URL + '/'))
      }}>Log out</button>
    </p>
  ) : (
    <p>
      <Link to={process.env.PUBLIC_URL + '/login'}>Log in</Link>
    </p>
  )
))

const LoginForm = withRouter(class extends Component {
  state = {
    name: fakeAuth.name || '',
    redirectToReferrer: false
  }

  login = () => {
    fakeAuth.logIn(this.state.name, () => {
      this.setState({ redirectToReferrer: true });
    });
  }

  updateName = (e) => {
    this.setState({ name: e.target.value });
  }

  render() {
    const { from } = this.props.location.state ||
        { from: { pathname: process.env.PUBLIC_URL + '/' } };
    const { redirectToReferrer, name } = this.state;

    if (redirectToReferrer) {
      return (
        <Redirect to={from}/>
      );
    }

    if (fakeAuth.isAuthenticated) {
      return (
        <Redirect to={{pathname: process.env.PUBLIC_URL + '/'}}/>
      );
    }

    var buttonAttrs = {};
    if (!this.state.name.trim()) {
      buttonAttrs.disabled = 'disabled';
    }
    return (
      <form className="LoginForm">
        <p>Please provide a name before playing:</p>
        <input value={name} onChange={this.updateName}/>
        <button onClick={this.login} {...buttonAttrs}>Log in</button>
      </form>
    );
  }
});


class GameBrowser extends Component {
  render() {
    return (
      <div className="GameBrowser">
        <h2>Game Browser</h2>
        <LoginStatus/>
        <Lobby/>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    const config = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);
    firebase.initializeApp(config);
  }

  render() {
    return (
      <div className="App">
        <BrowserRouter>
          <Switch>
            <AuthenticatedRoute path={process.env.PUBLIC_URL + '/game/:gameId'} component={Game}/>
            <Route path={process.env.PUBLIC_URL + '/login'} component={LoginForm}/>
            <Route component={GameBrowser}/>
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
