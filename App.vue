<template>
  <div id="app">
      <h1 style="text-align: center; margin-bottom: 1em;">Vue - Time Tracker</h1>


    <h2>Activities</h2>


    <p v-if="!activities.length" class="mt-2 mb-4">
      You have not created any activities.
    </p>

    <add-activity @activity-create="activityCreate($event)"></add-activity>

    <activity v-for="activity in activities"
              :activity="activity"
              :key="activity.id"
              @activity-delete="activityDelete(activity)">

      <timer :activity="activity" @timer-save="timerSave($event.activity, $event.timer)"></timer>

    </activity>


    <transition name="fade">
      <div id="notification-message" v-if="showNotificationMessage" :style="notificationStyle">Test Message</div>
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
      notificationStyle: {
        backgroundColor: '#0099CC'
      },
    }
  },
  created: function () {
    if (localStorage.getItem('activities')) {
      this.activities = JSON.parse(localStorage['activities']);
    }
  },
  methods: {

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
    },
    activityDelete: function (activity) {
      this.activities.splice(activity.id, 1);
      this.updateActivityIds();
      this.updateLocalStorage();
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
          showDebugInfo: true
        });
        this.updateLocalStorage();
    },

    // localStorage
    updateLocalStorage: function () {
      localStorage['activities'] = JSON.stringify(this.activities);
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

