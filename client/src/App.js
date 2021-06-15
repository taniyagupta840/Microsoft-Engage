import React from 'react';
import './App.css';
import MakeCall from './Components/MakeCall';
import { initializeIcons } from '@fluentui/react';

initializeIcons();

function App() {
    return (
      <div className="ms-Fabric">
        <MakeCall/>
      </div>
    ); 
}

export default App;
