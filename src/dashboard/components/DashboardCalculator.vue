<template>
  <div class="ai-card dashboard-calculator">
    <h3 class="ai-title">Historical Calculation</h3>

    <div class="dashboard-calculator-form">
      <!-- Model Selection -->
      <div class="dashboard-calculator-form__item dashboard-calculator-form__item--model">
        <div class="label">
          <font-awesome-icon :icon="['fas', 'microchip']" class="icon mr-2" /> Model
        </div>

        <el-select
          v-model="miner"
          @change="setMinerData()"
          aria-label="Select miner name"
          value-key="id"
          filterable
        >
          <el-option
            v-for="item in filteredMiners"
            :value="item"
            :label="item.miner_name"
            :key="item.id"
          >
            {{ item?.miner_name }}
          </el-option>
        </el-select>

        <!-- Calculate Top 5 Revenue Performers Button -->
        <el-button
          type="outline"
          class="top-performers-button"
          @click="showTopPerformersDialog = true"
        >
          <font-awesome-icon :icon="['fas', 'chart-line']" class="icon mr-2" /> Calculate Top 5 Revenue Performers
        </el-button>
      </div>

      <!-- Power Field with Tooltip on Label and Input -->
      <div class="dashboard-calculator-form__item">
        <div class="label">
          <el-tooltip class="box-item" effect="dark" content="Watt" placement="top-end">
            <span>
              <font-awesome-icon :icon="['fas', 'bolt']" class="icon mr-2" /> Power
            </span>
          </el-tooltip>
        </div>

        <el-tooltip class="input-tooltip" effect="dark" content="Watt" placement="top">
          <el-input-number
            v-model="power"
            :min="1"
            placeholder="Power"
            class="input-with-tooltip"
          />
        </el-tooltip>
      </div>      

      <!-- Hashrate Field with Tooltip on Label and Input -->
      <div class="dashboard-calculator-form__item">
        <div class="label">
          <el-tooltip class="box-item" effect="dark" content="TH/s" placement="top-end">
            <span>
              <font-awesome-icon :icon="['fas', 'tachometer-alt']" class="icon mr-2" /> Hashrate
            </span>
          </el-tooltip>
        </div>

        <el-tooltip class="input-tooltip" effect="dark" content="TH/s" placement="top">
          <el-input-number
            v-model="hashrate"
            :min="0.1"
            :step="0.1"
            placeholder="Hashrate"
            class="input-with-tooltip"
          />
        </el-tooltip>
      </div>

      <!-- Quantity Input -->
      <div class="dashboard-calculator-form__item">
        <div class="label">
          <font-awesome-icon :icon="['fas', 'boxes']" class="icon mr-2" /> Quantity
        </div>

        <el-input-number v-model="quantity" :min="1" placeholder="Quantity" />
      </div>

      <!-- Energy Cost Field with Tooltip on Label and Input -->
      <div class="dashboard-calculator-form__item">
        <div class="label">
          <el-tooltip class="box-item" effect="dark" content="$ cents per kWh" placement="top-end">
            <span>
              <font-awesome-icon :icon="['fas', 'plug']" class="icon mr-2" /> Energy Cost
            </span>
          </el-tooltip>
        </div>

        <el-tooltip class="input-tooltip" effect="dark" content="$ cents per kWh" placement="top">
          <el-input-number
            v-model="powerCost"
            :min="0"
            :step="0.1"
            placeholder="Energy Cost"
            class="input-with-tooltip"
          />
        </el-tooltip>
      </div>

      <!-- Cost of Hardware Field with Tooltip on Label and Input -->
      <div class="dashboard-calculator-form__item">
        <div class="label">
          <el-tooltip class="box-item" effect="dark" content="$ per unit" placement="top-end">
            <span>
              <font-awesome-icon :icon="['fas', 'dollar-sign']" class="icon mr-2" /> Cost of hardware
            </span>
          </el-tooltip>
        </div>

        <el-tooltip class="input-tooltip" effect="dark" content="$ per unit" placement="top">
          <el-input-number
            v-model="costOfHw"
            :min="1"
            placeholder="Cost of hardware"
            class="input-with-tooltip"
          />
        </el-tooltip>
      </div>

      <!-- Start Date Picker -->
      <div class="dashboard-calculator-form__item">
        <div class="label">
          <font-awesome-icon :icon="['fas', 'calendar-alt']" class="icon mr-2" /> Start Date
        </div>
        <el-date-picker
          @change="onStartDateChange"
          v-model="startDate"
          type="date"
          placeholder="Select start date"
        ></el-date-picker>
      </div>

      <!-- End Date Picker -->
      <div class="dashboard-calculator-form__item">
        <div class="label">
          <font-awesome-icon :icon="['fas', 'calendar-alt']" class="icon mr-2" /> End Date
        </div>
        <el-date-picker
          @change="onEndDateChange"
          v-model="endDate"
          type="date"
          placeholder="Select end date"
        ></el-date-picker>
      </div>

      <!-- Calculate Button -->
      <div class="dashboard-calculator-form__item">
        <div class="label"></div>

        <el-button
          type="primary"
          :disabled="loading"
          @click="emitMiner()"
          class="ai-el-button"
          :loading="loading"
        >
          <font-awesome-icon :icon="['fas', 'calculator']" class="icon mr-2 button-icon" /> Calculate
        </el-button>
      </div>
    </div>

    <!-- Dialog for Top 5 Revenue Performers -->
    <el-dialog
      title="Top 5 Revenue Performers"
      :visible.sync="showTopPerformersDialog"
      width="30%"
    >
      <p>Highest-grossing models based on current market conditions:</p>
      <div v-if="isCalculatingTopPerformers" class="top-performers-loading">
        <font-awesome-icon :icon="['fas', 'spinner']" class="icon spin mr-2" /> Calculating...
      </div>
      <div v-else>
        <ul class="top-performers-list">
          <li v-for="(performer, index) in topPerformers" :key="index" class="top-performers-item">
            <font-awesome-icon :icon="['fas', 'medal']" class="icon mr-2" /> {{ performer.model }} - Revenue: {{ performer.revenue }}
          </li>
        </ul>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showTopPerformersDialog = false">Close</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import CryptoJS from "crypto-js";
import {
  defineComponent,
  onBeforeMount,
  onMounted,
  ref,
  computed,
  watch,
} from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";
import moment from "moment";
import { watchDebounced } from "@vueuse/core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faMicrochip, faBoxes, faTachometerAlt, faBolt, faPlug, faDollarSign, faCalendarAlt, faCalculator, faChartLine, faSpinner, faMedal } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

// Add the icons to the library so they can be used throughout the component
library.add(faMicrochip, faBoxes, faTachometerAlt, faBolt, faPlug, faDollarSign, faCalendarAlt, faCalculator, faChartLine, faSpinner, faMedal);

export default defineComponent({
  name: "dashboard-calculator",
  components: {
    FontAwesomeIcon,
  },
  props: {
    loading: Boolean,
  },
  emits: ["setMiner"],
  setup(props, ctx) {
    // Reactive Variables
    const miner = ref({
      id: "6575be05-70c3-4195-8dc0-2502deb80a85",
      miner_name: "Whatsminer M32",
      hashrate: 62,
      power: 3348,
    });
    const quantity = ref(10);
    const hashrate = ref(62);
    const power = ref(3348);
    const powerCost = ref(5.5);
    const costOfHw = ref(500);
    const startDate = ref(moment("2023-01-01", "YYYY-MM-DD").toDate());
    const endDate = ref(moment("2024-01-01", "YYYY-MM-DD").toDate());
    const showTopPerformersDialog = ref(false);
    const isCalculatingTopPerformers = ref(false);
    const topPerformers = ref([
      { model: "Antminer S19 XP", revenue: 0.00023456 },
      { model: "Whatsminer M50S", revenue: 0.00022345 },
      { model: "Avalon A1266", revenue: 0.00021234 },
      { model: "Antminer S19j Pro", revenue: 0.00020123 },
      { model: "Whatsminer M30S++", revenue: 0.00019012 },
    ]);

    // All Miners Data
    const allMiners = ref([]);

    // Computed Property for Filtered Miners
    const filteredMiners = computed(() => {
      // Filter miners based on release date
      let filtered = allMiners.value.filter((item) => {
        return moment(item.release).isBefore(startDate.value);
      });

      // Define the correct AsicID for Whatsminer M32
      const defaultAsicID = "6575be05-70c3-4195-8dc0-2502deb80a85"; // Correct AsicID

      // Sort miners, prioritizing Whatsminer M32
      filtered = filtered.sort((a, b) => {
        if (a.id === defaultAsicID) return -1;
        if (b.id === defaultAsicID) return 1;
        return a.miner_name.localeCompare(b.miner_name);
      });

      // Define the "OTHER" option
      const otherOption = {
        id: "other",
        miner_name: "OTHER",
        hashrate: 1,
        power: 1,
      };

      // Append the "OTHER" option to the filtered miners
      return [...filtered, otherOption];
    });

    // Function to Set Miner Data
    const setMinerData = () => {
      if (miner.value && miner.value.id === "other") {
        // If "OTHER" is selected, set Hashrate and Power to 1
        hashrate.value = 1;
        power.value = 1;
      } else if (miner.value) {
        // If a specific miner is selected, set Hashrate and Power based on the miner
        hashrate.value = miner.value.hashrate;
        power.value = miner.value.power;
      } else {
        // If no miner is selected, reset Hashrate and Power
        hashrate.value = 0;
        power.value = 0;
      }
    };

    // Validation Dates
    const startValidationDate = "2019-01-01";
    const endValidationDate = moment(new Date()).subtract(1, "days");

    // Start Date Change Handler
    const onStartDateChange = () => {
      const isAfter = moment(startDate.value).isAfter(startValidationDate);
      const isBefore = moment(startDate.value).isBefore(endValidationDate);
      if (!isAfter) {
        startDate.value = moment(startValidationDate).toDate();
        ElMessage({
          message: `Sorry, the earliest available date is ${moment(
            startValidationDate
          ).format("LL")}`,
          type: "error",
        });
      }
      if (!isBefore) {
        startDate.value = moment(endValidationDate).toDate();
        ElMessage({
          message: `Sorry, the latest available date is ${moment(
            endValidationDate
          ).format("LL")}`,
          type: "error",
        });
      }
    };

    // End Date Change Handler
    const onEndDateChange = () => {
      const isAfter = moment(endDate.value).isAfter(startValidationDate);
      const isBefore = moment(endDate.value).isBefore(endValidationDate);
      if (!isAfter) {
        endDate.value = moment(startValidationDate).toDate();
        ElMessage({
          message: `Sorry, the earliest available date is ${moment(
            startValidationDate
          ).format("LL")}`,
          type: "error",
        });
      }
      if (!isBefore) {
        endDate.value = moment(endValidationDate).toDate();
        ElMessage({
          message: `Sorry, the latest available date is ${moment(
            endValidationDate
          ).format("LL")}`,
          type: "error",
        });
      }
    };

    // Watcher for Start Date
    watch(startDate, () => {
      // If the current miner is no longer available in the filtered list
      if (
        miner.value &&
        !filteredMiners.value.some((m) => m.id === miner.value.id)
      ) {
        if (filteredMiners.value.length > 0) {
          // Select the first available miner from the filtered list
          miner.value = filteredMiners.value[0];
          setMinerData();
        } else {
          // If no miners are available, reset miner and related values
          miner.value = null;
          hashrate.value = 0;
          power.value = 0;
        }
      }
    });

    // Debounced Watcher for Input Changes
    watchDebounced(
      () => [
        quantity.value,
        hashrate.value,
        power.value,
        powerCost.value,
        costOfHw.value,
      ],
      () => {
        emitMiner();
      },
      { debounce: 500, maxWait: 1000 }
    );

    // Function to Emit Miner Data
    const emitMiner = () => {
      const minerData = {
        startDate: startDate.value,
        endDate: endDate.value,
        power_cost: powerCost.value,
        power: power.value,
        hash_rate: hashrate.value,
        quantity: quantity.value,
        cost_of_hw: costOfHw.value,
      };
      ctx.emit("setMiner", minerData);
    };

    // Function to Decode Data from URL
    const decodeObject = (encryptedString, secretKey = "salt") => {
      const bytes = CryptoJS.AES.decrypt(encryptedString, secretKey);
      const jsonString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    };

    // Function to Set Data from URL
    const setDataFromUrl = () => {
      let uri = window.location.search.substring(1);
      let params = new URLSearchParams(uri);
      const hash = params.get("hash");
      if (hash) {
        const decodedURI = decodeURIComponent(hash);
        const decodedMinerData = decodeObject(decodedURI);
        powerCost.value = decodedMinerData.power_cost;
        power.value = decodedMinerData.power;
        hashrate.value = decodedMinerData.hash_rate;
        quantity.value = decodedMinerData.quantity;
        costOfHw.value = decodedMinerData.cost_of_hw;
        startDate.value = moment(decodedMinerData.startDate).toDate();
        endDate.value = moment(decodedMinerData.endDate).toDate();
      }
    };

    // Fetch Miner Data on Before Mount
    onBeforeMount(() => {
      fetchFormData();
    });

    // Set Data from URL on Mount
    onMounted(() => {
      setDataFromUrl();
    });

    // Function to Fetch Miner Data from API
    const fetchFormData = () => {
      const host = import.meta.env.VITE_APP_API_HOST;

      axios
        .get(`${host}asics`)
        .then(function (response) {
          allMiners.value =
            response && response.data && response.data.items
              ? response.data.items.map((item) => ({
                  ...item,
                  hashrate: parseFloat(item.hashrate), // Ensure hashrate is a float
                }))
              : [];

          // Attempt to find the default miner in the filtered list
          const foundMiner = filteredMiners.value.find(
            (item) => item.miner_name === "Whatsminer M32"
          );
          if (foundMiner) {
            miner.value = foundMiner;
            setMinerData();
          } else if (filteredMiners.value.length > 0) {
            // If default miner isn't available, select the first miner in the filtered list
            miner.value = filteredMiners.value[0];
            setMinerData();
          } else {
            // If no miners are available, set miner to null
            miner.value = null;
            hashrate.value = 0;
            power.value = 0;
          }
        })
        .catch(function (error) {
          console.log("Form Fetch Error: ", error);
          ElMessage({
            message: "Failed to load miners. Please try again later.",
            type: "error",
          });
        });
    };

    // Return Variables and Functions to Template
    return {
      miner,
      quantity,
      hashrate,
      power,
      powerCost,
      costOfHw,
      startDate,
      endDate,
      onStartDateChange,
      onEndDateChange,
      emitMiner,
      setMinerData,
      filteredMiners,
      showTopPerformersDialog,
      isCalculatingTopPerformers,
      topPerformers,
    };
  },
});
</script>

<style lang="scss">
.dashboard-calculator {
  flex: 80%;
  padding: 20px; // Added padding for better spacing
  background-color: #fff; // Optional: background color for contrast
  border-radius: 8px; // Optional: rounded corners for aesthetics
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); // Optional: subtle shadow
}

.dashboard-calculator-form {
  display: flex;
  flex-wrap: wrap;
  gap: 20px; // Use gap for consistent spacing between items
  padding-bottom: 15px;
  justify-content: flex-start; // Align items to the start for better control
}

.dashboard-calculator-form__item {
  display: flex;
  flex-direction: column;
  flex: 1 1 220px; // Allow items to grow and shrink with a base width
  min-width: 200px; // Ensure a minimum width for better responsiveness
}

.dashboard-calculator-form__item--model {
  flex: 2 1 450px; // Make the model selection wider if needed
}

.label {
  margin-bottom: 5px; // Reduced margin for tighter spacing
  color: rgba(94, 98, 120, 1);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5; // Use line-height for better text spacing
}

.el-select,
.el-input-number,
.el-date-picker {
  width: 100%; // Ensure inputs take full width of their container
}

.top-performers-button {
  margin-top: 10px;
}

.button-primary__loader {
  width: 100%; // Make loader buttons responsive
  height: 40px; // Increased height for better click area
  padding: 0;
  text-align: center;
  transition: 0.3s linear;
}

.button-primary__loader_loading {
  opacity: 0.8;
}

.button-primary__loader__label {
  margin-left: auto; // Center label within the loader
  margin-right: auto;
}

.loader-left {
  margin-left: 5px;
}

.input-tooltip {
  width: 100%;
}

.input-with-tooltip {
  width: 100%;
}

.button-icon {
  margin-right: 8px;
}

.dialog-footer {
  text-align: right;
}

.top-performers-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.top-performers-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center; // Align icon and text vertically
}

.top-performers-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
}

@media only screen and (max-width: 1700px) {
  .dashboard-calculator-form__item {
    flex: 1 1 180px; // Adjust flex-basis for smaller screens
  }

  .dashboard-calculator-form__item--model {
    flex: 2 1 350px;
  }
}

@media only screen and (max-width: 1100px) {
  .dashboard-calculator-form {
    flex-direction: column;
    gap: 15px; // Reduce gap for single-column layout
  }

  .dashboard-calculator-form__item,
  .dashboard-calculator-form__item--model {
    flex: 1 1 100%;
    min-width: 100%;
  }

  .button-primary__loader {
    width: 100%;
  }
}
</style>