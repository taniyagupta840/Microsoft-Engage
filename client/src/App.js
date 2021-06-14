import React from 'react';
import logo from './logo.svg';
import './App.css';
import { token } from 'morgan';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      Token:undefined
    };
  }

  componentDidMount(){
    this.getResponse();
  }

  getResponse = () => {
    fetch("/users")
      .then(res => res.text())
      .then(Token => this.setState({Token}));
  }

  render() {
    return (
      <div>
        {this.state.Token}
      </div>
    );
  }
}

export default App;
