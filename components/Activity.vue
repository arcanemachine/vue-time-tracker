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
        <button v-if="!showSavedTimers" class="bold">Show saved timers</button>
      </span>

      <div v-if="showSavedTimers">
        <p class="ml-2">
          <span v-if="activity.savedTimers.length" class="bold">Your saved timers:
            <button v-if="showSavedTimers" @click="showSavedTimers = !showSavedTimers">Hide</button>
          </span>
          <span v-else>You have no saved timers for this activity.</span>
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
                <li>Start: {{ getFormattedDate(obj.timer.startTime) }}</li>
                <li>Finish: {{ getFormattedDate(obj.timer.stopTime) }}</li>
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
    }
  },
  methods: {
    // update activity
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
    // delete activity
    emitActivityDeleteEvent: function () {
      this.$emit('activity-delete', this.activity);
      this.showActivityDeletePanel = false;
    },
    // date formatting
    getFormattedDate: function (timestamp) {
      return new Date(timestamp*1000).toLocaleString('en-US', {timeZone: "Canada/Mountain"})
    },
    emitSavedTimerDeleteEvent: function (timerId) {
      this.$emit('saved-timer-delete', timerId);
    }
  }
}
</script>
