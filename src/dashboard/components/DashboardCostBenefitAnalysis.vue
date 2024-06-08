<template>
  <div class="ai-card">
    <div class="dashboard-cost-benefit-analysis">
      <div class="dashboard-cost-benefit-analysis__title">Cost-Benefit Analysis</div>

      <div class="dashboard-cost-benefit-analysis-container">
        <el-tooltip
            class="box-item"
            effect="dark"
            content="Percentage of initial mining hardware costs recovered through mining"
            placement="top-end"
        >
          <DashboardCostBenefitAnalysisItem
              :change="hardwarePayback"
              label="Hardware payback"
              chart-color="rgba(62, 151, 255, 1)"
              back-color="rgba(238, 246, 255, 1)"
          >
            <template v-slot:cost-benefit-img>
              <img class="cost-benefits-item__img" src="@/assets/img/hardware_payback.svg" alt="Hardware Payback Img">
            </template>
          </DashboardCostBenefitAnalysisItem>
        </el-tooltip>

        <div class="dashboard-cost-benefit-analysis__line"></div>

         <el-tooltip
            class="box-item"
            effect="dark"
            content="Compares earnings from mining with the equivalent value in Bitcoin if purchased directly for the same initial investment. Values over 100% indicate mining has produced more Bitcoin value than a direct purchase"
            placement="top-end"
        >
          <DashboardCostBenefitAnalysisItem
              :change="buyVsMinePayback"
              label="Mine vs Buy"
              chart-color="rgba(80, 20, 208, 1)"
              back-color="rgba(248, 245, 255, 1)"
          >
            <template v-slot:cost-benefit-img>
              <img class="cost-benefits-item__img" src="@/assets/img/mine_buy.svg" alt="Mine Buy Img">
            </template>
          </DashboardCostBenefitAnalysisItem>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeMount, watch } from "vue";
import axios from 'axios';
import DashboardCostBenefitAnalysisItem from './DashboardCostBenefitAnalysisItem.vue';
import moment from 'moment/moment';

export default defineComponent({
  name: "dashboard-cost-benefit-analysis",
  components: {
    DashboardCostBenefitAnalysisItem
  },
  props: {
    miner: Object,
    startDate: String,
    endDate: String,
    timeMode: String,
    sellMode: String,
    currency: String,
  },
  setup(props, ctx) {

    const buyVsMinePayback = ref(0);
    const hardwarePayback = ref(0);

    onBeforeMount(() => {
      fetchCostBenefitAnalysis();
    })

    watch(
        () => props.miner,
        (newValue, oldValue) => {
          fetchCostBenefitAnalysis();
        },
        { deep: true }
    )

    watch(
        () => props.timeMode,
        (newValue, oldValue) => {
          fetchCostBenefitAnalysis();
        },
        { deep: true }
    )

    watch(
        () => props.sellMode,
        (newValue, oldValue) => {
          fetchCostBenefitAnalysis();
        },
        { deep: true }
    )

    watch(
        () => props.currency,
        (newValue, oldValue) => {
          fetchCostBenefitAnalysis();
        },
        { deep: true }
    )

    const fetchCostBenefitAnalysis = () => {
      if (props.timeMode === "daily" && props.sellMode === "monthly") {
        return;
      }
      const host = import.meta.env.VITE_APP_API_HOST;
      const endpoint = 'cost_benefit_analysis';

      const minerValue = props && props.miner && props.miner ? props.miner : null;
      let body;

      if (minerValue) {
        body = {
          user_id: 0,
          time_mode: props.timeMode,
          sell_mode: props.sellMode,
          currency: props.currency,
          time_filter: {
            start_date: moment(props.startDate).format("YYYY-MM-DDTHH:mm:ss"),
            end_date: moment(props.endDate).format("YYYY-MM-DDTHH:mm:ss")
          },
          cost_of_hw: minerValue.cost_of_hw,
          hash_rate: minerValue.hash_rate,
          power: minerValue.power,
          power_cost: minerValue.power_cost,
          quantity: minerValue.quantity
        }
      }

      axios.post(`${host}${endpoint}`, body)
          .then(function (response) {
            buyVsMinePayback.value = response?.data?.buy_vs_mine_payback ? response.data.buy_vs_mine_payback : 0;
            hardwarePayback.value = response?.data?.hardware_payback ? response.data.hardware_payback : 0;
          })
          .catch(function (error) {
            console.log('Chart Error: ', error);
            // setRandomChart();
          });
    }

    return {
      buyVsMinePayback,
      hardwarePayback,
    };
  },
});
</script>

<style lang="sass">
.dashboard-cost-benefit-analysis

  &__title
    color: #7E8299
    font-size: 18px
    font-weight: 600
    line-height: 18px
    margin-bottom: 15px

  &__line
    border-top: 1px #E1E3EA dotted
    height: 1px
    width: 100%
    margin: 20px 0
</style>

