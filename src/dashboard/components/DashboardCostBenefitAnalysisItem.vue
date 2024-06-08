<template>
  <div class="cost-benefits-item">
    <div class="cost-benefits-item__options">
      <slot name="cost-benefit-img"></slot>
      <span class="cost-benefits-item__options__label">
        {{ props.label }}
      </span>
    </div>
    <div class="cost-benefits-item__chart">
      <apexchart
          ref="chartRef"
          class="mixed-widget-4-chart"
          :options="chart"
          :series="series"
          :height="chartHeight"
          type="radialBar"
      ></apexchart>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref, watch } from "vue";
import type VueApexCharts from 'vue3-apexcharts';
import type { ApexOptions } from 'apexcharts';

export default defineComponent({
  name: "dashboard-cost-benefit-analysis-item",
  props: {
    change: Number,
    label: String,
    chartColor: String,
    backColor: String,
  },
  components: {},
  setup(props, ctx) {

    const chartRef = ref<typeof VueApexCharts | null>(null);
    const chart = ref<ApexOptions>({});
    const series = ref([]);
    const chartHeight = 170;

    watch(
        () => props.change,
        (newValue, oldValue) => {
          setChart();
        },
        { deep: true }
    )
    const setChart = () => {
      series.value = [props.change];
      Object.assign(chart.value, chartOptions());
      refreshChart();
    }

    const refreshChart = () => {
      if (!chartRef.value) {
        return;
      }
      chartRef.value.updateOptions(chartOptions());
    };

    const chartOptions = (): ApexOptions => {
      const chartColor = props.chartColor;
      const backColor = props.backColor;

      return {
        chart: {
          animations: {
            enabled: false,
            speed: 0,
            dynamicAnimation: {
              enabled: false,
              speed: 0
            }
          },
          fontFamily: "inherit",
          height: chartHeight,
          type: "radialBar",
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            hollow: {
              size: '65%',
            },
            track: {
              background: backColor,
            },
            dataLabels: {
              name: {
                show: false
              },
              value: {
                offsetY: -2,
                fontSize: '16px',
                fontWeight: 600,
              }
            }
          }
        },
        grid: {
          padding: {
            top: -10
          }
        },
        colors: [chartColor],
        stroke: {
          lineCap: "round",
        },
        labels: ["Progress"],
      };
    };

    return {
      props,
      chart,
      series,
      chartRef,
      chartHeight
    };
  },
});
</script>

<style lang="sass">
.cost-benefits-item
  display: flex
  height: 80px
  justify-content: space-between

  &__img
    width: 20px

  &__options
    display: flex
    align-items: center
    margin-top: 8px
    margin-right: 40px
    padding: 12px 12px
    box-sizing: border-box
    border: 1px #E1E3EA dotted
    width: 60%
    height: 60px

    &__label
      color: #181C32
      font-size: 12px
      font-weight: 600
      line-height: 12px
      margin-left: 12px

  &__chart
    width: 50%
    overflow: hidden
</style>
