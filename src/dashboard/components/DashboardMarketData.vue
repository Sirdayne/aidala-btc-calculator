<template>
  <div class="live-market-data">
    <div class="live-market-data__main">
      <div class="live-market-data__title">Live Market Data</div>

      <div class="live-market-data__content">
        <!-- BTC Price -->
        <div class="live-market-data-item__container">
          <div class="live-market-data-item__icon">
            <font-awesome-icon :icon="['fas', 'bitcoin-sign']" />
          </div>
          <div class="live-market-data-item">
            <div class="live-market-data-item__label">Price (BTC)</div>
            <div class="live-market-data-item__value">
              $ {{ btcPrice.toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- Difficulty -->
        <div class="live-market-data-item__container">
          <div class="live-market-data-item__icon">
            <font-awesome-icon :icon="['fas', 'network-wired']" />
          </div>
          <div class="live-market-data-item">
            <div class="live-market-data-item__label">Difficulty</div>
            <div class="live-market-data-item__value">
              83,126,997,340,025.00
            </div>
          </div>
        </div>
      </div>

      <button @click="showAsicForm = true" class="connect-asic-button">
        <font-awesome-icon
          :icon="['fas', 'plug']"
          class="connect-asic-button__icon"
        />
        <span>Connect Real ASIC</span>
        <span class="connect-asic-button__badge">New</span>
      </button>
    </div>

    <!-- ASIC Connection Modal -->
    <div v-if="showAsicForm" class="asic-modal">
      <div class="asic-modal__backdrop" @click="showAsicForm = false"></div>
      <div class="asic-modal__content">
        <div class="asic-modal__header">
          <div class="asic-modal__icon">
            <font-awesome-icon :icon="['fas', 'plug']" />
          </div>
          <div>
            <h3 class="asic-modal__title">Connect Your ASIC</h3>
            <p class="asic-modal__subtitle">Get real performance insights</p>
          </div>
        </div>

        <div class="asic-modal__preview">
          <div class="asic-modal__preview-row">
            <span>Current Hashrate</span>
            <span class="asic-modal__preview-value">{{ hashrate }} TH/s</span>
          </div>
          <div class="asic-modal__preview-row">
            <span>Actual Pool Hashrate</span>
            <span class="asic-modal__preview-soon">Coming Soon</span>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="asic-modal__form">
          <input
            type="email"
            v-model="email"
            placeholder="Your email"
            class="asic-modal__input"
            required
          />
          <select v-model="miningPool" class="asic-modal__input" required>
            <option value="">Select your mining pool</option>
            <option value="f2pool">F2Pool</option>
            <option value="antpool">AntPool</option>
            <option value="poolin">Poolin</option>
            <option value="binance">Binance Pool</option>
            <option value="other">Other</option>
          </select>
          <button type="submit" class="asic-modal__submit">
            <font-awesome-icon :icon="['fas', 'bolt']" />
            <span>Join Beta Access</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeMount, toRefs } from "vue";
import axios from "axios";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faBitcoinSign,
  faNetworkWired,
  faPlug,
  faBolt,
  faTachometerAlt,
} from "@fortawesome/free-solid-svg-icons";

library.add(faBitcoinSign, faNetworkWired, faPlug, faBolt, faTachometerAlt);

export default defineComponent({
  name: "dashboard-market-data",
  components: {
    FontAwesomeIcon,
  },
  props: {
    currentMiner: {
      type: String,
      required: true,
    },
    hashrate: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const { hashrate } = toRefs(props); // Make hashrate reactive
    const btcPrice = ref(67980.08);
    const volumeBtc = ref(0.17748118);
    const showAsicForm = ref(false);
    const email = ref("");
    const miningPool = ref("");

    onBeforeMount(() => {
      fetchBTCPrice();
    });

    const fetchBTCPrice = () => {
      const api = "https://api.blockchain.com/v3/exchange/tickers/BTC-USD";
      axios
        .get(api)
        .then((response) => {
          btcPrice.value = response?.data?.last_trade_price;
          volumeBtc.value = response?.data?.volume_24h;
        })
        .catch((error) => {
          console.log("Chart Error: ", error);
        });
    };

    const handleSubmit = () => {
      const payload = {
        email_address: email.value,
        comments: `Mining Pool: ${miningPool.value}, Miner: ${props.currentMiner}, Hashrate: ${hashrate.value} TH/s`,
      };

      axios
        .post("/api/send_demo_email", payload)
        .then((response) => {
          console.log("Email sent successfully", response);
          // Optionally, display a success message to the user
          alert("Your request has been submitted successfully!");
          showAsicForm.value = false;
          // Reset form fields
          email.value = "";
          miningPool.value = "";
        })
        .catch((error) => {
          console.error("Error sending email", error);
          // Optionally, handle the error, e.g., show a message to the user
          alert(
            "There was an error submitting your request. Please try again later."
          );
        });
    };

    return {
      volumeBtc,
      btcPrice,
      showAsicForm,
      email,
      miningPool,
      handleSubmit,
      hashrate, // Use the reactive hashrate ref
    };
  },
});
</script>

<style lang="sass">
.live-market-data
  background: #EEF6FF
  border-radius: 12px
  padding: 20px
  box-shadow: 0 3px 4px rgba(0, 0, 0, 0.03)

  &__main
    display: flex
    align-items: center
    justify-content: space-between
    gap: 20px

  &__title
    color: #3F4254
    font-size: 22px
    font-weight: 600
    white-space: nowrap

  &__content
    display: flex
    flex-grow: 1
    gap: 40px

.live-market-data-item
  &__container
    display: flex
    align-items: center
    gap: 12px

  &__icon
    width: 32px
    height: 32px
    background: rgba(40, 108, 255, 0.1)
    border-radius: 8px
    display: flex
    align-items: center
    justify-content: center
    font-size: 16px
    color: #286CFF

  &__label
    color: #A1A5B7
    font-size: 12px
    font-weight: 600
    margin-bottom: 4px

  &__value
    color: #3F4254
    font-size: 13px
    font-weight: 600

.connect-asic-button
  display: flex
  align-items: center
  gap: 8px
  padding: 10px 20px
  background: linear-gradient(135deg, #286CFF 0%, #1D5AE2 100%)
  border: none
  border-radius: 8px
  cursor: pointer
  white-space: nowrap
  transition: all 0.2s
  box-shadow: 0 2px 4px rgba(40, 108, 255, 0.2)

  &:hover
    transform: translateY(-1px)
    box-shadow: 0 4px 8px rgba(40, 108, 255, 0.3)

  &__icon
    font-size: 16px
    color: white

  span
    color: white
    font-size: 14px
    font-weight: 500

  &__badge
    padding: 2px 8px
    background: rgba(255, 255, 255, 0.2)
    border-radius: 12px
    color: white
    font-size: 11px
    font-weight: 600
    letter-spacing: 0.5px

.asic-modal
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  display: flex
  align-items: center
  justify-content: center
  z-index: 1000

  &__backdrop
    position: absolute
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: rgba(0, 0, 0, 0.5)
    backdrop-filter: blur(4px)

  &__content
    position: relative
    width: 100%
    max-width: 400px
    background: white
    border-radius: 12px
    padding: 24px
    margin: 20px
    z-index: 1
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15)

  &__header
    display: flex
    gap: 16px
    margin-bottom: 20px

  &__icon
    width: 40px
    height: 40px
    background: #EEF6FF
    border-radius: 8px
    display: flex
    align-items: center
    justify-content: center
    font-size: 20px
    color: #286CFF

  &__title
    color: #3F4254
    font-size: 18px
    font-weight: 600
    margin: 0 0 4px 0

  &__subtitle
    color: #A1A5B7
    font-size: 13px
    margin: 0

  &__preview
    background: #F9FAFB
    border-radius: 8px
    padding: 16px
    margin-bottom: 20px

  &__preview-row
    display: flex
    justify-content: space-between
    align-items: center
    color: #3F4254
    font-size: 13px
    &:not(:last-child)
      margin-bottom: 12px

  &__preview-value
    font-weight: 600
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace

  &__preview-soon
    color: #A1A5B7
    font-weight: 500
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace

  &__form
    display: flex
    flex-direction: column
    gap: 12px
    width: 100%

  &__input
    width: 100%
    padding: 12px
    border: 1px solid #E4E6EF
    border-radius: 8px
    font-size: 13px
    outline: none
    box-sizing: border-box
    &:focus
      border-color: #286CFF
      box-shadow: 0 0 0 2px rgba(40, 108, 255, 0.1)

  &__submit
    width: 100%
    padding: 12px
    background: #286CFF
    color: white
    border: none
    border-radius: 8px
    font-size: 14px
    font-weight: 600
    cursor: pointer
    transition: all 0.2s
    display: flex
    align-items: center
    justify-content: center
    gap: 8px

    &:hover
      background: #1D5AE2

@media only screen and (max-width: 1200px)
  .live-market-data
    &__main
      flex-direction: column
      align-items: flex-start

    &__content
      width: 100%
      flex-wrap: wrap
      gap: 20px

    .connect-asic-button
      width: 100%
      justify-content: center

@media only screen and (max-width: 500px)
  .live-market-data
    padding: 15px

    &__content
      flex-direction: column

  .asic-modal
    &__content
      margin: 16px
      padding: 16px
</style>