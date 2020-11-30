<template>
<div class="mt-4 mb-4">

  <span class="bold fake-link" @click="showActivityCreatePanel = !showActivityCreatePanel">
    Add new activity
  </span>

  <span id="activity-create__panel"
        v-if="showActivityCreatePanel">

    <input type="text"
           id="activity-create__text-input"
           v-model="newActivityName"
           @keyup.enter="emitActivityCreateEvent">

    <button id="activity-create__confirm-button"
            @click="emitActivityCreateEvent">
      Add activity
    </button>

    <button id="activity-create__cancel-button"
            @click="showActivityCreatePanel = false">
      Cancel
    </button>

  </span>

</div>
</template>

<script>
export default {
  name: 'AddActivity',
  data: function () {
    return {
      showActivityCreatePanel: false,
      newActivityName: ""
    }
  },
  methods: {
    emitActivityCreateEvent: function () {
      this.showActivityCreatePanel = false;
      this.$emit('activity-create', this.newActivityName);
      this.newActivityName = "";
    }
  }
}
</script>
