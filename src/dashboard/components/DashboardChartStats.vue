<template>
  <div class="dashboard-chart-stats ai-card">
    <div class="card-header border-0 pt-5">
      <h3 class="ai-title">Mining Financial Summary</h3>
      <span class="ai-sub-title">Stats for Selected Period</span>
    </div>
    <div class="dashboard-chart-stats__rows">

      <div class="dashboard-chart-stats__row">
        <div class="dashboard-chart-stats__row__label">Gross Profit Margin (%)</div>
        <div class="dashboard-chart-stats__row__item">
          <span class="dashboard-chart-stats__row__item__value">
            {{ formatPercentage(grossProfitMargin) }}
          </span>
        </div>
      </div>

      <div class="dashboard-chart-stats__row">
        <div class="dashboard-chart-stats__row__label">Electricity Cost Ratio (%)</div>
        <div class="dashboard-chart-stats__row__item">
          <span class="dashboard-chart-stats__row__item__value">
            {{ formatPercentage(electricityCostRatio) }}
          </span>
        </div>
      </div>

      <div class="dashboard-chart-stats__row">
        <div class="dashboard-chart-stats__row__label">Total Cost of Ownership (TCO)</div>
        <div class="dashboard-chart-stats__row__item">
          <span class="dashboard-chart-stats__row__item__value">
            {{ formatCurrency(totalCostOfOwnership) }}
          </span>
        </div>
      </div>

      <div class="dashboard-chart-stats__row">
        <div class="dashboard-chart-stats__row__label">Average Cost of Production per Bitcoin (USD)</div>
        <div class="dashboard-chart-stats__row__item">
          <DashboardArrow :state="totalSummary.avgCostBtc >= 0 ? 'up' : 'down'"></DashboardArrow>
          <span class="dashboard-chart-stats__row__item__value">
            {{ formatCurrency(totalSummary.avgCostBtc, true) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import DashboardArrow from "./DashboardArrow.vue";

export default defineComponent({
  name: "dashboard-chart-stats",
  props: {
    miner: Object,
    totalSummary: Object,
    currency: String,
    quantity: Number,
    costOfHw: Number,
  },
  components: {
    DashboardArrow
  },
  setup(props) {
    const formatCurrency = (item, alwaysUsd = false) => {
      if (!alwaysUsd && props.currency === 'BTC') {
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 6,
          maximumFractionDigits: 6
        });
        return '₿' + formatter.format(item).substring(1);
      } else {
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        return formatter.format(item)
      }
    }

    const formatPercentage = (value) => {
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value / 100);
    }

    const grossProfitMargin = computed(() => {
      if (props.totalSummary.revenue === 0) return 0;
      return (props.totalSummary.profit / props.totalSummary.revenue) * 100;
    });

    const electricityCostRatio = computed(() => {
      if (props.totalSummary.revenue === 0) return 0;
      return (props.totalSummary.cost / props.totalSummary.revenue) * 100;
    });

    const totalCostOfOwnership = computed(() => {
      const hardwareCost = props.quantity * props.costOfHw;
      return props.totalSummary.cost + hardwareCost;
    });

    return {
      formatCurrency,
      formatPercentage,
      grossProfitMargin,
      electricityCostRatio,
      totalCostOfOwnership
    };
  },
});
</script>

<style lang="sass">
.dashboard-chart-stats
  margin-bottom: 10px

  &__rows
    margin-top: 20px

  &__row
    display: flex
    justify-content: space-between
    margin: 11px 0 0
    padding-bottom: 11px
    border-bottom: 1px solid rgba(82, 85, 93, 0.07)

    &:last-child
      border-bottom: none

    &__label
      color: rgb(120, 130, 157)
      font-weight: bold
      font-size: 15px
      max-width: 250px
      text-align: start

    &__item
      color: rgb(7, 20, 55)
      font-weight: bold
      font-size: 15px

      &__value
        margin-left: 5px
</style>