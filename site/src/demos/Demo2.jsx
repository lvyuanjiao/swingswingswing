import React, { Component } from 'react';
import Swing from '../../../src';

export default class Demo1 extends Component {
  render() {
    const style = {
      width: '100%',
      height: '100%',
      backgroundColor: '#999',
      textAlign: 'center',
      lineHeight: '200px'
    };
    return (
      <div>
        <Swing
          width={300}
          height={200}
          orientation="vertical"
        >
          <div style={style}>slider 1</div>
          <div style={style}>slider 2</div>
          <div style={style}>slider 3</div>
        </Swing>
      </div>
    );
  }
}
