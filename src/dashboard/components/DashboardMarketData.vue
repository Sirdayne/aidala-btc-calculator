<template>
  <div class="live-market-data">

    <div class="live-market-data__title">
      Live Market Data
    </div>

    <div class="live-market-data__content">
      <div class="live-market-data-item__container">
        <img
            alt="Logo"
            src="@/assets/img/btc.png"
            class="live-market-data__logo"
        />

        <div class="live-market-data-item">
          <div class="live-market-data-item__label">
            Price(BTC)
          </div>

          <div class="live-market-data-item__value">
            $ {{ btcPrice.toLocaleString() }}
          </div>
        </div>
      </div>

      <div class="live-market-data-item__container">
        <img
            alt="Logo"
            src="@/assets/img/btc.png"
            class="live-market-data__logo"
        />

        <div class="live-market-data-item">
          <div class="live-market-data-item__label">
            Difficulty
          </div>

          <div class="live-market-data-item__value">
            83,126,997,340,025.00
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeMount } from "vue";
import axios from 'axios';

export default defineComponent({
  name: "dashboard-market-data",
  components: {},
  setup() {

    const btcPrice = ref(67980.08);
    const volumeBtc = ref(0.17748118);

    onBeforeMount(() => {
      fetchBTCPrice();
    })

    const fetchBTCPrice = () => {
      const api = 'https://api.blockchain.com/v3/exchange/tickers/BTC-USD';

      axios.get(api)
          .then(function (response) {
            btcPrice.value = response?.data?.last_trade_price;
            volumeBtc.value = response?.data?.volume_24h;
          })
          .catch(function (error) {
            console.log('Chart Error: ', error);
          });
    }

    return {
      volumeBtc,
      btcPrice
    };
  },
});
</script>

<style lang="sass">
.live-market-data
  display: flex
  justify-content: space-between
  align-items: center
  margin-top: 20px
  padding: 30px 40px
  background: #EEF6FF
  box-shadow: 0 3px 4px rgba(0, 0, 0, 0.03)
  border-radius: 12px

  &__content
    display: flex

  &__title
    color: #3F4254
    font-size: 22px
    font-weight: 600
    line-height: 22px

  &__logo
    width: 48px
    height: auto
    margin-right: 12px

  &-item

    &__container
      margin-left: 80px
      display: flex
      justify-content: center
      align-content: start

    &__label
      color: #A1A5B7
      font-size: 12px
      font-weight: 600
      line-height: 12px
      margin-top: 6px

    &__value
      color: #3F4254
      font-size: 13px
      font-weight: 600
      line-height: 14px
      margin-top: 9px

@media only screen and (max-width: 1200px)
  .live-market-data
    display: block

  .live-market-data-item__container
    margin: 20px 20px 0 0
    justify-content: start
</style>
