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
          @change="setMinerData"
          aria-label="Select miner name"
          value-key="id"
          filterable
          placeholder="Select a miner"
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

        <!-- Dig into the Models Details Button -->
        <el-button
          type="info"
          class="models-details-button"
          @click="showModelsDetailsDialog = true"
        >
          <font-awesome-icon :icon="['fas', 'chart-line']" class="icon mr-2" /> Dig into the Models Details
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
          <font-awesome-icon :icon="['fas', 'calendar-alt']" class="icon mr-2" /> Start
        </div>
        <el-date-picker
          @change="onStartDateChange"
          v-model="startDate"
          type="date"
          placeholder="Select start date"
          :picker-options="startPickerOptions"
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
          :picker-options="endPickerOptions"
        ></el-date-picker>
      </div>

      <!-- Calculate Button -->
      <div class="dashboard-calculator-form__item">
        <div class="label"></div>

        <el-button
          type="primary"
          :disabled="loading"
          @click="emitMiner"
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
      v-model="showTopPerformersDialog"
      width="40%"
    >
      <template #default>
        <p>This chart displays the highest-profit mining models based on the selected date range, comparing cumulative profits for each model:</p>
        <div v-if="isCalculatingTopPerformers" class="top-performers-loading">
          <font-awesome-icon :icon="['fas', 'spinner']" class="icon spin mr-2" /> Calculating...
        </div>
        <div v-else class="under-development-container">
          <!-- Image indicating processing or under development -->
          <img
            src="@/assets/img/chart_inprocess.png"
            alt="Chart In Process"
            class="under-development-image"
          />
          <!-- Friendly Message -->
          <p class="under-development-text">We're enhancing this feature. Stay tuned!</p>
        </div>
      </template>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showTopPerformersDialog = false">Close</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Dialog for Models Details -->
    <el-dialog
      title="Models Details"
      v-model="showModelsDetailsDialog"
      width="80%"
      @open="fetchModelsDetails"
      :before-close="handleModelsDetailsDialogClose"
      :modal-append-to-body="false"
    >
      <template #default>
        <!-- Loading Spinner Overlay -->
        <div v-if="isTableLoading" class="loading-overlay">
          <font-awesome-icon :icon="['fas', 'spinner']" class="icon spin" /> Loading...
        </div>

        <!-- Search Input -->
        <el-input
          v-model="searchQuery"
          placeholder="Search by Asic Name"
          clearable
          class="search-input"
          v-if="!isTableLoading"
        >
          <template #prefix>
            <font-awesome-icon :icon="['fas', 'search']" />
          </template>
        </el-input>

        <!-- Table Container with Scroll -->
        <div v-if="!isTableLoading" class="table-container">
          <el-table
            :data="filteredModelsDetails"
            style="width: 100%"
            :loading="isTableLoading"
            element-loading-text="Loading..."
            stripe
            border
            height="400"
            max-height="400"
            fit
            highlight-current-row
            :default-sort="{ prop: 'hashrate', order: 'descending' }"
          >
            <el-table-column
              prop="miner_name"
              label="Asic Name"
              width="200"
              sortable
            ></el-table-column>
            <el-table-column
              prop="hashrate"
              label="Hash Rate (TH/s)"
              width="150"
              sortable
            ></el-table-column>
            <el-table-column
              prop="power"
              label="Power (W)"
              width="150"
              sortable
            ></el-table-column>
            <!-- Efficiency Column -->
            <el-table-column
              prop="efficiency"
              label="Efficiency (TH/s per kW)"
              width="180"
              sortable
            >
              <template #default="scope">
                {{ scope.row.efficiency }}
              </template>
            </el-table-column>
            <el-table-column
              prop="release"
              label="Release Date"
              width="180"
              sortable
              :formatter="formatReleaseDate"
            ></el-table-column>
            <!-- Action Column with "Select" Button -->
            <el-table-column
              label="Action"
              width="120"
              fixed="right"
            >
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click="selectModel(scope.row)"
                >
                  <font-awesome-icon :icon="['fas', 'check']" class="icon mr-1" /> Select
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- No Data Message -->
        <div v-if="!isTableLoading && filteredModelsDetails.length === 0" class="no-data-message">
          No models found matching your search criteria.
        </div>
      </template>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showModelsDetailsDialog = false">Close</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onBeforeMount, onMounted } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";
import moment from "moment";
import { watchDebounced } from "@vueuse/core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faMicrochip,
  faBoxes,
  faTachometerAlt,
  faBolt,
  faPlug,
  faDollarSign,
  faCalendarAlt,
  faCalculator,
  faChartLine,
  faSpinner,
  faMedal,
  faSearch,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import CryptoJS from "crypto-js";

// Add the icons to the library
library.add(
  faMicrochip,
  faBoxes,
  faTachometerAlt,
  faBolt,
  faPlug,
  faDollarSign,
  faCalendarAlt,
  faCalculator,
  faChartLine,
  faSpinner,
  faMedal,
  faSearch,
  faCheck
);

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
    // Define Miner interface with efficiency
    interface Miner {
      id: string;
      miner_name: string;
      hashrate: number;
      power: number;
      release: string;
      efficiency: number; // Efficiency (TH/s per kW)
    }

    // State Variables
    const miner = ref<Miner | null>({
      id: "6575be05-70c3-4195-8dc0-2502deb80a85",
      miner_name: "Whatsminer M32",
      hashrate: 62,
      power: 3348,
      release: "2023-01-15",
      efficiency: parseFloat(((62 * 1000) / 3348).toFixed(2)), // TH/s per kW
    });
    const quantity = ref<number>(10);
    const hashrate = ref<number>(62); // Corrected variable name
    const power = ref<number>(3348);
    const powerCost = ref<number>(5.5);
    const costOfHw = ref<number>(500);
    const startDate = ref<Date>(moment("2023-01-01", "YYYY-MM-DD").toDate());
    const endDate = ref<Date>(moment("2024-01-01", "YYYY-MM-DD").toDate());
    const showTopPerformersDialog = ref<boolean>(false);
    const isCalculatingTopPerformers = ref<boolean>(false);
    const topPerformers = ref([
      { model: "Antminer S19 XP", revenue: 0.00023456 },
      { model: "Whatsminer M50S", revenue: 0.00022345 },
      { model: "Avalon A1266", revenue: 0.00021234 },
      { model: "Antminer S19j Pro", revenue: 0.00020123 },
      { model: "Whatsminer M30S++", revenue: 0.00019012 },
    ]);
    const showModelsDetailsDialog = ref<boolean>(false);
    const isTableLoading = ref<boolean>(false);
    const modelsDetails = ref<Array<Miner>>([]);
    const allMiners = ref<Array<Miner>>([]);

    const searchQuery = ref<string>("");

    // Computed Property for Filtered Miners in the Select Dropdown
    const filteredMiners = computed(() => {
      let filtered = allMiners.value.filter((item: Miner) => {
        return moment(item.release).isBefore(startDate.value, 'day');
      });

      const defaultAsicID = "6575be05-70c3-4195-8dc0-2502deb80a85";

      filtered = filtered.sort((a: Miner, b: Miner) => {
        if (a.id === defaultAsicID) return -1;
        if (b.id === defaultAsicID) return 1;
        return a.miner_name.localeCompare(b.miner_name);
      });

      const otherOption: Miner = {
        id: "other",
        miner_name: "OTHER",
        hashrate: 1,
        power: 1,
        release: "N/A",
        efficiency: parseFloat(((1 * 1000) / 1).toFixed(2)), // Assuming 1 TH/s per kW for "OTHER"
      };

      return [...filtered, otherOption];
    });

    // Computed Property for Filtered Models Details based on Search Query
    const filteredModelsDetails = computed(() => {
      if (!searchQuery.value) {
        return modelsDetails.value;
      }
      return modelsDetails.value.filter((model: Miner) =>
        model.miner_name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    // Method to Set Miner Data
    const setMinerData = () => {
      if (miner.value && miner.value.id === "other") {
        hashrate.value = 1;
        power.value = 1;
        miner.value.efficiency = parseFloat(((1 * 1000) / 1).toFixed(2)); // TH/s per kW
      } else if (miner.value) {
        hashrate.value = miner.value.hashrate;
        power.value = miner.value.power;
        miner.value.efficiency = parseFloat(((miner.value.hashrate * 1000) / miner.value.power).toFixed(2)); // TH/s per kW
      } else {
        hashrate.value = 0;
        power.value = 0;
        if (miner.value) {
          miner.value.efficiency = 0;
        }
      }
      console.log("Miner data set:", miner.value);
      console.log("Hashrate:", hashrate.value, "Power:", power.value, "Efficiency:", miner.value?.efficiency);
    };

    // Date Validation
    const startValidationDate = new Date("2019-01-01");
    const endValidationDate = moment(new Date()).subtract(1, "days").toDate();

    // Picker Options for Start and End Date Pickers
    const startPickerOptions = {
      disabledDate(time: Date) {
        return time.getTime() < startValidationDate.getTime() || time.getTime() > endValidationDate.getTime();
      },
    };

    const endPickerOptions = {
      disabledDate(time: Date) {
        return time.getTime() < startValidationDate.getTime() || time.getTime() > endValidationDate.getTime();
      },
    };

    // Date Change Handlers
    const onStartDateChange = () => {
      startDate.value = validateDate(startDate.value, startValidationDate, endValidationDate, "start");
      // Ensure miner is valid after date change
      if (
        miner.value &&
        !filteredMiners.value.some((m) => m.id === miner.value.id)
      ) {
        if (filteredMiners.value.length > 0) {
          miner.value = filteredMiners.value[0];
          setMinerData();
        } else {
          miner.value = null;
          hashrate.value = 0;
          power.value = 0;
        }
      }
      console.log("Start Date Changed:", startDate.value);
    };

    const onEndDateChange = () => {
      endDate.value = validateDate(endDate.value, startValidationDate, endValidationDate, "end");
      console.log("End Date Changed:", endDate.value);
    };

    // Utility Function for Date Validation
    const validateDate = (date: Date, minDate: Date, maxDate: Date, dateType: string): Date => {
      if (moment(date).isBefore(minDate, 'day')) {
        ElMessage({
          message: `Sorry, the earliest available date is ${moment(minDate).format("LL")}`,
          type: "error",
        });
        return minDate;
      }
      if (moment(date).isAfter(maxDate, 'day')) {
        ElMessage({
          message: `Sorry, the latest available date is ${moment(maxDate).format("LL")}`,
          type: "error",
        });
        return maxDate;
      }
      return date;
    };

    // Watchers
    watch(startDate, () => {
      if (
        miner.value &&
        !filteredMiners.value.some((m) => m.id === miner.value.id)
      ) {
        if (filteredMiners.value.length > 0) {
          miner.value = filteredMiners.value[0];
          setMinerData();
        } else {
          miner.value = null;
          hashrate.value = 0;
          power.value = 0;
        }
      }
    });

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

    // Emit Miner Data
    const emitMiner = () => {
      const minerData = {
        startDate: startDate.value,
        endDate: endDate.value,
        power_cost: powerCost.value,
        power: power.value,
        hash_rate: hashrate.value,
        quantity: quantity.value,
        cost_of_hw: costOfHw.value,
        efficiency: miner.value?.efficiency || 0,
      };
      console.log("Emitting Miner Data:", minerData);
      ctx.emit("setMiner", minerData);
    };

    // Decode Encrypted URL Parameters
    const decodeObject = (encryptedString: string, secretKey = "salt") => {
      const bytes = CryptoJS.AES.decrypt(encryptedString, secretKey);
      const jsonString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    };

    // Set Data from URL Parameters
    const setDataFromUrl = () => {
      let uri = window.location.search.substring(1);
      let params = new URLSearchParams(uri);
      const hash = params.get("hash");
      if (hash) {
        try {
          const decodedURI = decodeURIComponent(hash);
          const decodedMinerData = decodeObject(decodedURI);
          powerCost.value = decodedMinerData.power_cost;
          power.value = decodedMinerData.power;
          hashrate.value = decodedMinerData.hash_rate;
          quantity.value = decodedMinerData.quantity;
          costOfHw.value = decodedMinerData.cost_of_hw;
          startDate.value = moment(decodedMinerData.startDate).toDate();
          endDate.value = moment(decodedMinerData.endDate).toDate();
          // Recalculate efficiency after setting values
          setMinerData();
          console.log("Dates set from URL:", startDate.value, endDate.value);
        } catch (error) {
          console.error("Error decoding URL parameters:", error);
          ElMessage({
            message: "Failed to decode URL parameters.",
            type: "error",
          });
          // Optionally, reset to default dates
          startDate.value = moment("2023-01-01", "YYYY-MM-DD").toDate();
          endDate.value = moment("2024-01-01", "YYYY-MM-DD").toDate();
        }
      } else {
        console.log("No 'hash' parameter found in URL. Using default dates.");
      }
    };

    // Lifecycle Hooks
    onBeforeMount(() => {
      fetchFormData();
    });

    onMounted(() => {
      setDataFromUrl();
      console.log("Component Mounted. Start Date:", startDate.value, "End Date:", endDate.value);
    });

    // Fetch Form Data from Backend
    const fetchFormData = async () => {
      const host = import.meta.env.VITE_APP_API_HOST;

      try {
        const response = await axios.get(`${host}asics`);
        allMiners.value =
          response && response.data && response.data.items
            ? response.data.items.map((item: any) => ({
                id: item.id,
                miner_name: item.miner_name,
                hashrate: parseFloat(item.hashrate.toString()),
                power: parseInt(item.power.toString(), 10),
                release: item.release,
                efficiency: parseFloat(((item.hashrate * 1000) / item.power).toFixed(2)), // TH/s per kW
              }))
            : [];

        const foundMiner = filteredMiners.value.find(
          (item: Miner) => item.miner_name === "Whatsminer M32"
        );
        if (foundMiner) {
          miner.value = foundMiner;
          setMinerData();
        } else if (filteredMiners.value.length > 0) {
          miner.value = filteredMiners.value[0];
          setMinerData();
        } else {
          miner.value = null;
          hashrate.value = 0;
          power.value = 0;
        }

        console.log("Miners fetched successfully.");
      } catch (error) {
        console.log("Form Fetch Error: ", error);
        ElMessage({
          message: "Failed to load miners. Please try again later.",
          type: "error",
        });
      }
    };

    // Method to Fetch Models Details for the Dialog
    const fetchModelsDetails = async () => {
      isTableLoading.value = true;

      try {
        // Fetch miners from the backend
        const response = await axios.get(`${import.meta.env.VITE_APP_API_HOST}asics`);
        if (response && response.data && response.data.items) {
          // Filter miners based on the start date
          const filteredModels = response.data.items.filter((item: any) => {
            return moment(item.release).isBefore(startDate.value, 'day');
          });

          // Sort miners by Hash Rate descending
          const sortedModels = filteredModels.sort((a: any, b: any) => b.hashrate - a.hashrate);

          // Assign all filtered and sorted models to modelsDetails with efficiency
          modelsDetails.value = sortedModels.map((item: any) => ({
            id: item.id,
            miner_name: item.miner_name,
            hashrate: parseFloat(item.hashrate.toString()),
            power: parseInt(item.power.toString(), 10),
            release: item.release,
            efficiency: parseFloat(((item.hashrate * 1000) / item.power).toFixed(2)), // TH/s per kW
          }));
          console.log("Models Details fetched:", modelsDetails.value);
        } else {
          modelsDetails.value = [];
          ElMessage({
            message: "No miners data available.",
            type: "warning",
          });
        }
      } catch (error) {
        console.error("Error fetching models details:", error);
        ElMessage({
          message: "Failed to fetch models details. Please try again later.",
          type: "error",
        });
      } finally {
        isTableLoading.value = false;
      }
    };

    // Method to Format Release Date
    const formatReleaseDate = (row: Miner, column: any, cellValue: string) => {
      return moment(cellValue).format("MMM-YYYY"); // Formats to "Jan-2023"
    };

    // Handle Dialog Close to Reset Search Query and Models Details
    const handleModelsDetailsDialogClose = () => {
      searchQuery.value = "";
      modelsDetails.value = [];
      showModelsDetailsDialog.value = false;
      console.log("Models Details Dialog Closed.");
    };

    // Method to Handle Model Selection
    const selectModel = (model: Miner) => {
      miner.value = model;
      setMinerData();
      showModelsDetailsDialog.value = false;
      ElMessage({
        message: `${model.miner_name} has been selected.`,
        type: "success",
      });
      console.log("Model Selected:", model);
    };

    return {
      miner,
      quantity,
      hashrate, // Corrected variable name
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
      showModelsDetailsDialog,
      isTableLoading,
      modelsDetails,
      fetchModelsDetails,
      formatReleaseDate,
      searchQuery,
      filteredModelsDetails,
      handleModelsDetailsDialogClose,
      selectModel, // Exposed to template
      startPickerOptions,
      endPickerOptions,
    };
  },
});
</script>

<style lang="scss">
.dashboard-calculator {
  flex: 80%;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dashboard-calculator-form {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding-bottom: 15px;
  justify-content: flex-start;
}

.dashboard-calculator-form__item {
  display: flex;
  flex-direction: column;
  flex: 1 1 220px;
  min-width: 200px;
}

.dashboard-calculator-form__item--model {
  flex: 2 1 450px;
}

.label {
  margin-bottom: 5px;
  color: rgba(94, 98, 120, 1);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.el-select,
.el-input-number,
.el-date-picker,
.search-input {
  width: 100%;
}

.models-details-button {
  margin-top: 10px;
}

.button-primary__loader {
  width: 100%;
  height: 40px;
  padding: 0;
  text-align: center;
  transition: 0.3s linear;
}

.button-primary__loader_loading {
  opacity: 0.8;
}

.button-primary__loader__label {
  margin-left: auto;
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
  align-items: center;
}

.top-performers-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
}

/* Styles for the Under Development Message */
.under-development-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.under-development-image {
  max-width: 100%;
  height: auto;
  margin-bottom: 15px;
}

.under-development-text {
  font-size: 16px;
  color: #7e8299;
  text-align: center;
  font-weight: 500;
}

/* Styles for the Search Input */
.search-input {
  margin-bottom: 20px;
}

/* Styles for the Table Container */
.table-container {
  max-height: 400px;
  overflow-y: auto;
}

/* No Data Message */
.no-data-message {
  text-align: center;
  color: #7e8299;
  margin-top: 20px;
  font-size: 16px;
}

/* Spin Animation for Font Awesome Icons */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Loading Overlay */
.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  color: #7e8299;
}

/* Responsive Design */
@media only screen and (max-width: 1700px) {
  .dashboard-calculator-form__item {
    flex: 1 1 180px;
  }

  .dashboard-calculator-form__item--model {
    flex: 2 1 350px;
  }
}

@media only screen and (max-width: 1100px) {
  .dashboard-calculator-form {
    flex-direction: column;
    gap: 15px;
  }

  .dashboard-calculator-form__item,
  .dashboard-calculator-form__item--model {
    flex: 1 1 100%;
    min-width: 100%;
  }

  .button-primary__loader {
    width: 100%;
  }

  /* Adjust dialog width for smaller screens */
  .el-dialog {
    width: 90% !important;
  }
}
</style>