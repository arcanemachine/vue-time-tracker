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

    <div class="activity-delete mt-3">
      <span class="bold fake-link"
            style="margin-left: 1em;"
            @click="showActivityDeletePanel = !showActivityDeletePanel">
        Delete</span>

      <span v-if="showActivityDeletePanel"> 
        <span class="activity-confirm-delete">
          <span class="ml-2">Are you sure?</span>
          <button @click="emitActivityDeleteEvent">Delete '{{ activity.name }}'</button>
          <button @click="showActivityDeletePanel = false">Cancel</button>
        </span>
      </span>
    </div>
    <div class="mt-2 ml-4">
      <div class="ml-2" v-if="showDetailedTimerInfo">
        <p>activity: #{{ activity.id }}: {{ activity.name }}</p>
        <p>timer id: {{ timer.id }}</p>
        <p>startTime: {{ timer.startTime }}</p>
        <p>stopTime: {{ timer.stopTime }}</p>
        <p>lastUpdateTime: {{ timer.lastUpdateTime }}</p>
        <p>runSeconds: {{ timer.runSeconds }}</p>
        <p>pauseSeconds: {{ timer.pauseSeconds }}</p>
        <p>isRunning: {{ timer.isRunning }}</p>
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
      showActivityDeletePanel: false,
      showDetailedTimerInfo: false,
      currentTimer: [],
      savedTimers: [],
    }
  },
  methods: {
    emitActivityDeleteEvent: function () {
      this.$emit('activity-delete', this.activity);
      this.showActivityDeletePanel = false;
    }
  }
}
</script>
