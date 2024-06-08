<template>
  <img
      v-if="props.state === 'up'"
      src="@/assets/img/arrow-up.svg"
  />
  <img
      v-else
      src="@/assets/img/arrow-down.svg"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "dashboard-arrow",
  props: {
    state: String
  },
  setup(props, ctx) {
    return {
      props
    }
  }
});
</script>
