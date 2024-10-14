<template>

  <div class="dashboard" v-loading="isHash && !loadedHash" element-loading-text="Loading data from link...">

    <div class="dashboard-row">
      <DashboardCalculator
          @setMiner="setMiner"
          :loading="loading"
      ></DashboardCalculator>

      <DashboardTradingAnalysis
          v-if="loadedHash"
          :time-mode="timeMode"
          :miner="miner"
          :start-date="startDate"
          :end-date="endDate"
          :currency="currency"
          @emit-totals-summary="setTotalsSummary"
      ></DashboardTradingAnalysis>
    </div>

    <div>
      <div class="dashboard-row">
        <DashboardChart
            v-if="loadedHash"
            :height="330"
            :miner="miner"
            :start-date="startDate"
            :end-date="endDate"
            @emit-currency="setCurrency"
            @emit-time-mode="setTimeMode"
        ></DashboardChart>

        <div>
          <div class="dashboard-stats">
            <DashboardChartStats
                v-if="loadedHash"
                :miner="miner"
                :total-summary="totalSummary"
                :currency="currency"
            />

            <DashboardCostBenefitAnalysis
                v-if="loadedHash"
                :miner="miner"
                :start-date="startDate"
                :end-date="endDate"
                :time-mode="timeMode"
                :currency="currency"
            />
          </div>
        </div>

      </div>
    </div>

    <div class="ai-dashboard-share">

      <DashboardShare
          v-if="loadedHash"
          :miner="miner"
          :start-date="startDate"
          :end-date="endDate"
          :time-mode="timeMode"
          :currency="currency"
      />

      <DashboardExportButton
          v-if="loadedHash"
          :miner="miner"
          :start-date="startDate"
          :end-date="endDate"
          :time-mode="timeMode"
          :currency="currency"
      />
    </div>

    <DashboardMarketData></DashboardMarketData>

  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";
import DashboardChart from '../dashboard/components/DashboardChart.vue';
import DashboardChartStats from '../dashboard/components/DashboardChartStats.vue';
import DashboardCostBenefitAnalysis from '../dashboard/components/DashboardCostBenefitAnalysis.vue';
import DashboardCalculator from '../dashboard/components/DashboardCalculator.vue';
import moment from "moment/moment";
import DashboardMarketData from '../dashboard/components/DashboardMarketData.vue';
import DashboardTradingAnalysis from '../dashboard/components/DashboardTradingAnalysis.vue';
import DashboardExportButton from '@/dashboard/components/DashboardExportButton.vue';
import DashboardShare from '@/dashboard/components/DashboardShare.vue';

export default defineComponent({
  name: "dashboard-main",
  components: {
    DashboardTradingAnalysis,
    DashboardMarketData,
    DashboardCostBenefitAnalysis,
    DashboardChartStats,
    DashboardChart,
    DashboardCalculator,
    DashboardExportButton,
    DashboardShare
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

    const setCurrency = (val) => {
      currency.value = val;
    }

    const setTotalsSummary = (val) => {
      totalSummary.value = val;
    }

    const isHash = ref(false);
    const loadedHash = ref(false);

    const checkHashLink = () => {
      let uri = window.location.search.substring(1);
      let params = new URLSearchParams(uri);
      const hash = params.get('hash');
      if (hash) {
        isHash.value = true;
        setTimeout(() => loadedHash.value = true, 1500);
      } else {
        loadedHash.value = true;
      }
    }

    onMounted(() => {
      checkHashLink();
    })

    return {
      setMiner,
      miner,
      startDate,
      endDate,
      timeMode,
      currency,
      setTotalsSummary,
      setTimeMode,
      setCurrency,
      loading,
      isCalculated,
      totalSummary,
      loadedHash,
      isHash
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

.ai-dashboard-share {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 0;
  margin: 0;
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



@media only screen and (max-width: 500px) {
  .ai-dashboard-share {
    display: block;
  }
  .dashboard-share-content {
    display: block;
  }
}

</style>
