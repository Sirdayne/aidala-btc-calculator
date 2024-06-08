<template>

  <div class="dashboard">

    <div class="dashboard-row">
      <DashboardCalculator
          :miner="miner"
          @setMiner="setMiner"
          :loading="loading"
      ></DashboardCalculator>

      <DashboardTradingAnalysis
          :time-mode="timeMode"
          :miner="miner"
          :start-date="startDate"
          :end-date="endDate"
          :currency="currency"
          @emit-sell-mode="setSellMode"
          @emit-totals-summary="setTotalsSummary"
      ></DashboardTradingAnalysis>
    </div>

    <div>
      <div class="dashboard-row">
        <DashboardChart
            :height="330"
            :miner="miner"
            :start-date="startDate"
            :end-date="endDate"
            :sell-mode="sellMode"
            @emit-currency="setCurrency"
            @emit-time-mode="setTimeMode"
        ></DashboardChart>

        <div>
          <div class="dashboard-stats">
            <DashboardChartStats
                :miner="miner"
                :total-summary="totalSummary"
                :currency="currency"
            />

            <DashboardCostBenefitAnalysis
                :miner="miner"
                :start-date="startDate"
                :end-date="endDate"
                :time-mode="timeMode"
                :sell-mode="sellMode"
                :currency="currency"
            />
          </div>
        </div>

      </div>
    </div>

    <DashboardMarketData></DashboardMarketData>

  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import DashboardChart from '../dashboard/components/DashboardChart.vue';
import DashboardChartStats from '../dashboard/components/DashboardChartStats.vue';
import DashboardCostBenefitAnalysis from '../dashboard/components/DashboardCostBenefitAnalysis.vue';
import DashboardCalculator from '../dashboard/components/DashboardCalculator.vue';
import moment from "moment/moment";
import DashboardMarketData from '../dashboard/components/DashboardMarketData.vue';
import DashboardTradingAnalysis from '../dashboard/components/DashboardTradingAnalysis.vue';

export default defineComponent({
  name: "dashboard-main",
  components: {
    DashboardTradingAnalysis,
    DashboardMarketData,
    DashboardCostBenefitAnalysis,
    DashboardChartStats,
    DashboardChart,
    DashboardCalculator
  },
  setup() {

    const loading = ref(false);
    const isCalculated = ref(false);
    const totalSummary = ref({
      revenue: 0,
      cost: 0,
      profit: 0,
      avgCostBtc: 0
    });

    const miner = ref({
      power_cost: 5.5,
      power: 3348,
      hash_rate : 62,
      quantity: 10,
      cost_of_hw: 500
    });

    const timeMode = ref('monthly');
    const sellMode = ref('daily');
    const currency = ref('BTC');

    const startDate = ref(moment('2023-01-01', 'YYYY-MM-DD').format("YYYY-MM-DDTHH:mm:ss"));
    const endDate = ref(moment('2024-01-01', 'YYYY-MM-DD').format("YYYY-MM-DDTHH:mm:ss"));

    const setMiner = (val) => {
      loading.value = true;
      miner.value = val;
      startDate.value = val.startDate;
      endDate.value = val.endDate;
      setTimeout(() => {
        loading.value = false;
        isCalculated.value = true;
      }, 1500)
    }

    const setTimeMode = (val) => {
      timeMode.value = val;
    }

    const setSellMode = (val) => {
      sellMode.value = val;
    }

    const setCurrency = (val) => {
      currency.value = val;
    }

    const setTotalsSummary = (val) => {
      totalSummary.value = val;
    }

    return {
      setMiner,
      miner,
      startDate,
      endDate,
      timeMode,
      sellMode,
      currency,
      setSellMode,
      setTotalsSummary,
      setTimeMode,
      setCurrency,
      loading,
      isCalculated,
      totalSummary
    }
  }
});
</script>

<style>
.dashboard {
  margin: 0 auto;
  max-width: 1800px;
  width: 100%;
  padding: 0 40px;
}
.dashboard-stats {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 500px;
}
.dashboard-row {
  display: flex;
  width: 100%;
  gap: 10px;
  margin-top: 12px;
}

.ai-card {
  border: 1px solid rgb(241, 241, 244);
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.03) 0 3px 4px 0;
}

@media only screen and (max-width: 1100px) {
  .dashboard {
    padding: 0 10px;
  }

  .dashboard-row {
    display: block;
  }

  .dashboard-stats {
    width: 100%;
    margin-top: 12px;
  }
}
</style>
