import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import React from "react";
import firebase from 'firebase';

const config = {
    apiKey: "AIzaSyAKvkSFi4_G0SY2EE6W9bzIU5MsH6PDI20",
    authDomain: "engage-be755.firebaseapp.com",
    projectId: "engage-be755",
    storageBucket: "engage-be755.appspot.com",
    messagingSenderId: "417055963386",
    appId: "1:417055963386:web:63a75a24c321aa60a8b143",
    measurementId: "G-97ZL8NQF5H"
  };
firebase.initializeApp(config);

const uiConfig = {

  signInFlow: 'popup',

  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false,
  },
};

export default class SignInScreen extends React.Component {
  constructor(props) {
    super(props);
    this.unregisterAuthObserver = undefined;
    this.state = {
      isSignedIn: false
    }
  }

  componentDidMount() {
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
      this.setState({isSignedIn: !!user});
      this.props.onAuthentication(this.state.isSignedIn);
    });
  }

  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  render() {
    return(
      <div>
        { 
          !this.state.isSignedIn &&
          <div className="Center">
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
          </div>
        }
        { 
          this.state.isSignedIn &&
          <div>
            {/* <p>Welcome {firebase.auth().currentUser.displayName}! You are now signed-in!</p> */}
            {/* <a onClick={() => firebase.auth().signOut()}>Sign-out</a> */}
          </div>
        }
      </div>
    );
  }
}
