<template>
<div class="mt-4 mb-4">

  <span @click="showActivityCreatePanel = !showActivityCreatePanel"
        class="bold cursor-url"
        style="font-size: 1.25em;">
    Add new activity
  </span>

  <transition name="fade">
    <span id="activity-create__panel"
          v-if="showActivityCreatePanel">

      <input type="text"
             id="activity-create__text-input"
             v-model="newActivityName"
             @keyup.enter="emitActivityCreateEvent">

      <button id="activity-create__confirm-button"
              @click="emitActivityCreateEvent"
              class="ml-1">
        Add activity
      </button>

      <button id="activity-create__cancel-button"
              @click="showActivityCreatePanel = false"
              class="ml-1">
        Cancel
      </button>

      <span id="activity-create_info-message" class="ml-1"></span>

    </span>
  </transition>

</div>
</template>

<script>
export default {
  name: 'AddActivity',
  data: function () {
    return {
      showActivityCreatePanel: false,
      newActivityName: "",
      infoMessage: ""
    }
  },
  methods: {
    emitActivityCreateEvent: function () {
      if (!this.newActivityName) {
        let infoMessageElement = document.getElementById('activity-create_info-message');
        infoMessageElement.innerText = "Please enter a name for your activity";
        return false;
      }
      this.showActivityCreatePanel = false;
      this.$emit('activity-create', this.newActivityName);
      this.newActivityName = "";
      this.infoMessage = "";
    }
  }
}
</script>
