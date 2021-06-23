import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import React from "react";
import firebase from 'firebase';
import { Grid } from '@material-ui/core';

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
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{ minHeight: '100vh' }}
          >
            <Grid>
              <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
            </Grid>
          </Grid>
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
