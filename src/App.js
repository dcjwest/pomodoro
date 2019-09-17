import React from 'react';
import './App.css';

let countDown; // Counter to track time left on clock
let delay; // Handle delay between switching timers 

class Timer extends React.Component {
  constructor(props) {
    super(props);

    // Function bindings

    this.decreaseTimer = this.decreaseTimer.bind(this);
    this.increaseTimer = this.increaseTimer.bind(this);
  }

  // Function definitions

  decreaseTimer() {
    this.props.updateTimer(this.props.timerType, this.props.decTimer);
  }

  increaseTimer() {
    this.props.updateTimer(this.props.timerType, this.props.incTimer);
  }

  render() {
    return (
      <div className="timer-control flex-container">
        <p>{this.props.timerType + " Duration"}</p>
        <div className="timer-btn-group">
          <button title="Decrease" onClick={this.decreaseTimer}>
            <i className="fa fa-arrow-down"></i>
          </button>
          <p>{this.props.timerLength}</p>
          <button title="Increase" onClick={this.increaseTimer}>
            <i className="fa fa-arrow-up"></i>
          </button>
        </div>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTimer: "Work",
      workLength: 25, // Work duration in minutes
      breakLength: 5, // Break duration in minutes
      timeLeft: 1500, // Time on the clock in seconds
      timerRunning: false,
      alarmPlaying: false
    }
    // Function bindings

    this.setTimerLength = this.setTimerLength.bind(this);
    this.setClock = this.setClock.bind(this);
    this.startStopClock = this.startStopClock.bind(this);
    this.switchTimers = this.switchTimers.bind(this);
    this.playPauseAlarm = this.playPauseAlarm.bind(this);
    this.resetClock = this.resetClock.bind(this);
  }

  // Function definitions

  setTimerLength(timerType, timerControl) {
    // If current timer on the clock is the same as the one whose controls are being clicked make changes to both
    let sameCurrentTimer = timerType === this.state.currentTimer? true : false;

    /* Decrease or increase timer durations (and clock if applicable) accordingly.
    Timer duration changes are in minutes; clock changes in seconds */
    switch(timerControl) {
      case "work-decrement":
        this.setState({
          workLength: this.state.workLength > 1? this.state.workLength - 1 : this.state.workLength,
          timeLeft: sameCurrentTimer?
            this.state.timeLeft > 60? this.state.timeLeft - 60 : this.state.timeLeft
            : this.state.timeLeft
        });
        return;

      case "work-increment":
        this.setState({
          workLength: this.state.workLength < 60? this.state.workLength + 1 : this.state.workLength,
          timeLeft: sameCurrentTimer?
            this.state.timeLeft < 3600? this.state.timeLeft + 60 : this.state.timeLeft
            : this.state.timeLeft
        });
        return;

      case "break-decrement":
        this.setState({
          breakLength: this.state.breakLength > 1? this.state.breakLength - 1 : this.state.breakLength,
          timeLeft: sameCurrentTimer?
            this.state.timeLeft > 60? this.state.timeLeft - 60 : this.state.timeLeft
            : this.state.timeLeft
        });
        return;

      case "break-increment":
        this.setState({
          breakLength: this.state.breakLength < 60? this.state.breakLength + 1 : this.state.breakLength,
          timeLeft: sameCurrentTimer?
            this.state.timeLeft < 3600? this.state.timeLeft + 60 : this.state.timeLeft
            : this.state.timeLeft
        });
        return;
      default: return;
    }
  }

  setClock() {
    // Calculate remaining minutes and seconds. Note: state's "timeLeft" given in seconds
    let minutes = Math.floor(this.state.timeLeft / 60);
    let seconds = this.state.timeLeft - minutes * 60;

    // Set clock minutes and seconds as strings
    minutes = minutes < 10? "0" + minutes : minutes;
    seconds = seconds < 10? "0" + seconds : seconds;

    return `${minutes}:${seconds}`;
  }

  startStopClock() {
    // If clock is currently running, pause it by clearing the timer counter
    if(this.state.timerRunning) {
      this.setState({
        timerRunning: false
      });
      clearInterval(countDown);
    }
    // If the clock is currently stopped, start the count down
    else {
      this.setState({
        timerRunning: true
      });
      countDown = setInterval(() => {
        // Continuously update state by removing one second every second until timeLeft is zero
        if(this.state.timeLeft > 0) {
          this.setState({
            timeLeft: this.state.timeLeft - 1
          });
        }
        // Once timeLeft reaches zero, play the alarm and switch the timers
        else {
          this.playPauseAlarm();
          delay = setTimeout(this.switchTimers, 3000);
        }
      }, 1000);
    }
    return;
  }

  switchTimers(){
    // First determine the next timer and get its duration
    let currentTimer = this.state.currentTimer;
    let nextTimer = currentTimer === "Work"? "Break" : "Work";
    let nextTimerLength = currentTimer === "Work"? this.state.workLength : this.state.breakLength;

    // Clear the timer counter and update state with next timer's parameters
    clearInterval(countDown);
    this.setState({
      currentTimer: nextTimer,
      timeLeft: nextTimerLength * 60,
      timerRunning: false,
      alarmPlaying: false
    });

    // Start the clock again with the next timer
    this.startStopClock();
    return;
  }

  playPauseAlarm() {
    const alarm = document.getElementById("beep");

    if (this.state.alarmPlaying) {
      alarm.pause();
      alarm.currentTime = 0;
    }
    else {
      alarm.currentTime = 0;
      alarm.play();
    }

    this.setState({
      alarmPlaying: !this.state.alarmPlaying
    });
    return;
  }

  resetClock(){
    // If user resets clock while alarm is playing, turn it off
    if (this.state.alarmPlaying) {
      this.playPauseAlarm();
      clearTimeout(delay);
    }

    // Stop the timer counter and set state to default settings
    clearInterval(countDown);
    this.setState({
      currentTimer: "Work",
      workLength: 25,
      breakLength: 5,
      timeLeft: 1500,
      timerRunning: false,
      alarmPlaying: false
    });
  }

  render() {
    return (
      <div id="app">
        <h1 id="title">Pomodoro Clock</h1>
        <div id="timer-controls" className="flex-container">
          <Timer
            timerType="Work"
            incTimer="work-increment"
            decTimer="work-decrement"
            timerLength={this.state.workLength}
            updateTimer={this.setTimerLength} />
          <Timer
            timerType="Break"
            incTimer="break-increment"
            decTimer="break-decrement"
            timerLength={this.state.breakLength}
            updateTimer={this.setTimerLength} />
        </div>
        <h2 id="clock-label">{this.state.currentTimer}</h2>
        <div id="clock-face" className="flex-container">
          <div id="time-left">{this.setClock()}</div>
        </div>
        <div id="clock-controls" className="flex-container">
          <button id="start-stop" title="Start/Stop" onClick={this.startStopClock}>
            <i className="fa fa-play"></i>
            <i className="fa fa-pause"></i>
          </button>
          <button id="reset" title="Reset" onClick={this.resetClock}>
            <i className="fa fa-retweet"></i>
          </button>
        </div>
        <audio id="beep" src="https://goo.gl/65cBl1" preload="auto"></audio>
      </div>
    );
  }
}

export default App;
