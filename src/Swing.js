import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Swiper, { HORIZONTAL, VERTICAL, LEFT, RIGHT, UP, DOWN } from './Swiper';

export default class Swing extends Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    orientation: PropTypes.string,
    children: PropTypes.node,
    views: PropTypes.number,
    index: PropTypes.number,
    space: PropTypes.number,
    center: PropTypes.bool,
    autoplay: PropTypes.number,
    transitionDuration: PropTypes.number,
    onIndexChange: PropTypes.func
  };

  static defaultProps = {
    orientation: 'horizontal',
    index: 0,
    views: 1,
    space: 0,
    center: false,
    autoplay: 0,
    transitionDuration: 300,
    onIndexChange: () => {}
  };

  constructor(props) {
    super(props);
    this.translateTo = this.translateTo.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.touchEnd = this.touchEnd.bind(this);
    this.speed = this.speed.bind(this);
    this.offset = this.offset.bind(this);
    this.state = this.props2state(props);
  }

  componentDidMount() {
    const { index, transitionDuration, autoplay } = this.props;
    this.translateTo(index, transitionDuration);
    this.play(autoplay);
  }

  componentWillReceiveProps(newProps) {
    this.setState(this.props2state(newProps));
    if (newProps.autoplay && newProps.autoplay !== this.props.autoplay) {
      this.play(newProps.autoplay);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.width !== nextProps.width ||
      this.props.height !== nextProps.height ||
      this.props.orientation !== nextProps.orientation ||
      this.props.views !== nextProps.views ||
      this.props.space !== nextProps.space ||
      this.props.center !== nextProps.center ||
      this.props.autoplay !== nextProps.autoplay ||
      this.props.transitionDuration !== nextProps.transitionDuration) {
      return true;
    }
    if (this.state.index !== nextState.index) {
      return true;
    }
    return false;
  }

  componentDidUpdate() {
    const { transitionDuration } = this.props;
    const { index } = this.state;
    this.translateTo(index, transitionDuration);
  }

  componentWillUnmount() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  play = (autoplay) => {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    if (autoplay) {
      const { onIndexChange } = this.props;
      this.timerId = setInterval(() => {
        this.setState(preState => ({
          index: this.isLastIndex(preState.index) ? 0 : (preState.index + 1)
        }));
        onIndexChange(this.state.index);
      }, autoplay);
    }
  }

  props2state = (props) => {
    let index = (this.state && this.state.index) || 0;
    const {
      orientation,
      width,
      height,
      views,
      index: targetIndex,
      center,
      space,
      children: { length }
    } = props;
    const isVertical = orientation === 'vertical';
    const lastIndex = (length - (center ? 1 : views));
    if (targetIndex < 0) {
      index = 0;
    } else if (targetIndex >= lastIndex) {
      index = lastIndex;
    } else {
      index = targetIndex;
    }
    const calcViewSize = total => (total - ((views - 1) * space)) / views;
    const sizePerView = calcViewSize(isVertical ? height : width);
    return {
      index,
      lastIndex,
      isVertical,
      sizePerView,
      wrapSize: sizePerView * length,
      initialOffset: center ? (width / 2) - (width / views / 2) : 0
    };
  }

  offset(index, speed = 0) {
    const { sizePerView } = this.state;
    const { space } = this.props;
    return (-index * (sizePerView + space)) + speed;
  }

  speed(index, move) {
    return this.isOutOfRange(index, move) ? (move / 4) : move;
  }

  translateTo(index, duration = 0, speed = 0) {
    const { isVertical, initialOffset } = this.state;
    const distance = initialOffset + this.offset(index, speed);
    this.swiper.style.transitionDuration = `${duration}ms`;
    this.swiper.style.transform = isVertical ? `translate3d(0px, ${distance}px, 0px)` : `translate3d(${distance}px, 0px, 0px)`;
  }

  isFirstIndex = index => index <= 0;
  isLastIndex(index) {
    const { lastIndex } = this.state;
    return index >= lastIndex;
  }
  isMovePrev = move => move > 0;
  isMoveNext = move => move < 0;

  isOutOfRange = (index, move) =>
    ((this.isFirstIndex(index) && this.isMovePrev(move))
    || (this.isLastIndex(index) && this.isMoveNext(move)));

  touchMove(pos) {
    const { orientation, x, y } = pos;
    const { isVertical, index } = this.state;
    if ((orientation === HORIZONTAL && !isVertical) || (orientation === VERTICAL && isVertical)) {
      const moveSpeed = this.speed(index, isVertical ? y : x);
      this.translateTo(index, 0, moveSpeed);
    }
  }

  touchEnd(pos) {
    const { index, isVertical, lastIndex } = this.state;
    const { width, height, views, onIndexChange } = this.props;
    const { direction, velocity, x, y } = pos;
    let nextIndex = index;

    const measure = {
      prev: !isVertical ? RIGHT : DOWN,
      next: !isVertical ? LEFT : UP,
      distance: !isVertical ? width : height,
      move: !isVertical ? x : y
    };

    if (Math.abs(measure.move) > (measure.distance / views / 2)) {
      const next = parseInt((Math.abs(measure.move) / (measure.distance / views)).toFixed(0), 10);
      if (measure.move > 0) {
        nextIndex = index - next;
      } else {
        nextIndex = index + next;
      }
    } else if (direction && Math.abs(velocity) >= 200) {
      if (direction === measure.prev) {
        nextIndex = index - 1;
      } else if (direction === measure.next) {
        nextIndex = index + 1;
      }
    }

    if (this.isFirstIndex(nextIndex)) {
      nextIndex = 0;
    } else if (this.isLastIndex(nextIndex)) {
      nextIndex = lastIndex;
    }

    if (index !== nextIndex) {
      this.setState({ index: nextIndex });
      onIndexChange(nextIndex);
    } else {
      this.translateTo(index, 300);
    }
  }

  render() {
    const { width, height, space } = this.props;
    const { isVertical, sizePerView, wrapSize } = this.state;

    const items = this.props.children.map((ele, i) => {
      const itemStyle = {
        width: isVertical ? width : sizePerView,
        height: isVertical ? sizePerView : height,
        marginRight: isVertical ? null : space,
        marginBottom: isVertical ? space : null,
        position: 'relative',
        float: isVertical ? 'none' : 'left'
      };
      return React.createElement('div', { style: itemStyle, key: i }, ele);
    });

    const wrap = React.createElement('div', {
      ref: (ref) => {
        this.swiper = ReactDOM.findDOMNode(ref);
      },
      style: {
        position: 'relative',
        width: isVertical ? width : wrapSize,
        height: isVertical ? wrapSize : height
      }
    }, items);

    return React.createElement(Swiper, {
      onMove: this.touchMove,
      onEnd: this.touchEnd,
      style: { width, height, overflow: 'hidden' }
    }, wrap);
  }
}
