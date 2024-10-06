<template>
  <div class="ai-card dashboard-calculator">
    <h3 class="ai-title">Historical Calculation</h3>

    <div class="dashboard-calculator-form">
      <!-- Model Selection -->
      <div class="dashboard-calculator-form__item">
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
      </div>

      <!-- Quantity Input -->
      <div class="dashboard-calculator-form__item">
        <div class="label">
          <font-awesome-icon :icon="['fas', 'boxes']" class="icon mr-2" /> Quantity
        </div>

        <el-input-number v-model="quantity" :min="1" placeholder="Quantity" />
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
          <font-awesome-icon :icon="['fas', 'calendar-alt']" class="icon mr-2" /> Start
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
          <font-awesome-icon :icon="['fas', 'calendar-alt']" class="icon mr-2" /> End
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
import { faMicrochip, faBoxes, faTachometerAlt, faBolt, faPlug, faDollarSign, faCalendarAlt, faCalculator } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

// Add the icons to the library so they can be used throughout the component
library.add(faMicrochip, faBoxes, faTachometerAlt, faBolt, faPlug, faDollarSign, faCalendarAlt, faCalculator);

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
    };
  },
});
</script>

<style lang="scss">
.dashboard-calculator {
  flex: 80%;
}
.dashboard-calculator-form {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  padding-bottom: 15px;
}

.button-primary__loader {
  width: 150px;
  height: 32px;
  padding: 0;
  text-align: start;
  transition: 0.3s linear;
}

.button-primary__loader_loading {
  opacity: 0.8;
}

.button-primary__loader__label {
  margin-left: calc(50% - 30px);
}

.loader-left {
  margin-left: 5px;
}

.dashboard-calculator-form__item {
  margin-top: 15px;
  width: 220px;
}

.dashboard-calculator-form__item .label {
  margin-bottom: 3px;
  color: rgba(94, 98, 120, 1);
  font-size: 14px;
  font-weight: 600;
  line-height: 14px;
  height: 28px;
  overflow: hidden;
}

/* Optional: Styling for input tooltips */
.input-tooltip {
  width: 100%;
}

.input-with-tooltip {
  width: 100%;
}

.button-icon {
  margin-right: 8px;
}

@media only screen and (max-width: 1700px) {
  .dashboard-calculator-form__item {
    width: 180px;
  }

  .dashboard-calculator-form {
    .el-date-editor.el-input,
    .el-date-editor.el-input__wrapper {
      width: 180px;
    }
  }
}

@media only screen and (max-width: 1100px) {
  .dashboard-calculator-form {
    display: block;

    .el-date-editor.el-input,
    .el-date-editor.el-input__wrapper {
      width: 100%;
    }
  }

  .dashboard-calculator-form__item {
    margin-bottom: 15px;
    width: 100%;
  }

  .button-primary__loader {
    width: 100%;
  }
}
</style>