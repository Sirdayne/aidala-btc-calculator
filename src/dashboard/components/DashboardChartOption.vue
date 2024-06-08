<template>
  <div class="chart-option" :class="{ 'chart-option__active': active }">
    <div class="chart-option__img">
      <slot name="chart-option-img"></slot>
    </div>
    <div class="chart-option__label">{{ label }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "dashboard-chart-option",
  props: {
    label: String,
    img: String,
    active: Boolean
  },
  components: {},
  setup() {
  },
});
</script>

<style lang="sass">
.chart-option
  display: flex
  border: 1px dashed rgba(225, 227, 234, 1)
  box-sizing: border-box
  padding: 12px 12px 15px
  border-radius: 15px
  position: relative
  cursor: pointer
  width: 124px
  margin-left: 20px

.chart-option::after
  position: absolute
  content: ''
  width: calc(100% - 12px)
  height: 3px
  bottom: -2px
  left: 6px
  background: rgba(62, 151, 255, 0)
  border-radius: 15px
  transition: .3s linear

.chart-option.chart-option__active::after
  bottom: 0px
  background: rgba(62, 151, 255, 1)

.chart-option.chart-option__active
  border: 1px solid rgba(225, 227, 234, 1)!important

.chart-option__img
  display: flex
  justify-content: center
  margin-right: 10px

.chart-option__img img
  width: auto
  height: 25px

.chart-option__label
  color: #3F4254
  font-size: 14px
  font-weight: 600
  line-height: 14px
  margin-top: 7px
  text-align: center

@media only screen and (max-width: 700px)
  .chart-option
    margin: 20px 0
    width: 100%
</style>
