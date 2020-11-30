<template>
  <div class="mt-2 ml-4">
    <span class="bold fake-link"
          @click="showDetailedTimerInfo = !showDetailedTimerInfo">
      {{ formattedTimer }}</span>
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
</template>

<script>
export default {
  name: 'Timer',
  props: ['timer', 'activity'],
  data: function () {
    return {
      showDetailedTimerInfo: false
    }
  },
  computed: {
    formattedTimer: function () {
      return '00:00:00';
    }
  }
}
</script>
