<template>
  <div class="ai-card dashboard-trading-analysis">
    <h3 class="ai-title">Trading analysis (Basic)</h3>

    <div class="dashboard-trading-analysis__content">
      <div class="dashboard-trading-analysis__tabs">
        <div class="dashboard-trading-analysis__tab dashboard-trading-analysis__tab_active">
          Result if BTC Sold
        </div>

        <div v-if="false" class="dashboard-trading-analysis__tab">
          Result if BTC not Sold
        </div>
      </div>

      <div class="dashboard-trading-analysis__line"></div>

      <div v-for="(item, index) in state.totals"
           :key="index" class="dashboard-trading-analysis__option"
           :class="{'dashboard-trading-analysis__option_active': sellMode === item.sell_mode }"
           v-show="timeMode !== 'daily' || item.sell_mode === 'daily'"
      >
        <div class="ai-form-check">
          <div class="dashboard-trading-analysis__option__check-line"></div>
          <input class="ai-form-check-input" type="checkbox" :checked="sellMode === item.sell_mode" @change="setSellMode(item.sell_mode)"/>
          <label class="ai-form-check-label" for="">
            {{ item.label }}
          </label>
        </div>

        <div class="dashboard-trading-analysis__option__item">
          <div class="dashboard-trading-analysis__option__item__value">{{ formatCurrency(item.total_rev_usd) }}</div>
          <div class="dashboard-trading-analysis__option__item__label" :class="{'dashboard-trading-analysis__option__item__label_negative': item.total_rev_usd < 0}">Revenue</div>
        </div>

        <div class="dashboard-trading-analysis__option__item">
          <div class="dashboard-trading-analysis__option__item__value">{{ formatCurrency(item.total_cost_usd) }}</div>
          <div class="dashboard-trading-analysis__option__item__label" :class="{'dashboard-trading-analysis__option__item__label_negative': item.total_cost_usd < 0}">Cost</div>
        </div>

        <div class="dashboard-trading-analysis__option__item">
          <div class="dashboard-trading-analysis__option__item__value">{{ formatCurrency(item.total_profit_usd) }}</div>
          <div class="dashboard-trading-analysis__option__item__label" :class="{'dashboard-trading-analysis__option__item__label_negative': item.total_profit_usd < 0}">Profit</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, onMounted, reactive, ref, watch } from "vue";
import axios from 'axios';
import moment from "moment";

export default defineComponent({
  name: "dashboard-trading-analysis",
  props: {
    timeMode: String,
    miner: Object,
    startDate: String,
    endDate: String,
    currency: String,
  },
  emits: ['emitSellMode', 'emitTotalsSummary'],
  setup(props, ctx) {

    const state = reactive({
      totals: [
        {
          sell_mode: "daily",
          total_cost_usd: 0,
          total_profit_usd: 0,
          total_rev_usd: 0,
          avg_cost_per_btc: 0,
          label: "Everyday"
        },
        {
          sell_mode: "weekly",
          total_cost_usd: 0,
          total_profit_usd: 0,
          total_rev_usd: 0,
          avg_cost_per_btc: 0,
          label: "Once a week"
        },
        {
          sell_mode: "monthly",
          total_cost_usd: 0,
          total_profit_usd: 0,
          total_rev_usd: 0,
          avg_cost_per_btc: 0,
          label: "Once a month"
        },
      ]
    })

    const sellMode = ref('daily');

    watch(
        () => props.currency,
        (newValue, oldValue) => {
          fetchSummaries();
        },
        { deep: true }
    )

    watch(
        () => props.miner,
        (newValue, oldValue) => {
          fetchSummaries();
        },
        { deep: true }
    )

    // watch(
    //     () => sellMode,
    //     (newValue, oldValue) => {
    //       fetchSummaries();
    //     },
    //     { deep: true }
    // )

    watch(
        () => props.timeMode,
        (newValue, oldValue) => {
          if (newValue as any === 'daily') {
            setSellMode('daily');
          }
          fetchSummaries();
        },
        { deep: true }
    )

    onMounted(() => {
      fetchSummaries(true);
    });


    const fetchSummaries = (chooseBestProfit = false) => {
      if (props.timeMode === "daily" && sellMode.value === "monthly") {
        return;
      }
      const host = import.meta.env.VITE_APP_API_HOST;
      const endpoint = 'summaries';

      const minerValue = props && props.miner && props.miner ? props.miner : null;
      let body;

      if (minerValue) {
        body = {
          user_id: 0,
          time_mode: props.timeMode,
          sell_mode: sellMode.value,
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
            const totals = response?.data?.data ? response.data.data : [];
            setStateTotals(totals);
            if (chooseBestProfit) {
              setSellMode(state.totals[0].sell_mode);
            }
          })
          .catch(function (error) {
            console.log('Chart Error: ', error);
            // setRandomChart();
          });
    }

    const setSellMode = (mode) => {
      sellMode.value = mode;
      ctx.emit('emitSellMode', mode);
      setTotalsFromSellMode(mode);
    }

    const setTotalsFromSellMode = (mode) => {
      const foundTotal = state.totals.find(item => item.sell_mode === mode);
      setTotalsSummary(foundTotal);
    }

    const totalLabels = {
      daily: 'Everyday',
      weekly: 'Once a week',
      monthly: 'Once a month'
    }
    const setStateTotals = (response) => {
      response.forEach(item => {
        item.label = totalLabels[item.sell_mode]
      })
      state.totals = response.sort((a, b) => b.total_profit_usd - a.total_profit_usd);
      setTotalsSummary(state.totals[0]);
    }

    const setTotalsSummary = (summary: any) => {
      ctx.emit('emitTotalsSummary', {
        revenue: summary.total_rev_usd,
        cost: summary.total_cost_usd,
        profit: summary.total_profit_usd,
        avgCostBtc: summary.avg_cost_per_btc
      });
    }

    const formatCurrency = (item) => {
      if (props.currency === 'BTC') {
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 6,
          maximumFractionDigits: 6
        });
        return formatter.format(item).replace('$', '₿');
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
      props,
      formatCurrency,
      state,
      sellMode,
      setSellMode
    };
  },
});
</script>

<style lang="sass">
.dashboard-trading-analysis
  width: 100%

  &__content
    margin-top: 15px

  &__tabs
    margin-top: 10px
    display: flex
    gap: 37px

  &__tab
    color: #A1A5B7
    font-size: 16px
    font-weight: 600
    line-height: 16px
    padding: 0 0 10px 0
    cursor: pointer

    &_active
      color: #3F4254
      border-bottom: 1px solid rgba(62, 151, 255, 1)

  &__line
    width: 100%
    height: 1px
    background: rgba(225, 227, 234, 1)
    margin-bottom: 10px

  &__option
    margin-bottom: 12px
    padding: 10px 55px 10px 15px
    display: flex
    justify-content: space-between
    align-items: center
    border-radius: 6px
    border: 1px #E1E3EA dashed

    &__check-line
      height: 30px
      width: 3px
      background: rgba(62, 151, 255, 1)
      margin-right: 7px

    &__item

      &__value
        color: #7E8299
        font-size: 18px
        font-weight: 600
        line-height: 20px
        text-align: center

      &__label
        margin-top: 8px
        color: #E1E3EA
        font-size: 18px
        font-weight: 600
        line-height: 18px
        text-align: center

    &_active
      background: #EEF6FF
      border: 1px #3E97FF dashed

      .dashboard-trading-analysis__option__check-line
        background: #47BE7D

      .dashboard-trading-analysis__option__item__value
        color: #3F4254

      .dashboard-trading-analysis__option__item__label
        color: rgba(71, 190, 125, 1)

        &_negative
          color: rgb(237, 79, 79)

@media only screen and (max-width: 1000px)
  .dashboard-trading-analysis__option
    display: block

    &__item
      padding-left: 45px

      &__value
        margin-top: 20px
        text-align: start

      &__label
        margin-top: 5px
        text-align: start
</style>
