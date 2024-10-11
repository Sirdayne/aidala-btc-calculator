<template>
  <div class="ai-card dashboard-trading-analysis">
    <div class="card-header border-0 pt-5">
      <h3 class="ai-title">Trade Impact</h3>
      <span class="ai-sub-title">BTC Selling Strategy Comparison</span>
    </div>

    <div class="dashboard-trading-analysis__content">
      <div
        v-for="(item, index) in state.totals"
        :key="index"
        class="dashboard-trading-analysis__row"
        :class="{
          'dashboard-trading-analysis__row_active': sellMode === item.sell_mode,
        }"
      >
        <div class="dashboard-trading-analysis__row__label">
          <div class="ai-form-check">
            <input
              class="ai-form-check-input"
              type="radio"
              :checked="sellMode === item.sell_mode"
              @change="checkSellMode(item.sell_mode)"
            />
            <label class="ai-form-check-label">
              <font-awesome-icon :icon="getIcon(item.sell_mode)" class="icon mr-2" />
              {{ item.label }}
            </label>
          </div>
        </div>

        <div class="dashboard-trading-analysis__row__items">
          <div class="dashboard-trading-analysis__row__item">
            <div class="dashboard-trading-analysis__row__item__value">
              {{ formatCurrency(item.total_rev_usd) }}
            </div>
            <div class="dashboard-trading-analysis__row__item__label">
              Revenue
            </div>
          </div>

          <div class="dashboard-trading-analysis__row__item">
            <div class="dashboard-trading-analysis__row__item__value">
              {{ formatCurrency(item.total_cost_usd) }}
            </div>
            <div class="dashboard-trading-analysis__row__item__label">Cost</div>
          </div>

          <div class="dashboard-trading-analysis__row__item">
            <div class="dashboard-trading-analysis__row__item__value">
              {{ formatCurrency(item.total_profit_usd) }}
            </div>
            <div 
              class="dashboard-trading-analysis__row__item__label"
              :class="{'dashboard-trading-analysis__row__item__label_negative': item.total_profit_usd < 0}"
            >
              Profit
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, watch } from "vue";
import axios from "axios";
import moment from "moment";
import { useCalculatorStore } from "@/stores";
import { storeToRefs } from "pinia";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faCalendarDay,
  faCalendarWeek,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";

library.add(faCalendarDay, faCalendarWeek, faCalendarAlt);

export default defineComponent({
  name: "dashboard-trading-analysis",
  components: {
    FontAwesomeIcon,
  },
  props: {
    timeMode: String,
    miner: Object,
    startDate: String,
    endDate: String,
    currency: String,
  },
  emits: ["emitTotalsSummary"],
  setup(props, ctx) {
    const calculatorStore = useCalculatorStore();
    const { sellMode } = storeToRefs(calculatorStore);

    const state = reactive({
      totals: [
        {
          sell_mode: "daily",
          total_cost_usd: 0,
          total_profit_usd: 0,
          total_rev_usd: 0,
          avg_cost_per_btc: 0,
          label: "Everyday",
        },
        {
          sell_mode: "weekly",
          total_cost_usd: 0,
          total_profit_usd: 0,
          total_rev_usd: 0,
          avg_cost_per_btc: 0,
          label: "Once a week",
        },
        {
          sell_mode: "monthly",
          total_cost_usd: 0,
          total_profit_usd: 0,
          total_rev_usd: 0,
          avg_cost_per_btc: 0,
          label: "Once a month",
        },
      ],
    });

    watch(
      () => [props.currency, props.miner, props.timeMode],
      () => {
        fetchSummaries();
      },
      { deep: true }
    );

    onMounted(() => {
      fetchSummaries(true);
    });

    const fetchSummaries = (chooseBestProfit = false) => {
      const host = import.meta.env.VITE_APP_API_HOST;
      const endpoint = "summaries";

      const minerValue =
        props && props.miner && props.miner ? props.miner : null;
      let body;

      if (minerValue) {
        body = {
          user_id: 0,
          time_mode: props.timeMode,
          sell_mode: sellMode.value,
          currency: props.currency,
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
      }

      axios
        .post(`${host}${endpoint}`, body)
        .then(function (response) {
          const totals = response?.data?.data ? response.data.data : [];
          setStateTotals(totals);
          if (chooseBestProfit) {
            checkSellMode(state.totals[0].sell_mode);
          }
        })
        .catch(function (error) {
          console.log("Chart Error: ", error);
        });
    };

    const checkSellMode = (mode) => {
      console.log("Selected sellMode:", mode);
      calculatorStore.setSellMode(mode);
      setTotalsFromSellMode(mode);
    };

    const setTotalsFromSellMode = (mode) => {
      const foundTotal = state.totals.find((item) => item.sell_mode === mode);
      setTotalsSummary(foundTotal);
    };

    const totalLabels = {
      daily: "Sell Daily",
      weekly: "Sell Weekly",
      monthly: "Sell Monthly",
    };

    const getIcon = (sellMode) => {
      switch (sellMode) {
        case "daily":
          return ["fas", "calendar-day"];
        case "weekly":
          return ["fas", "calendar-week"];
        case "monthly":
          return ["fas", "calendar-alt"];
        default:
          return ["fas", "calendar-alt"];
      }
    };
    const setStateTotals = (response) => {
      response.forEach((item) => {
        item.label = totalLabels[item.sell_mode];
      });
      state.totals = response.sort(
        (a, b) => b.total_profit_usd - a.total_profit_usd
      );
      setTotalsSummary(state.totals[0]);
    };

    const setTotalsSummary = (summary: any) => {
      ctx.emit("emitTotalsSummary", {
        revenue: summary.total_rev_usd,
        cost: summary.total_cost_usd,
        profit: summary.total_profit_usd,
        avgCostBtc: summary.avg_cost_per_btc,
      });
    };

    const formatCurrency = (item) => {
      if (props.currency === "BTC") {
        const formatter = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 6,
          maximumFractionDigits: 6,
        });
        return formatter.format(item).replace("$", "₿");
      } else {
        const formatter = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return formatter.format(item);
      }
    };

    return {
      props,
      formatCurrency,
      state,
      sellMode,
      checkSellMode,
      getIcon,
    };
  },
});
</script>

<style lang="sass">
.dashboard-trading-analysis
  width: 100%

  .card-header
    margin-bottom: 20px

  &__content
    margin-top: 15px

  &__row
    margin-bottom: 12px
    padding: 10px 55px 10px 15px
    display: flex
    justify-content: space-between
    align-items: center
    border-radius: 6px
    border: 1px #E1E3EA dashed

    &__label
      flex: 1

    &__items
      flex: 3
      display: flex
      justify-content: space-between

    &__item
      text-align: center

      &__value
        color: #7E8299
        font-size: 18px
        font-weight: 600
        line-height: 20px

      &__label
        margin-top: 8px
        color: #E1E3EA
        font-size: 18px
        font-weight: 600
        line-height: 18px

        &_negative
          color: rgb(237, 79, 79)

    &_active
      background: #EEF6FF
      border: 1px #3E97FF dashed

      .dashboard-trading-analysis__row__item__value
        color: #3F4254

      .dashboard-trading-analysis__row__item__label
        color: rgba(71, 190, 125, 1)

        &_negative
          color: rgb(237, 79, 79)

  .ai-form-check
    display: flex
    align-items: center

    &-input
      margin-right: 10px

    &-label
      color: #3F4254
      font-size: 16px
      font-weight: 600

@media only screen and (max-width: 1000px)
  .dashboard-trading-analysis__row
    display: block

    &__label
      margin-bottom: 15px

    &__items
      width: 100%

    &__item
      padding-left: 45px

      &__value
        margin-top: 20px
        text-align: start

      &__label
        margin-top: 5px
        text-align: start
</style>