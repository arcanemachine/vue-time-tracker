<template>
  <div id="app">

		<h1 style="text-align: center; margin-bottom: 1em;">Vue - Time Tracker</h1>

    <h1>Activities</h1>

    <p v-if="!activities.length" class="mt-2 mb-4">
      You have not created any activities.
    </p>

    <activity v-for="activity in activities"
              :activity="activity"
              :key="activity.id"
              @activity-delete="activityDelete(activity)"
							@activity-update="activityUpdate($event)"
              @saved-timer-delete="savedTimerDelete(activity, $event)">

      <timer :activity="activity" @timer-save="timerSave($event.activity, $event.timer)"></timer>

    </activity>

    <add-activity @activity-create="activityCreate($event)"></add-activity>

    <h2 class="mt-4">Extra Links:</h2>
    <ul>
      <li @click="downloadTimerData" class="mt-2 ml-2 bold cursor-url">Download timer data</li>
    </ul>


    <transition name="fade">
      <div id="notification-message" v-if="showNotificationMessage" :style="notificationMessageStyle">{{ notificationMessage }}</div>
    </transition>

  </div>

</template>

<script>

import AddActivity from './components/AddActivity.vue'
import Activity from './components/Activity.vue'
import Timer from './components/Timer.vue'

export default {
  name: 'App',
  components: {
    AddActivity, Activity, Timer
  },
  data: function () {
    return {
      activities: [],
      activityListUrl: 'http://192.168.1.120:8000/api/v1/users/1/activities/',
      result: undefined,
      showNotificationMessage: false,
      notificationMessageStyle: {},
    }
  },
  mounted: function () {
    if (localStorage.getItem('activities')) {
      this.activities = JSON.parse(localStorage['activities']);
    } else {
      localStorage['activities'] = [];
    }
  },
  methods: {

    // notification message
    displayNotificationMessage: function (message, messageType='success', messageDisplayTime=3000) {
      // set the background color
      if (messageType === 'success') {
        this.notificationMessageStyle.backgroundColor = 'green';
      } else if (messageType === 'warning') {
        this.notificationMessageStyle.backgroundColor = 'yellow';
      } else if (messageType === 'danger') {
        this.notificationMessageStyle.backgroundColor = 'red';
      } 

      // display the message
      this.notificationMessage = message;
      this.showNotificationMessage = true;
      this.$helpers.sleep(messageDisplayTime).then(() => {
        this.showNotificationMessage = false;
      });
      
    },

    // activities
    getCurrentUnixTime: function () {
      return Math.floor(Date.now() / 1000);
    },
    activityCreate: function (newActivityName) {
      this.activities.push({
        id: this.activities.length,
        name: newActivityName,
        savedTimers: []
      });
      this.updateLocalStorage();
      this.displayNotificationMessage(`'${newActivityName}' has been created.`)
    },
		activityUpdate: function (activity) {
      this.activities[activity.id] = activity;
      this.updateLocalStorage();
      this.displayNotificationMessage(`'${activity.name}' has been successfully updated.`)
		},
    activityDelete: function (activity) {
      this.activities.splice(activity.id, 1);
      this.updateActivityIds();
      this.updateLocalStorage();
      this.displayNotificationMessage(`'${activity.name}' has been deleted.`)
    },
    updateActivityIds: function() {
      for (let i=0; i < this.activities.length; i++) {
        this.activities[i].id = i;
      }
      this.updateLocalStorage();
    },

    // timers
    timerSave: function (activity, timer) {
        let savedTimer = {};
        Object.assign(savedTimer, timer);
        activity.savedTimers.push({
          id: timer.startTime,
          timer: savedTimer,
          showTimerDetail: false,
          showDeletePanel: false
        });
        this.updateLocalStorage();
    },
    savedTimerDelete: function (activity, timerId) {
      let timerIndex = activity.savedTimers.findIndex(x => x.id === timerId);
      activity.savedTimers.splice(timerIndex, 1);
      this.updateLocalStorage();
    },

    // localStorage
    updateLocalStorage: function () {
      localStorage['activities'] = JSON.stringify(this.activities);
    },
		downloadTimerData: function () {
			var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.activities));
			var downloadAnchorNode = document.createElement('a');
			downloadAnchorNode.setAttribute("href",     dataStr);
			downloadAnchorNode.setAttribute("download", "timerData.json");
			document.body.appendChild(downloadAnchorNode); // required for firefox
			downloadAnchorNode.click();
			downloadAnchorNode.remove();
		},

    // fetch
    fetchData: function(url) {
      fetch(url)
        .then(response => response = response.json())
        .then(data => this.result = data);
    },
    fetchActivities: function () {
      this.fetchData(this.activityList);
      return this.result;
    },
  }
}
</script>

