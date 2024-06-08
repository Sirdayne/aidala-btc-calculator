<template>
  <div class="dashboard-chart-stats ai-card">
    <div class="card-header border-0 pt-5">
      <h3 class="ai-title">Mining Financial Summary</h3>
      <span class="ai-sub-title">Stats for Selected Period</span>
    </div>
    <div class="dashboard-chart-stats__rows">

      <div class="dashboard-chart-stats__row">
        <div class="dashboard-chart-stats__row__label">Total Revenue</div>
        <div class="dashboard-chart-stats__row__item">
          <DashboardArrow :state="totalSummary.revenue >= 0 ? 'up' : 'down'"></DashboardArrow>
          <span
              class="dashboard-chart-stats__row__item__value"
          >
            {{ formatCurrency(totalSummary.revenue) }}
          </span>
        </div>
      </div>

      <div class="dashboard-chart-stats__row">
        <div class="dashboard-chart-stats__row__label">Total Costs</div>
        <div class="dashboard-chart-stats__row__item">
          <DashboardArrow :state="totalSummary.cost >= 0 ? 'up' : 'down'"></DashboardArrow>
          <span
              class="dashboard-chart-stats__row__item__value"
          >
            {{ formatCurrency(totalSummary.cost) }}
          </span>
        </div>
      </div>

      <div class="dashboard-chart-stats__row">
        <div class="dashboard-chart-stats__row__label">Cumulative Net Profit</div>
        <div class="dashboard-chart-stats__row__item">
          <DashboardArrow :state="totalSummary.profit >= 0 ? 'up' : 'down'"></DashboardArrow>
          <span
              class="dashboard-chart-stats__row__item__value"
          >
            {{ formatCurrency(totalSummary.profit) }}
          </span>
        </div>
      </div>

      <div class="dashboard-chart-stats__row">
        <div class="dashboard-chart-stats__row__label">Average Cost of Production per Bitcoin (USD)</div>
        <div class="dashboard-chart-stats__row__item">
          <DashboardArrow :state="totalSummary.avgCostBtc >= 0 ? 'up' : 'down'"></DashboardArrow>
          <span
              class="dashboard-chart-stats__row__item__value"
          >
            {{ formatCurrency(totalSummary.avgCostBtc, true) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref, watch } from "vue";
import DashboardArrow from "./DashboardArrow.vue";

export default defineComponent({
  name: "dashboard-chart-stats",
  props: {
    miner: Object,
    totalSummary: Object,
    currency: String,
  },
  components: {
    DashboardArrow
  },
  setup(props, ctx) {
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

    return {
      formatCurrency
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
