import React, { Component, PropTypes } from 'react';

export const VERTICAL = 'VERTICAL';
export const HORIZONTAL = 'HORIZONTAL';
export const UP = 'UP';
export const DOWN = 'DOWN';
export const RIGHT = 'RIGHT';
export const LEFT = 'LEFT';

export default class Swiper extends Component {
  static propTypes = {
    tagName: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
    onStart: PropTypes.func,
    onMove: PropTypes.func,
    onEnd: PropTypes.func
  };
  static defaultProps = {
    tagName: 'div',
    onStart() {},
    onMove() {},
    onEnd() {}
  };

  constructor(props) {
    super(props);
    this.touchStart = this.touchStart.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.touchEnd = this.touchEnd.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.queue = [];
  }

  getCurrentPosition = (e) => {
    let x = 0;
    let y = 0;
    try {
      const { pageX, pageY } = e.touches[0];
      x = pageX;
      y = pageY;
    } catch (err) {
      x = e.pageX;
      y = e.pageY;
    }
    return { x, y };
  }

  touchStart(e) {
    e.preventDefault();
    this.startPosition = this.getCurrentPosition(e);
    this.props.onStart(this.startPosition);
  }

  touchMove(e) {
    e.preventDefault();
    let curPos = this.getCurrentPosition(e);
    const x = curPos.x - this.startPosition.x;
    const y = curPos.y - this.startPosition.y;
    this.currentPosition = { x, y };
    if (!this.orientation) {
      curPos = this.currentPosition || { x: 0, y: 0 };
      if (Math.abs(curPos.y) < 2 && Math.abs(curPos.x) < 2) {
        return;
      }
      const offset = Math.abs(curPos.y) - Math.abs(curPos.x);
      if (offset === 0) {
        return;
      }
      this.orientation = (offset > 0) ? VERTICAL : HORIZONTAL;
    }

    this.queue.push([this.orientation === VERTICAL ? y : x, new Date().getTime()]);
    if (this.queue.length > 50) {
      this.queue.shift();
    }

    this.props.onMove({
      ...this.currentPosition,
      orientation: this.orientation
    });
  }

  touchEnd(e) {
    e.preventDefault();
    const { currentPosition, orientation, queue } = this;
    const isHorizontal = (orientation === HORIZONTAL);
    let direction;
    let velocity = 0;

    const currentTime = new Date().getTime();
    while (queue.length && queue[0][1] < (currentTime - 300)) {
      queue.shift();
    }

    if (queue.length >= 2) {
      const first = queue[0];
      const last = queue[queue.length - 1];
      const distance = last[0] - first[0];
      const time = (last[1] - first[1]) / 1000;
      velocity = distance / time;
    }

    if (velocity > 0) {
      direction = isHorizontal ? RIGHT : DOWN;
    } else if (velocity < 0) {
      direction = isHorizontal ? LEFT : UP;
    }

    this.props.onEnd({
      ...currentPosition,
      orientation,
      direction,
      velocity
    });

    this.orientation = null;
    this.startPosition = null;
    this.currentPosition = null;
    this.queue.splice(0);
  }

  mouseDown(e) {
    this.touchStart(e);
  }

  mouseMove(e) {
    if (this.startPosition) {
      this.touchMove(e);
    }
  }

  mouseUp(e) {
    if (this.startPosition) {
      this.touchEnd(e);
    }
  }

  render() {
    return (
      <this.props.tagName
        className={ this.props.className }
        style={ this.props.style }
        onTouchStart={ this.touchStart }
        onTouchMove={ this.touchMove }
        onTouchEnd={ this.touchEnd }
        onMouseDown={ this.mouseDown }
        onMouseMove={ this.mouseMove }
        onMouseUp={ this.mouseUp }
        onMouseLeave={ this.mouseUp }
      >
        {this.props.children}
      </this.props.tagName>
    );
  }
}
