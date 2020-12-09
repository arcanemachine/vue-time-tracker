<template>
  <div class="timer mt-2 ml-4 mb-2">
    <div id="timer-buttons">
      <button @click="startTimer()" :disabled="startButtonDisabled">start</button>
      <button @click="pauseTimer()" :disabled="pauseButtonDisabled">pause</button>
      <button @click="resumeTimer()" :disabled="resumeButtonDisabled">resume</button>
      <button @click="stopTimer()" :disabled="stopButtonDisabled">stop</button>
      <button @click="timerSave()" :disabled="saveButtonDisabled">save timer</button>
      <button @click="showTimerResetPanel = !showTimerResetPanel" :disabled="resetButtonDisabled">reset</button>

      <span id="server-stuff" v-if="timer.startTime" style="margin-top: 1em;">
        <button @click="uploadToServer(timer)">Upload to server</button>
      </span>

      <span v-if="showTimerResetPanel" class="ml-2">
        Are you sure?
        <button class="ml-2" @click="resetTimer()">Yes</button>
        <button @click="showTimerResetPanel = !showTimerResetPanel">Cancel</button>
      </span>

      <button v-if="showDebugInfoButton" @click="showDebugInfo = !showDebugInfo">debug info</button>

    </div>


    <div id="timer-display" style="margin-top: 2em;">{{ formattedTimer }}</div>

    <div id="debug-info" v-show="showDebugInfo" style="margin-top: 2em;">
      <p>id: {{ timer.id }}</p>
      <p>activity: #{{ activity.id }}: {{ activity.name }}</p>
      <p>startTime: {{ timer.startTime }}</p>
      <p>stopTime: {{ timer.stopTime }}</p>
      <p>lastUpdateTime: {{ timer.lastUpdateTime }}</p>
      <p>runSeconds: {{ timer.runSeconds }}</p>
      <p>pauseSeconds: {{ timer.pauseSeconds }}</p>
      <p>isRunning: {{ timer.isRunning }}</p>

      <p style="margin-top: 2em;"><button @click="downloadFromServer()">Download from server</button></p>
      <p>serverPayload: {{ serverPayload }}</p>
    </div>

  </div>
</template>

<script>
export default {
  name: 'Timer',
  props: ['activity'],
  data: function () {
    return {
      // props
      userId: 1,
      timerId: 1,

      formattedTimer: '00:00:00',
      currentTime: 0,

      elapsedSeconds: 0,
      polling: null,

      timer: {
        id: null,
        startTime: null,
        stopTime: null,
        lastUpdateTime: null,
        runSeconds: 0,
        pauseSeconds: 0,
        isRunning: false,
      },

      startButtonDisabled: false,
      pauseButtonDisabled: true,
      resumeButtonDisabled: true,
      stopButtonDisabled: true,
      saveButtonDisabled: true,
      resetButtonDisabled: true,

      showTimerResetPanel: false,

      serverPayload: undefined,
      showDebugInfoButton: true,
      showDebugInfo: false,
    };
  },
  methods: {

    // server storage logic
    uploadToServer: function () {
      this.serverPayload = {};
      let putData = this.createServerTimerObject(this.timer);
      fetch('http://192.168.1.120:8000/api/v1/users/1/activities/1/timers/1/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(putData)
      })
        .then(response => response = response.json())
        .then(data => this.serverPayload = data);
    },
    downloadFromServer: function () {
      this.serverPayload = {};
      let timerUrl = 'http://192.168.1.120:8000/api/v1/users/1/activities/1/timers/1/';
      fetch(timerUrl)
        .then(response => response = response.json())
        .then(data => this.updateLocalTimerObject(data));

    },
    createServerTimerObject: function(timer) {
      return {
        start_time: timer.startTime,
        stop_time: timer.stopTime,
        last_update_time: timer.lastUpdateTime,
        run_seconds: timer.runSeconds,
        pause_seconds: timer.pauseSeconds,
        is_running: timer.isRunning
      };
    },

    // local storage logic
    updateLocalTimerObject: function(data) {
      this.timer.id = data['id'];
      this.timer.activity = data['activity'];
      this.timer.startTime = data['start_time'];
      this.timer.stopTime = data['stop_time'];
      this.timer.lastUpdateTime = data['last_update_time'];
      this.timer.runSeconds = data['run_seconds'];
      this.timer.pauseSeconds = data['pause_seconds'];
    },
    timerSave: function() {
      this.stopTimer();
      this.$emit('timer-save', {
        activity: this.activity,
        timer: this.timer
      });
      this.initializeTimer();
      this.updateDisplay()
      this.disableButtons(['pause', 'resume', 'stop', 'save', 'reset']);
    },

    // timer logic
    initializeTimer: function () {
      // deleteme
      this.timer.startTime = null;
      this.timer.stopTime = null;
      this.timer.lastUpdateTime = null;
      this.timer.runSeconds = 0;
      this.timer.pauseSeconds = 0;
      this.timer.isRunning = false;
    },
    startTimer: function () {
      if (this.timer.isRunning) {return undefined;}
      this.timer.startTime = this.getCurrentUnixTime();
      this.timer.id = this.timer.startTime;
      this.timer.lastUpdateTime = this.timer.startTime;

      this.timer.isRunning = true;
      this.polling = setInterval(() => {return this.updateDisplay()}, 200);

      this.disableButtons(['start', 'resume', 'save']);
    },
    pauseTimer: function () {
      if (this.timerIsStopped() || this.timerIsPaused()) {return undefined;}
      this.timer.runSeconds += this.getSecondsSinceLastUpdate();
      this.timer.lastUpdateTime = this.getCurrentUnixTime();

      this.timer.isRunning = false;
      clearInterval(this.polling);
      this.updateDisplay()

      this.disableButtons(['start', 'pause', 'save']);
    },
    resumeTimer: function () {
      if (this.timer.isRunning) {return false;}
      this.currentTime = this.getCurrentUnixTime();
      this.elapsedSeconds = this.getSecondsSinceLastUpdate();
      this.timer.lastUpdateTime = this.currentTime;
      this.timer.stopTime = 0;

      this.timer.isRunning = true;
      this.updateDisplay()
      this.polling = setInterval(() => {return this.updateDisplay()}, 200);

      this.disableButtons(['start', 'resume', 'save']);
    },
    stopTimer: function () {
      if (this.timerIsStopped()) {return undefined;}
      else if (this.timerIsPaused()) {this.timer.pauseSeconds += this.getSecondsSinceLastUpdate();}
      else if (this.timer.isRunning) {this.timer.runSeconds += this.getSecondsSinceLastUpdate();}
      this.timer.stopTime = this.getCurrentUnixTime();
      this.timer.lastUpdateTime = this.timer.stopTime;

      this.timer.isRunning = false;
      clearInterval(this.polling);

      this.updateDisplay()
      this.disableButtons(['start', 'pause', 'stop']);
    },
    resetTimer: function () {
      this.timer.startTime = null;
      this.timer.stopTime = null;
      this.timer.lastUpdateTime = null;
      this.timer.runSeconds = 0;
      this.timer.pauseSeconds = 0;
      this.timer.isRunning = false;

      this.updateDisplay()
      this.showTimerResetPanel = false;
      this.disableButtons(['pause', 'resume', 'stop', 'save', 'reset']);
    },
    getTimestamp: function (time) {
      return Math.floor(time / 1000);
    },
    getCurrentTime: function () {
      return new Date();
    },
    getCurrentUnixTime: function () {
      return Math.floor(Date.now() / 1000);
    },
    getSecondsSinceLastUpdate: function () {
      return (this.getCurrentUnixTime() - this.timer.lastUpdateTime);
    },
    timerIsPaused: function () {
      if (this.timer.lastUpdateTime !== this.timer.stopTime && !this.timer.isRunning) {return true;}
      else {return false;}
    },
    timerIsStopped: function () {
      if (this.timer.lastUpdateTime === this.timer.stopTime && !this.timer.isRunning) {return true;}
      else {return false;}
    },
    getUUID: function () {
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    },
    // user interface
    zeroPadder: function (yourNumber, minLength=2) {
      // get the minimum length of the result
      let sliceLength = minLength;
      let numLength = String(yourNumber).length;
      if (numLength > minLength) {sliceLength = numLength;}
      
      // create a string of zeroes
      let zeroString = '';
      for (let i = 0; i < sliceLength; i++) {zeroString += '0';}
      
      // return a string that is at least the length of minLength
      return (zeroString + String(yourNumber)).slice(numLength);
    },
    getFormattedTime: function () {
      // get elapsed time
      if (!this.timer.startTime) {
        return '00:00:00';
      }
      if (this.timer.isRunning) {
        this.elapsedSeconds = this.getSecondsSinceLastUpdate() + this.timer.runSeconds;
      } else {
        this.elapsedSeconds = this.timer.runSeconds;
      }

      // convert to timer display format
      let seconds = this.elapsedSeconds % 60;
      let minutes = Math.floor((this.elapsedSeconds / 60) % 60);
      let hours = Math.floor(this.elapsedSeconds / 3600);

      return this.zeroPadder(hours) +':'+ this.zeroPadder(minutes) +':'+ this.zeroPadder(seconds);
    },
    updateDisplay: function () {
      this.formattedTimer = this.getFormattedTime();
    },
    disableButtons: function (buttonsToDisable) {
      if (buttonsToDisable.includes('start')) {
        this.startButtonDisabled = true;
      } else {
        this.startButtonDisabled = false;
      }
      if (buttonsToDisable.includes('pause')) {
        this.pauseButtonDisabled = true;
      } else {
        this.pauseButtonDisabled = false;
      }
      if (buttonsToDisable.includes('resume')) {
        this.resumeButtonDisabled = true;
      } else {
        this.resumeButtonDisabled = false;
      }
      if (buttonsToDisable.includes('stop')) {
        this.stopButtonDisabled = true;
      } else {
        this.stopButtonDisabled = false;
      }
      if (buttonsToDisable.includes('save')) {
        this.saveButtonDisabled = true;
      } else {
        this.saveButtonDisabled = false;
      }
      if (buttonsToDisable.includes('reset')) {
        this.resetButtonDisabled = true;
      } else {
        this.resetButtonDisabled = false;
      }
    }
  }
}
</script>
