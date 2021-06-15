import React from 'react';
import './App.css';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      Token: undefined
    };
  }

  componentDidMount(){
    this.getResponse();
  }

  getResponse = () => {
    fetch("/acs-token")
      .then(res => res.text())
      .then(token => this.setState({Token: token}));
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <h1>React + Express</h1>
        </div>
        <div>
          <p>generated-token: </p>
            {this.state.Token} <br />
        </div>
      </div>
    );
  }
}

export default App;
