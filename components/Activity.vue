<template>
<div class="mt-3">
  <span>{{ activity.id + 1 }}.

    <span class="bold cursor-url"
          @click="showActivityTimeTracker = !showActivityTimeTracker">
      {{ activity.name }}
    </span>

    <button @click="showActivityModifyPanel = !showActivityModifyPanel"
            v-if="showActivityTimeTracker"
            class="ml-1 mr-1">
      Edit this Activity
    </button>

    <span v-if="showActivityModifyPanel">

      <button v-if="!showActivityUpdateNamePanel" @click="showActivityUpdateNamePanel = !showActivityUpdateNamePanel" class="ml-2">Change Name</button>
      <span v-if="showActivityUpdateNamePanel">
        <span class="ml-2">New name: </span>
        <input type="text"
               @keyup.enter="activityUpdateName"
               v-model="newActivityName">
        <button @click="activityUpdateName" class="ml-1">Confirm</button>
        <button @click="showActivityUpdateNamePanel = false" class="ml-1">Cancel</button>
      </span>

      <button v-if="!showActivityDeletePanel"
              @click="showActivityDeletePanel = !showActivityDeletePanel"
              class="ml-2">

        Delete Activity</button>
      <span v-if="showActivityDeletePanel">

          <span class="ml-3">Are you sure you want to delete this activity?</span>

          <button @click="emitActivityDeleteEvent"
                  class="ml-1">
            Confirm
          </button>

          <button @click="showActivityDeletePanel = false"
                  class="ml-1">
            Cancel
          </button>

      </span>

    </span>

  </span>

  <div v-if="showActivityTimeTracker">
    <slot></slot>

    <div class="mt-3 ml-2">

      <span v-if="activity.savedTimers"
            @click="showSavedTimers = !showSavedTimers"
            class="cursor-url">
        <button v-if="!showSavedTimers">Show saved timers</button>
      </span>

      <div v-if="showSavedTimers">
          <button @click="showSavedTimers = !showSavedTimers" class="mb-2">Hide saved timers</button>
        <p class="ml-2">
          <span v-if="!activity.savedTimers.length">You have no saved timers for this activity.</span>
        </p>
        <ol>

          <li v-for="obj in activity.savedTimers.slice().reverse()"
              :key="obj.id"
              class="mb-2">

            <span class="mt-1 bold cursor-url"
              @click="obj.showTimerDetail = !obj.showTimerDetail">
              {{ $helpers.getFormattedTimerTime(obj.timer.runSeconds) }}
            </span>

            <div v-if="obj.showTimerDetail">

              <ul class="mt-1">
                <li>Start: {{ getFormattedDateFromTimestamp(obj.timer.startTime) }}</li>
                <li>Finish: {{ getFormattedDateFromTimestamp(obj.timer.stopTime) }}</li>
                <li class="mt-1">Time Paused: {{ $helpers.getFormattedTimerTime(obj.timer.pauseSeconds) }}</li>
              </ul>

              <div class="mt-1 mb-2 ml-3">

                <button @click="obj.showDeletePanel = !obj.showDeletePanel"
                      class="mt-1 mb-1 bold cursor-url">
                  Delete this timer
                </button>

                <span v-if="obj.showDeletePanel">
                  <span class="ml-2">Are you sure?</span>

                  <button @click="emitSavedTimerDeleteEvent(obj.timer.id)"
                          class="ml-1">
                    Yes
                  </button>

                  <button @click="obj.showDeletePanel = false"
                          class="ml-1">
                    No
                  </button>

                </span>

              </div>

            </div>
          </li>
        </ol>
      </div>
      

      <div class="mt-2">
        <button v-if="!showTodayTimers" @click="showTodayTimers = true">Show today's timers</button>
        <button v-else @click="showTodayTimers = false">Hide today's timers</button>

        <div v-if="showTodayTimers">
          <div class="mt-2 ml-2">Timers for {{ getFormattedDate(Date.now()) }}:</div>
          <ul>
            <li v-if="!todayTimers.length">None</li>
            <li v-else v-for="todayTimer in todayTimers" :key="todayTimer.id">{{ getFormattedTimeFromTimeStamp(todayTimer.startTime) }} - {{ getFormattedTimeFromTimeStamp(todayTimer.stopTime) }} (<span class="bold">{{ $helpers.getFormattedTimerTime(todayTimer.runSeconds) }}</span>)</li>
          </ul>
        </div>

      </div>

    </div>

  </div>

</div>
</template>

<script>



export default {
  name: 'Activity',
  props: ['activity'],
  data: function () {
    return {
      showActivityTimeTracker: true,
      showActivityModifyPanel: false,
      showActivityUpdateNamePanel: false,
      newActivityName: "",
      showActivityDeletePanel: false,
      showDetailedTimerInfo: false,
      showSavedTimers: false,
      showTodayTimers: true,
      todayTimerIndex: -1,
      yesterdayTimerIndex: -1,
      thisMonthTimerIndex: -1,
      userTimeZone: 'Canada/Mountain',
    }
  },
  computed: {
    todayTimers: function () {

      let result = [];

      // get today's date info
      let now = this.convertTz(new Date());
      let currentDate = now.getDate();
      let currentMonth = now.getMonth();
      let currentYear = now.getYear();


      /* eslint-disable */
      debugger;

      // if no savedTimers, return empty array
      if (!this.activity.savedTimers.length) {
        return result;
      }

      // if newest timer is not from today, return empty array
      let newestTimerDate = this.convertTimestampToDate(this.activity.savedTimers[0].id);
      if (newestTimerDate.getDate() != currentDate) {
        return result;
      }

      // iterate over the timers, add to result, and break if timer is not from today
      for (let i=0; i < this.activity.savedTimers.length; i++) {

        // get date from current timer
        let currentTimer = this.activity.savedTimers[i].timer;
        let currentTimerDate = this.convertTimestampToDate(currentTimer.startTime);


        // if timer is from today, add it to result
        if (currentTimerDate.getDate() === currentDate && currentTimerDate.getMonth() === currentMonth && currentTimerDate.getYear() === currentYear) {
          result.push(currentTimer);
        }
        else {
          break;
        }
      }

      return result.slice().reverse();

    }
  },
  methods: {
    // activity update
    activityUpdateName: function () {
      if (!this.newActivityName) {
        return false;
      }
      this.activity.name = this.newActivityName;
      this.newActivityName = "";
      this.showActivityUpdateNamePanel = false;
      this.showActivityModifyPanel = false;
      this.showActivityDeletePanel = false;
      this.$emit('activity-update', this.activity);
    },

    // activity delete
    emitActivityDeleteEvent: function () {
      this.$emit('activity-delete', this.activity);
      this.showActivityDeletePanel = false;
    },

    // date formatting
    convertTimestampToDate: function (timestamp) {
			return this.convertTz(new Date(timestamp * 1000));
		},
    convertTz: function (date, tzString=undefined) {
      if (!tzString) {
        tzString = this.userTimeZone;
      }
      return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
    },
    getFormattedDate: function (yourDate) {
			let options = {
				month: 'long',
				day: 'numeric',
				year: 'numeric',
			}
			return this.convertTz(new Date(yourDate)).toLocaleString('en-US', options);
    },
    getFormattedTime: function (yourDate) {
      yourDate = this.convertTz(yourDate);
      return yourDate.getHours() + ':' + yourDate.getMinutes();
    },
    getFormattedTimeFromTimeStamp: function (timestamp) {
      let yourDate = this.convertTimestampToDate(timestamp);
      return this.$helpers.zeroPadder(yourDate.getHours()) + ':' + yourDate.getMinutes();
    },
    getFormattedDateFromTimestamp: function (timestamp) {
      return this.convertTimestampToDate(timestamp).toLocaleString('en-US')
    },
    emitSavedTimerDeleteEvent: function (timerId) {
      this.$emit('saved-timer-delete', timerId);
    }
  }
}
</script>
