import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

let firebaseConfigValid = false;
try {
  JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);
  firebaseConfigValid = true;
} catch (e) {
  console.error('Invalid REACT_APP_FIREBASE_CONFIG:', e.message);
}
if (firebaseConfigValid) {
  ReactDOM.render(<App />, document.getElementById('root'));
  registerServiceWorker();
}
