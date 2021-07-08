import React from "react";
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { firebaseAuth, GoogleAuthProvider, EmailAuthProvider } from './FirebaseConfig';
import { Grid } from '@material-ui/core';

const uiConfig = {

  signInFlow: 'popup',

  signInOptions: [
    GoogleAuthProvider,
    EmailAuthProvider
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
    this.unregisterAuthObserver = firebaseAuth.onAuthStateChanged(user => {
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
              <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebaseAuth} />
            </Grid>
          </Grid>
        }
      </div>
    );
  }
}
