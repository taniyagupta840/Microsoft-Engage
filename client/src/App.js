import React from 'react';
import './App.css';

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
        {this.state.Token}<br />
        React + Express
      </div>
    );
  }
}

export default App;
