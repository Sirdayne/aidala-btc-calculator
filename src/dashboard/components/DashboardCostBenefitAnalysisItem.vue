<template>
  <div class="cost-benefits-item">
    <div class="cost-benefits-item__options">
      <slot name="cost-benefit-img"></slot>
      <span class="cost-benefits-item__options__label">
        {{ label }}
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
  setup(props) {
    const chartRef = ref<typeof VueApexCharts | null>(null);
    const chart = ref<ApexOptions>({});
    const series = ref([]);
    const chartHeight = 170;

    watch(
      () => props.change,
      () => {
        setChart();
      },
      { deep: true }
    )

    const setChart = () => {
      series.value = [props.change || 0];
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

    onBeforeMount(() => {
      setChart();
    });

    return {
      chart,
      series,
      chartRef,
      chartHeight
    };
  },
});
</script>

<style lang="scss">
.cost-benefits-item {
  display: flex;
  height: 80px;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &__options {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border: 1px #E1E3EA dotted;
    border-radius: 4px;
    width: 60%;
    height: 60px;

    &__label {
      color: #181C32;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.2;
      margin-left: 12px;
    }
  }

  &__chart {
    width: 40%;
    overflow: hidden;
  }
}

@media (max-width: 768px) {
  .cost-benefits-item {
    flex-direction: column;
    height: auto;

    &__options {
      width: 100%;
      margin-bottom: 1rem;
    }

    &__chart {
      width: 100%;
    }
  }
}
</style>