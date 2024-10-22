<template>
  <div class="dashboard-chart-stats ai-card">
    <div class="card-header border-0 pt-5">
      <h3 class="ai-title">Mining Financial Summary</h3>
      <span class="ai-sub-title">Stats for Selected Period</span>
    </div>

    <div class="dashboard-chart-stats__rows">
      <!-- MARKET REFERENCE -->
      <div class="section-title">MARKET REFERENCE</div>
      <div class="dashboard-chart-stats__row">
        <div class="dashboard-chart-stats__row__label">
          Bitcoin Price at Start
        </div>
        <div class="dashboard-chart-stats__row__item">
          <span class="dashboard-chart-stats__row__item__value main-value">
            {{ formatCurrency(startPriceValue, true) }}
          </span>
        </div>
      </div>

      <!-- PROFITABILITY -->
      <div class="section-title">PROFITABILITY</div>
      <div class="dashboard-chart-stats__row">
        <div class="dashboard-chart-stats__row__label">Gross Profit Margin</div>
        <div class="dashboard-chart-stats__row__item">
          <span class="dashboard-chart-stats__row__item__value main-value">
            {{ formatPercentage(grossProfitMargin) }}
          </span>
        </div>
      </div>

      <!-- COST STRUCTURE -->
      <div class="section-title">COST STRUCTURE</div>
      <div class="dashboard-chart-stats__row">
        <div class="dashboard-chart-stats__row__label">
          Total Cost of Ownership (TCO)
        </div>
        <div class="dashboard-chart-stats__row__item">
          <span class="dashboard-chart-stats__row__item__value main-value">
            {{ formatCurrency(totalCostOfOwnership) }}
          </span>
          <span class="percentage">(100%)</span>
        </div>
      </div>

      <div class="dashboard-chart-stats__row">
        <div class="dashboard-chart-stats__row__label">
          <span class="bullet electricity"></span>
          Electricity Cost
        </div>
        <div class="dashboard-chart-stats__row__item">
          <span class="dashboard-chart-stats__row__item__value">
            {{ formatCurrency(electricityCost) }}
          </span>
          <span class="percentage-share"
            >({{ formatPercentage(electricityCostPercentage) }})</span
          >
        </div>
      </div>

      <div class="dashboard-chart-stats__row">
        <div class="dashboard-chart-stats__row__label">
          <span class="bullet hardware"></span>
          Hardware Cost
        </div>
        <div class="dashboard-chart-stats__row__item">
          <span class="dashboard-chart-stats__row__item__value">
            {{ formatCurrency(hardwareCost) }}
          </span>
          <span class="percentage-share"
            >({{ formatPercentage(hardwareCostPercentage) }})</span
          >
        </div>
      </div>

      <!-- PERFORMANCE METRICS -->
      <div class="section-title">PERFORMANCE METRICS</div>
      <div class="dashboard-chart-stats__row">
        <div class="dashboard-chart-stats__row__label">
          Avg. Bitcoin Production Cost
        </div>
        <div class="dashboard-chart-stats__row__item">
          <span class="dashboard-chart-stats__row__item__value main-value">
            {{ formatCurrency(totalSummary.avgCostBtc, true) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch } from "vue";
import axios from "axios";
import moment from "moment";

export default defineComponent({
  name: "dashboard-chart-stats",
  props: {
    miner: {
      type: Object,
      required: true,
    },
    totalSummary: {
      type: Object,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const startPriceValue = ref(0);

    const formatCurrency = (item: number, alwaysUsd = false) => {
      const value = Math.abs(item);
      let prefix = item < 0 ? "-" : "";

      if (!alwaysUsd && props.currency === "BTC") {
        const formatter = new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 6,
          maximumFractionDigits: 6,
        });
        return prefix + "₿" + formatter.format(value);
      } else {
        const formatter = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return prefix + formatter.format(value); // Removed the substring(1) to keep the $
      }
    };

    const formatPercentage = (value: number) => {
      const absValue = Math.abs(value);
      const prefix = value < 0 ? "-" : "";
      return (
        prefix +
        new Intl.NumberFormat("en-US", {
          style: "percent",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(absValue / 100)
      );
    };

    const fetchStartPrice = async () => {
      const host = import.meta.env.VITE_APP_API_HOST;
      try {
        const response = await axios.post(`${host}btc_price_at_start`, {
          user_id: 0,
          time_mode: "daily",
          currency: props.currency,
          time_filter: {
            start_date: moment(props.startDate).format("YYYY-MM-DDTHH:mm:ss"),
            end_date: moment(props.endDate).format("YYYY-MM-DDTHH:mm:ss"),
          },
          hash_rate: props.miner.hash_rate,
          power: props.miner.power,
          power_cost: props.miner.power_cost,
          quantity: props.miner.quantity,
        });
        startPriceValue.value = response.data.price;
      } catch (error) {
        console.error("Error fetching BTC price:", error);
      }
    };

    onMounted(() => {
      fetchStartPrice();
    });

    watch(
      () => [props.startDate, props.miner],
      () => {
        fetchStartPrice();
      },
      { deep: true }
    );

    const grossProfitMargin = computed(() => {
      if (props.totalSummary.revenue === 0) return 0;
      return (props.totalSummary.profit / props.totalSummary.revenue) * 100;
    });

    const electricityCost = computed(() => props.totalSummary.cost);

    const hardwareCost = computed(() => {
      const totalHardwareCostUSD =
        props.miner.cost_of_hw * props.miner.quantity;

      if (props.currency === "BTC" && startPriceValue.value) {
        return totalHardwareCostUSD / startPriceValue.value;
      }
      return totalHardwareCostUSD;
    });

    const totalCostOfOwnership = computed(() => {
      // Always calculate total cost in USD first
      const totalHardwareCostUSD =
        props.miner.cost_of_hw * props.miner.quantity;
      const totalCostUSD =
        totalHardwareCostUSD +
        props.totalSummary.cost *
          (props.currency === "BTC" ? startPriceValue.value : 1);

      if (props.currency === "BTC" && startPriceValue.value) {
        return totalCostUSD / startPriceValue.value;
      }
      return totalCostUSD;
    });

    const electricityCostPercentage = computed(() => {
      if (totalCostOfOwnership.value === 0) return 0;
      if (props.currency === "BTC") {
        const electricityCostBTC = props.totalSummary.cost;
        return (electricityCostBTC / totalCostOfOwnership.value) * 100;
      } else {
        return (props.totalSummary.cost / totalCostOfOwnership.value) * 100;
      }
    });

    const hardwareCostPercentage = computed(() => {
      if (totalCostOfOwnership.value === 0) return 0;
      if (props.currency === "BTC") {
        return (hardwareCost.value / totalCostOfOwnership.value) * 100;
      } else {
        const hardwareCostUSD = props.miner.cost_of_hw * props.miner.quantity;
        return (hardwareCostUSD / totalCostOfOwnership.value) * 100;
      }
    });

    return {
      formatCurrency,
      formatPercentage,
      grossProfitMargin,
      startPriceValue,
      hardwareCost,
      electricityCost,
      totalCostOfOwnership,
      electricityCostPercentage,
      hardwareCostPercentage,
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
    margin: 8px 0
    padding-bottom: 8px
    border-bottom: 1px solid rgba(82, 85, 93, 0.07)

    &__label
      color: rgb(120, 130, 157)
      font-weight: 500
      font-size: 14px
      display: flex
      align-items: center
      gap: 8px

    &__item
      display: flex
      align-items: center
      gap: 4px
      color: rgb(7, 20, 55)
      font-weight: 600
      font-size: 14px

      &__value
        font-size: 14px

        &.main-value
          font-weight: 700
          font-size: 15px
          color: rgb(17, 24, 39)

.section-title
  color: rgb(107, 114, 128)
  font-size: 12px
  font-weight: 600
  letter-spacing: 0.5px
  margin: 24px 0 8px 0

  &:first-child
    margin-top: 0

.bullet
  width: 8px
  height: 8px
  border-radius: 50%
  display: inline-block

  &.electricity
    background-color: #3B82F6

  &.hardware
    background-color: #8B5CF6

.percentage
  font-size: 13px
  color: rgb(107, 114, 128)
  font-weight: 500

.percentage-share
  font-size: 13px
  color: rgb(79, 70, 229)
  font-weight: 500
  opacity: 0.9
</style>