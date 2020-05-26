import React from 'react';
import { RecoilRoot } from 'recoil';
import Exp from "./Exp1"

function App() {
  return (
    <RecoilRoot>
      <div className="App">
        <header className="App-header">
          <h1>Demo Recoil + CRDT/Automerge</h1>
          <Exp />
        </header>
      </div>
    </RecoilRoot>
  );
}

export default App;
