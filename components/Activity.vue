<template>
<div class="mt-3">
  <span>{{ activity.id + 1 }}.

    <span class="bold fake-link"
          @click="showActivityTimeTracker = !showActivityTimeTracker">
      {{ activity.name }}
    </span>

  </span>

  <div v-if="showActivityTimeTracker">
    <slot></slot>

    <div class="mt-3 ml-2">

      <span v-if="activity.savedTimers"
            @click="showSavedTimers = !showSavedTimers"
            class="fake-link">
        <span v-if="!showSavedTimers" class="bold">Show Saved Timers</span>
        <span v-if="showSavedTimers" class="bold">Hide Saved Timers</span>
      </span>

      <div v-if="showSavedTimers">
        <p class="ml-2">
          <span v-if="activity.savedTimers.length">Your saved timers:</span>
          <span v-else>You have no saved timers for this activity.</span>
        </p>
        <ol>

          <li v-for="obj in activity.savedTimers"
              :key="obj.id"
              class="mb-1">

            <span class="mt-1 bold fake-link"
              @click="obj.showTimerDetail = !obj.showTimerDetail">
              {{ $helpers.getFormattedTimerTime(obj.timer.runSeconds) }}
            </span>

            <div v-if="obj.showTimerDetail">

              <ul class="mt-1">
                <li>Start: {{ getFormattedDate(obj.timer.startTime) }}</li>
                <li>Finish: {{ getFormattedDate(obj.timer.stopTime) }}</li>
              </ul>

              <div class="mt-1 mb-2 ml-5">

                <span @click="obj.showDeletePanel = !obj.showDeletePanel"
                      class="bold fake-link">
                  Delete
                </span>

                <span v-if="obj.showDeletePanel">
                  <span>Are you sure?</span>

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

    <div class="activity-delete mt-3">
      <span class="bold fake-link ml-2"
            @click="showActivityDeletePanel = !showActivityDeletePanel">
        Delete Activity</span>
      <span v-if="showActivityDeletePanel"> 
        <span class="activity-confirm-delete">
          <span class="ml-2">Are you sure?</span>
          <button @click="emitActivityDeleteEvent">Delete '{{ activity.name }}'</button>
          <button @click="showActivityDeletePanel = false">Cancel</button>
        </span>
      </span>
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
      showActivityDeletePanel: false,
      showDetailedTimerInfo: false,
      showSavedTimers: true,
    }
  },
  methods: {
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
