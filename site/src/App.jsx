import React from 'react';

import Demo1 from './demos/Demo1';
import Demo2 from './demos/Demo2';

const App = () => (<div>
  <h1>Demo</h1>
  <h2>Default</h2>
  <Demo1 />
  <h2>Vertical</h2>
  <Demo2 />
</div>);

App.propTypes = {
  children: React.PropTypes.node
};

export default App;
