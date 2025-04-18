<template>
  <div class="dashboard-chart ai-card">
    <div class="dashboard-chart-card-header">
      <div class="dashboard-chart-title">
        <h3 class="ai-title">Financial overview</h3>
        <div class="ai-sub-title">{{ getDates }}</div>
      </div>

      <div class="chart-options">
        <DashboardChartOption
          @click="setActiveOption('revenue')"
          :active="activeOption === 'revenue'"
          label="Revenue"
        >
          <template v-slot:chart-option-img>
            <img src="@/assets/img/chart_revenue.svg" />
          </template>
        </DashboardChartOption>
        <DashboardChartOption
          @click="setActiveOption('cost')"
          :active="activeOption === 'cost'"
          label="Costs"
        >
          <template v-slot:chart-option-img>
            <img src="@/assets/img/chart_costs.svg" />
          </template>
        </DashboardChartOption>
        <DashboardChartOption
          @click="setActiveOption('profit')"
          :active="activeOption === 'profit'"
          label="Profit"
        >
          <template v-slot:chart-option-img>
            <img src="@/assets/img/chart_profit.svg" />
          </template>
        </DashboardChartOption>
      </div>
    </div>

    <div class="chart-filters__container">
      <div class="card-toolbar chart-filters">
        <div class="chart-currencies">
          <div
            v-for="(item, index) in currencies"
            :key="index"
            class="ai-button"
            @click="setCurrency(item)"
            :class="{ active: currency === item }"
          >
            {{ item }}
          </div>
        </div>

        <div class="segmented-control">
          <input
            type="radio"
            id="monthly"
            name="timeMode"
            :value="'monthly'"
            v-model="timeMode"
            @change="setTimeMode('monthly')"
          />
          <label for="monthly" class="segmented-control__item"
            >Month-by-Month</label
          >

          <input
            type="radio"
            id="daily"
            name="timeMode"
            :value="'daily'"
            v-model="timeMode"
            @change="setTimeMode('daily')"
          />
          <label for="daily" class="segmented-control__item">Day-by-Day</label>

          <div class="segmented-control__color"></div>
        </div>
      </div>
    </div>

    <apexchart
      ref="chartRef"
      type="bar"
      :options="chart"
      :series="series"
      :height="height"
    ></apexchart>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  onMounted,
  ref,
  watch,
} from "vue";
import type { ApexOptions } from "apexcharts";
import type VueApexCharts from "vue3-apexcharts";
import DashboardChartOption from "./DashboardChartOption.vue";
import axios from "axios";
import moment from "moment";
import { useCalculatorStore } from "@/stores";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "dashboard-chart",
  props: {
    height: Number,
    miner: Object,
    startDate: String,
    endDate: String,
  },
  emits: ["emitTimeMode", "emitCurrency"],
  components: { DashboardChartOption },
  setup(props, ctx) {
    const chartRef = ref<typeof VueApexCharts | null>(null);
    const chart = ref<ApexOptions>({});
    const timeMode = ref("monthly");
    const activeOption = ref("revenue");

    const dateRange = ref("");
    const series = ref([]);
    const categories = ref([]);

    const chartLabels = ref([]);

    const currencies = ref(["USD", "BTC"]);
    const currency = ref("BTC");

    const difficultiesResponse = ref([]);
    const btcResponse = ref([]);

    const calculatorStore = useCalculatorStore();
    const { sellMode } = storeToRefs(calculatorStore);

    watch(
      () => [props.miner, sellMode.value, currency.value, timeMode.value],
      (newValues, oldValues) => {
        console.log("Watcher triggered with values:", {
          newValues,
          oldValues,
        });
        fetchChart();
      },
      { deep: true }
    );

    onMounted(() => {
      fetchChart();
    });

    const getDates = computed(() => {
      return (
        moment(props.startDate).format("ll") +
        " - " +
        moment(props.endDate).format("ll")
      );
    });

    const setTimeMode = (val) => {
      timeMode.value = val;
      ctx.emit("emitTimeMode", val);
      fetchChart();
    };

    const updateSellMode = (newSellMode) => {
      sellMode.value = newSellMode;
      fetchChart();
    };

    const setCurrency = (item) => {
      currency.value = item;
      ctx.emit("emitCurrency", item);
    };

    const setActiveOption = (option) => {
      activeOption.value = option;
      fetchChart();
    };

    const capitalizeFirstLetter = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const fetchChart = () => {
      console.log("Fetching chart with sellMode:", sellMode.value);
      const host = import.meta.env.VITE_APP_API_HOST;
      const endpoint = activeOption.value;

      difficultiesResponse.value = [];
      btcResponse.value = [];

      const minerValue =
        props && props.miner && props.miner ? props.miner : null;
      const body = {
        user_id: 0,
        time_mode: timeMode.value,
        sell_mode: sellMode.value,
        currency: currency.value,
        time_filter: {
          start_date: moment(props.startDate).format("YYYY-MM-DDTHH:mm:ss"),
          end_date: moment(props.endDate).format("YYYY-MM-DDTHH:mm:ss"),
        },
        cost_of_hw: minerValue.cost_of_hw,
        hash_rate: minerValue.hash_rate,
        power: minerValue.power,
        power_cost: minerValue.power_cost,
        quantity: minerValue.quantity,
      };

      if (activeOption.value === "revenue" && currency.value === "USD") {
        Promise.all([
          axios.post(`${host}${endpoint}`, body),
          axios.post(`${host}difficulties`, body),
          axios.post(`${host}btc_prices`, body),
        ]).then((values) => {
          const response = values[0].data.data;
          difficultiesResponse.value = values[1].data;
          btcResponse.value = values[2].data;
          setChart(response);
        });
      } else if (activeOption.value === "cost" && currency.value === "BTC") {
        Promise.all([
          axios.post(`${host}${endpoint}`, body),
          axios.post(`${host}btc_prices`, body),
        ]).then((values) => {
          const response = values[0].data.data;
          btcResponse.value = values[1].data;
          setChart(response);
        });
      } else if (activeOption.value === "revenue" && currency.value === "BTC") {
        Promise.all([
          axios.post(`${host}${endpoint}`, body),
          axios.post(`${host}difficulties`, body),
        ]).then((values) => {
          const response = values[0].data.data;
          difficultiesResponse.value = values[1].data;
          setChart(response);
        });
      } else {
        axios
          .post(`${host}${endpoint}`, body)
          .then(function (response) {
            setChart(response.data.data);
          })
          .catch(function (error) {});
      }
    };

    const getCategoryLabel = (time) => {
      return moment(time).format("YYYY-MM-DDTHH:mm:ss");
    };

    const refreshChart = () => {
      if (!chartRef.value) {
        return;
      }

      chartRef.value.updateOptions(chartOptions(), true, true, true);
    };

    const getChartLabel = (val) => {
      const found = chartLabels.value.find((item) => item.time === val);
      return found.label;
    };

    const formatYAxis = (val) => {
      return val.toLocaleString("en-US", {
        maximumFractionDigits: 2,
        notation: "compact",
        compactDisplay: "short",
      });
    };

    const labelColor = "#adb5bd";
    const borderColor = "#e9ecef";
    const primaryColor = "#0d6efd";
    const secondaryColor = "rgba(71 ,95 ,190 , 0.2)";
    const btcColor = "rgba(71,190,178,0.2)";
    const halvingColor = "rgba(190,71,111,0.2)";

    const yaxis = ref([
      {
        title: {
          text: capitalizeFirstLetter(activeOption.value),
          style: {
            color: primaryColor,
          },
        },
        labels: {
          style: {
            colors: labelColor,
            fontSize: "12px",
          },
          formatter: function (val) {
            return formatYAxis(val);
          },
        },
      },
      {
        show: true,
        opposite: true,
        title: {
          text: "Difficulty",
          style: {
            color: secondaryColor,
          },
        },
        labels: {
          style: {
            colors: labelColor,
            fontSize: "12px",
          },
          formatter: function (val) {
            return formatYAxis(val);
          },
        },
      },
    ]);
    const colors = ref([primaryColor, secondaryColor]);

    const setChart = (response) => {
      // Declare arrays
      const data = [];
      const difficultyData = [];
      const btcData = [];

      // Reset other arrays
      categories.value.length = 0;
      chartLabels.value.length = 0;

      response.forEach((item) => {
        data.push(Number(item.value));

        const foundDifficulty = difficultiesResponse.value.find(
          (diff) => diff.label === item.label
        );
        if (foundDifficulty) {
          difficultyData.push(Number(foundDifficulty.value));
        }

        const foundBtc = btcResponse.value.find(
          (btc) => btc.label === item.label
        );
        if (foundBtc) {
          btcData.push(Number(foundBtc.value));
        }

        categories.value.push(getCategoryLabel(item.time));
        chartLabels.value.push({
          time: moment(item.time).valueOf(),
          label: item.label,
        });
      });

      if (activeOption.value === "revenue" && currency.value === "USD") {
        series.value = [
          {
            name: capitalizeFirstLetter(activeOption.value),
            data,
            type: "bar",
          },
          {
            name: "Difficulty",
            data: difficultyData,
            type: "area",
          },
          {
            name: "BTC Price",
            data: btcData,
            type: "area",
          },
        ];

        yaxis.value = [
          {
            title: {
              text: capitalizeFirstLetter(activeOption.value),
              style: {
                color: primaryColor,
              },
            },
            labels: {
              style: {
                colors: labelColor,
                fontSize: "12px",
              },
              formatter: function (val) {
                return formatYAxis(val);
              },
            },
          },
          {
            show: true,
            opposite: true,
            title: {
              text: "Difficulty",
              style: {
                color: secondaryColor,
              },
            },
            labels: {
              style: {
                colors: labelColor,
                fontSize: "12px",
              },
              formatter: function (val) {
                return formatYAxis(val);
              },
            },
          },
          {
            show: true,
            opposite: true,
            title: {
              text: "BTC",
              style: {
                color: btcColor,
              },
            },
            labels: {
              style: {
                colors: labelColor,
                fontSize: "12px",
              },
              formatter: function (val) {
                return formatYAxis(val);
              },
            },
          },
        ];
        colors.value = [primaryColor, secondaryColor, btcColor];
      } else if (activeOption.value === "cost" && currency.value === "BTC") {
        series.value = [
          {
            name: capitalizeFirstLetter(activeOption.value),
            data,
            type: "bar",
          },
          {
            name: "BTC Price",
            data: btcData,
            type: "area",
          },
        ];

        yaxis.value = [
          {
            title: {
              text: capitalizeFirstLetter(activeOption.value),
              style: {
                color: "rgba(233, 181, 0, 1)",
              },
            },
            labels: {
              style: {
                colors: labelColor,
                fontSize: "12px",
              },
              formatter: function (val) {
                return formatYAxis(val);
              },
            },
          },
          {
            show: true,
            opposite: true,
            title: {
              text: "BTC",
              style: {
                color: btcColor,
              },
            },
            labels: {
              style: {
                colors: labelColor,
                fontSize: "12px",
              },
              formatter: function (val) {
                return formatYAxis(val);
              },
            },
          },
        ];
        colors.value = ["rgba(233, 181, 0, 1)", secondaryColor];
      } else if (activeOption.value === "cost" && currency.value === "USD") {
        series.value = [
          {
            name: capitalizeFirstLetter(activeOption.value),
            data,
            type: "bar",
          },
        ];

        yaxis.value = [
          {
            title: {
              text: capitalizeFirstLetter(activeOption.value),
              style: {
                color: "rgba(233, 181, 0, 1)",
              },
            },
            labels: {
              style: {
                colors: labelColor,
                fontSize: "12px",
              },
              formatter: function (val) {
                return formatYAxis(val);
              },
            },
          },
        ];
        colors.value = ["rgba(233, 181, 0, 1)"];
      } else if (activeOption.value === "revenue" && currency.value === "BTC") {
        series.value = [
          {
            name: capitalizeFirstLetter(activeOption.value),
            data,
            type: "bar",
          },
          {
            name: "Difficulty",
            data: difficultyData,
            type: "area",
          },
        ];

        yaxis.value = [
          {
            title: {
              text: capitalizeFirstLetter(activeOption.value),
              style: {
                color: primaryColor,
              },
            },
            labels: {
              style: {
                colors: labelColor,
                fontSize: "12px",
              },
              formatter: function (val) {
                return formatYAxis(val);
              },
            },
          },
          {
            show: true,
            opposite: true,
            title: {
              text: "Difficulty",
              style: {
                color: secondaryColor,
              },
            },
            labels: {
              style: {
                colors: labelColor,
                fontSize: "12px",
              },
              formatter: function (val) {
                return formatYAxis(val);
              },
            },
          },
        ];
        colors.value = [primaryColor, secondaryColor];
      } else {
        series.value = [
          {
            name: capitalizeFirstLetter(activeOption.value),
            data,
          },
        ];

        yaxis.value = [
          {
            title: {
              text: capitalizeFirstLetter(activeOption.value),
              style: {
                color: "rgba(71, 190, 125, 1)",
              },
            },
            labels: {
              style: {
                colors: labelColor,
                fontSize: "12px",
              },
              formatter: function (val) {
                return formatYAxis(val);
              },
            },
          },
        ];

        colors.value = ["rgba(71, 190, 125, 1)"];
      }

      Object.assign(chart.value, chartOptions());
      refreshChart();
    };

    const chartOptions = (): ApexOptions => {
      return {
        chart: {
          fontFamily: "inherit",
          zoom: {
            type: "x",
            enabled: true,
            autoScaleYaxis: true,
          },
          toolbar: {
            show: true,
          },
        },
        plotOptions: {
          bar: {
            colors: {
              ranges: [
                {
                  from: -Infinity,
                  to: 0,
                  color: "#FF0000",
                },
              ],
            },
            horizontal: false,
            columnWidth: "7px",
            borderRadius: 3,
          },
        },
        legend: {
          show: false,
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: ["transparent"],
        },
        xaxis: {
          type: "datetime",
          categories: categories.value,
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            style: {
              colors: labelColor,
              fontSize: "12px",
            },
          },
        },
        yaxis: yaxis.value as any,
        fill: {
          opacity: 1,
        },
        states: {
          normal: {
            filter: {
              type: "none",
              value: 0,
            },
          },
          hover: {
            filter: {
              type: "none",
              value: 0,
            },
          },
          active: {
            allowMultipleDataPointsSelection: false,
            filter: {
              type: "none",
              value: 0,
            },
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          style: {
            fontSize: "12px",
          },
          y: {
            formatter: function (val) {
              return val.toFixed(5);
            },
          },
          x: {
            formatter: function (val) {
              return getChartLabel(val);
            },
          },
        },
        colors: colors.value as any,
        grid: {
          borderColor: borderColor,
          strokeDashArray: 4,
          yaxis: {
            lines: {
              show: true,
            },
          },
        },
        // Add the annotations here
        annotations: {
          xaxis: [
            {
              x: new Date("2012-11-28").getTime(),
              borderColor: "#FF4560",
              label: {
                text: "1st Halving",
                style: {
                  color: "#fff",
                  background: "#FF4560",
                },
              },
            },
            {
              x: new Date("2016-07-09").getTime(),
              borderColor: "#FF4560",
              label: {
                text: "2nd Halving",
                style: {
                  color: "#fff",
                  background: "#FF4560",
                },
              },
            },
            {
              x: new Date("2020-05-11").getTime(),
              borderColor: "#FF4560",
              label: {
                text: "3rd Halving",
                style: {
                  color: "#fff",
                  background: "#FF4560",
                },
              },
            },
            {
              x: new Date("2024-04-20").getTime(),
              borderColor: "#FF4560",
              label: {
                text: "4th Halving",
                style: {
                  color: "#fff",
                  background: "#FF4560",
                },
              },
            },
          ],
        },
      };
    };

    return {
      dateRange,
      chart,
      series,
      chartRef,
      timeMode,
      activeOption,
      setTimeMode,
      setActiveOption,
      currencies,
      currency,
      getDates,
      setCurrency,
    };
  },
});
</script>

<style lang="scss">
.dashboard-chart {
  display: block;
  width: 100%;

  .apexcharts-toolbar {
    display: none;
  }
}

.dashboard-chart-card-header {
  display: flex;
  justify-content: space-between;
  padding: 12px 0 0 1.25rem;
  border-bottom: 1px solid var(--bs-card-border-color);
}

.chart-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-currencies {
  display: flex;

  .ai-button {
    color: #7e8299;
    background: #fff;
    margin-left: 5px;

    &.active {
      color: #7e8299;
      background: #f1f1f2;
    }
  }
}

.chart-options {
  display: flex;
}

.chart-filters__container {
  padding: 0 1.25rem;
  margin-top: 30px;
}

.segmented-control {
  position: relative;
  display: inline-flex;
  border-radius: 8px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  input[type="radio"] {
    display: none;
  }

  &__item {
    flex: 1;
    padding: 8px 16px;
    font-size: 14px;
    text-align: center;
    cursor: pointer;
    transition: color 0.15s ease-in;
    z-index: 1;

    &:hover {
      color: #3e97ff;
    }
  }

  &__color {
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    background-color: #3e97ff;
    transition: transform 0.15s ease-in;
    border-radius: 8px;
  }

  input[type="radio"]:checked + &__item {
    color: white;
  }

  input[type="radio"]:nth-of-type(1):checked ~ &__color {
    transform: translateX(0%);
  }

  input[type="radio"]:nth-of-type(2):checked ~ &__color {
    transform: translateX(100%);
  }
}

@media only screen and (max-width: 700px) {
  .chart-filters__container {
    margin-top: 0px;
  }

  .dashboard-chart-card-header {
    display: block;
  }

  .chart-filters {
    display: block;
  }

  .chart-options,
  .chart-currencies {
    display: block;
  }

  .segmented-control {
    margin-top: 20px;
    width: 100%;
  }

  .chart-currencies .ai-button {
    margin: 5px 0;
  }
}
</style>