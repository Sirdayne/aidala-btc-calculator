<template>
  <div class="ai-card dashboard-calculator">
    <div class="dashboard-calculator-form">
      <!-- Form Groups and Inputs -->
      <div class="form-group calculator-top">
        <!-- Model Selection -->
        <div class="form-group model-group">
          <div
            class="dashboard-calculator-form__item dashboard-calculator-form__item--model"
          >
            <div class="label">
              <font-awesome-icon
                :icon="['fas', 'microchip']"
                class="icon mr-2"
              />
              Model
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
            <el-button
              type="info"
              class="models-details-button"
              @click="showModelsDialog = true"
            >
              <font-awesome-icon
                :icon="['fas', 'chart-line']"
                class="icon mr-2"
              />
              Browse Models
            </el-button>
          </div>
        </div>

        <!-- Specs Group: Power and Hashrate -->
        <div class="form-group specs-group">
          <!-- Power Input -->
          <div class="dashboard-calculator-form__item">
            <div class="label">
              <el-tooltip
                class="box-item"
                effect="dark"
                content="Watt"
                placement="top-end"
              >
                <span>
                  <font-awesome-icon
                    :icon="['fas', 'bolt']"
                    class="icon mr-2"
                  />
                  Power
                </span>
              </el-tooltip>
            </div>
            <el-tooltip
              class="input-tooltip"
              effect="dark"
              content="Watt"
              placement="top"
            >
              <el-input-number
                v-model="power"
                :min="1"
                placeholder="Power"
                class="input-with-tooltip"
              />
            </el-tooltip>
          </div>

          <!-- Hashrate Input -->
          <div class="dashboard-calculator-form__item">
            <div class="label">
              <el-tooltip
                class="box-item"
                effect="dark"
                content="TH/s"
                placement="top-end"
              >
                <span>
                  <font-awesome-icon
                    :icon="['fas', 'tachometer-alt']"
                    class="icon mr-2"
                  />
                  Hashrate
                </span>
              </el-tooltip>
            </div>
            <el-tooltip
              class="input-tooltip"
              effect="dark"
              content="TH/s"
              placement="top"
            >
              <el-input-number
                v-model="hashrate"
                :min="0.1"
                :step="0.1"
                placeholder="Hashrate"
                class="input-with-tooltip"
              />
            </el-tooltip>
          </div>
        </div>
      </div>

      <!-- Costs Group: Quantity, Energy Cost, Hardware Cost -->
      <div class="form-group costs-group">
        <!-- Quantity Input -->
        <div class="dashboard-calculator-form__item">
          <div class="label">
            <font-awesome-icon :icon="['fas', 'boxes']" class="icon mr-2" />
            Quantity
          </div>
          <el-input-number v-model="quantity" :min="1" placeholder="Quantity" />
        </div>

        <!-- Energy Cost Input -->
        <div class="dashboard-calculator-form__item">
          <div class="label">
            <el-tooltip
              class="box-item"
              effect="dark"
              content="$ cents per kWh"
              placement="top-end"
            >
              <span>
                <font-awesome-icon :icon="['fas', 'plug']" class="icon mr-2" />
                Energy Cost
              </span>
            </el-tooltip>
          </div>
          <el-tooltip
            class="input-tooltip"
            effect="dark"
            content="$ cents per kWh"
            placement="top"
          >
            <el-input-number
              v-model="powerCost"
              :min="0"
              :step="0.1"
              placeholder="Energy Cost"
              class="input-with-tooltip"
            />
          </el-tooltip>
        </div>

        <!-- Cost of Hardware Input -->
        <div class="dashboard-calculator-form__item">
          <div class="label">
            <el-tooltip
              class="box-item"
              effect="dark"
              content="$ per unit"
              placement="top-end"
            >
              <span>
                <font-awesome-icon
                  :icon="['fas', 'dollar-sign']"
                  class="icon mr-2"
                />
                Cost of hardware
              </span>
            </el-tooltip>
          </div>
          <el-tooltip
            class="input-tooltip"
            effect="dark"
            content="$ per unit"
            placement="top"
          >
            <el-input-number
              v-model="costOfHw"
              :min="1"
              placeholder="Cost of hardware"
              class="input-with-tooltip"
            />
          </el-tooltip>
        </div>
      </div>

      <!-- Advanced Settings Component -->
      <AdvancedSettings
        :energy-cost-type="energyCostType"
        :power-cost="powerCost"
        :profit-share="profitSharePercentage"
        @update="handleAdvancedSettingsUpdate"
      />

      <!-- Date Group: Start and End Dates -->
      <div class="form-group date-group">
        <!-- Start Date -->
        <div class="dashboard-calculator-form__item">
          <div class="label">
            <font-awesome-icon
              :icon="['fas', 'calendar-alt']"
              class="icon mr-2"
            />
            Start
          </div>
          <el-date-picker
            @change="onStartDateChange"
            v-model="startDate"
            type="date"
            placeholder="Select start date"
            :picker-options="startPickerOptions"
          />
        </div>

        <!-- End Date -->
        <div class="dashboard-calculator-form__item">
          <div class="label">
            <font-awesome-icon
              :icon="['fas', 'calendar-alt']"
              class="icon mr-2"
            />
            End
          </div>
          <el-date-picker
            @change="onEndDateChange"
            v-model="endDate"
            type="date"
            placeholder="Select end date"
            :picker-options="endPickerOptions"
          />
        </div>
      </div>

      <!-- Calculate Button -->
      <div class="dashboard-calculator-form__item calculate-button-container">
        <el-button
          type="primary"
          :disabled="loading"
          @click="emitMiner"
          class="ai-el-button calculate-button"
          :loading="loading"
        >
          <font-awesome-icon :icon="['fas', 'calculator']" class="icon mr-2" />
          Calculate
        </el-button>
      </div>
    </div>

    <!-- Models Browser Dialog -->
    <ModelsBrowser
      v-model:modelDialogVisible="showModelsDialog"
      :start-date="startDate"
      @select-model="selectModel"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onBeforeMount } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";
import moment from "moment";
import { watchDebounced } from "@vueuse/core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
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
  faSearch,
  faSpinner,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import ModelsBrowser from "./ModelsBrowser.vue";
import AdvancedSettings from "./AdvancedSettings.vue";

// Add icons to library
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
  faSearch,
  faSpinner,
  faCheck
);

interface Miner {
  id: string;
  miner_name: string;
  hashrate: number;
  power: number;
  release: string;
  efficiency: number;
}

export default defineComponent({
  name: "DashboardCalculator",
  components: {
    FontAwesomeIcon,
    ModelsBrowser,
    AdvancedSettings,
  },
  props: {
    loading: Boolean,
  },
  emits: ["setMiner", "updateHashrate"],
  setup(props, { emit }) {
    // State
    const showModelsDialog = ref(false);
    const miner = ref<Miner | null>({
      id: "6575be05-70c3-4195-8dc0-2502deb80a85",
      miner_name: "Whatsminer M32",
      hashrate: 62,
      power: 3348,
      release: "2023-01-15",
      efficiency: parseFloat(((62 * 1000) / 3348).toFixed(2)),
    });
    const quantity = ref<number>(10);
    const hashrate = ref<number>(62);
    const power = ref<number>(3348);
    const powerCost = ref<number>(5.5);
    const costOfHw = ref<number>(500);
    const startDate = ref<Date>(moment("2023-01-01", "YYYY-MM-DD").toDate());
    const endDate = ref<Date>(moment("2024-01-01", "YYYY-MM-DD").toDate());
    const allMiners = ref<Array<Miner>>([]);
    const energyCostType = ref("fixed");
    const profitSharePercentage = ref(30);

    // Date Validation
    const startValidationDate = new Date("2019-01-01");
    const endValidationDate = moment(new Date()).subtract(1, "days").toDate();

    const startPickerOptions = {
      disabledDate(time: Date) {
        return (
          time.getTime() < startValidationDate.getTime() ||
          time.getTime() > endValidationDate.getTime()
        );
      },
    };

    const endPickerOptions = {
      disabledDate(time: Date) {
        return (
          time.getTime() < startValidationDate.getTime() ||
          time.getTime() > endValidationDate.getTime()
        );
      },
    };

    // Computed
    const filteredMiners = computed(() => {
      let filtered = allMiners.value.filter((item: Miner) => {
        return moment(item.release).isBefore(startDate.value, "day");
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
        efficiency: 1,
      };

      return [...filtered, otherOption];
    });

    // Methods
    const setMinerData = () => {
      if (miner.value?.id === "other") {
        hashrate.value = 1;
        power.value = 1;
        if (miner.value) miner.value.efficiency = 1;
      } else if (miner.value) {
        hashrate.value = miner.value.hashrate;
        power.value = miner.value.power;
        miner.value.efficiency = parseFloat(
          ((miner.value.hashrate * 1000) / miner.value.power).toFixed(2)
        );
      }
      emitMiner();
    };

    const selectModel = (model: Miner) => {
      miner.value = model;
      setMinerData();
    };

    const handleAdvancedSettingsUpdate = (settings: {
      energyCostType: string;
      powerCost: number;
      profitShare: number;
    }) => {
      energyCostType.value = settings.energyCostType;
      powerCost.value = settings.powerCost;
      profitSharePercentage.value = settings.profitShare;
      emitMiner();
    };

    const validateDate = (
      date: Date,
      minDate: Date,
      maxDate: Date,
      dateType: string
    ): Date => {
      if (moment(date).isBefore(minDate, "day")) {
        ElMessage({
          message: `Sorry, the earliest available date is ${moment(minDate).format(
            "LL"
          )}`,
          type: "error",
        });
        return minDate;
      }
      if (moment(date).isAfter(maxDate, "day")) {
        ElMessage({
          message: `Sorry, the latest available date is ${moment(maxDate).format(
            "LL"
          )}`,
          type: "error",
        });
        return maxDate;
      }
      return date;
    };

    const onStartDateChange = () => {
      startDate.value = validateDate(
        startDate.value,
        startValidationDate,
        endValidationDate,
        "start"
      );
      updateMinerIfInvalid();
    };

    const onEndDateChange = () => {
      endDate.value = validateDate(
        endDate.value,
        startValidationDate,
        endValidationDate,
        "end"
      );
    };

    const updateMinerIfInvalid = () => {
      if (
        miner.value &&
        !filteredMiners.value.some((m) => m.id === miner.value?.id)
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
    };

    const emitMiner = () => {
      emit("setMiner", {
        miner_name: miner.value?.miner_name || "",
        startDate: startDate.value,
        endDate: endDate.value,
        power_cost: powerCost.value,
        power: power.value,
        hash_rate: hashrate.value,
        quantity: quantity.value,
        cost_of_hw: costOfHw.value,
        efficiency: miner.value?.efficiency || 0,
        energyCostType: energyCostType.value,
        profitSharePercentage: profitSharePercentage.value,
      });
    };

    // Watchers
    watch(hashrate, (newValue) => {
      emit("updateHashrate", newValue);
    });

    // Fetch initial data
    const fetchFormData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_HOST}asics`
        );
        if (response?.data?.items) {
          allMiners.value = response.data.items.map((item: any) => ({
            id: item.id,
            miner_name: item.miner_name,
            hashrate: parseFloat(item.hashrate.toString()),
            power: parseInt(item.power.toString(), 10),
            release: item.release,
            efficiency: parseFloat(
              ((item.hashrate * 1000) / item.power).toFixed(2)
            ),
          }));

          const foundMiner = filteredMiners.value.find(
            (item: Miner) => item.miner_name === "Whatsminer M32"
          );
          if (foundMiner) {
            miner.value = foundMiner;
            setMinerData();
          } else if (filteredMiners.value.length > 0) {
            miner.value = filteredMiners.value[0];
            setMinerData();
          }
        }
      } catch (error) {
        console.error("Form Fetch Error:", error);
        ElMessage({
          message: "Failed to load miners. Please try again later.",
          type: "error",
        });
      }
    };

    // Initialize component
    onBeforeMount(fetchFormData);

    // Watch for changes
    watch(startDate, updateMinerIfInvalid);
    watchDebounced(
      () => [
        quantity.value,
        hashrate.value,
        power.value,
        powerCost.value,
        costOfHw.value,
        energyCostType.value,
        profitSharePercentage.value,
      ],
      emitMiner,
      { debounce: 500, maxWait: 1000 }
    );

    return {
      showModelsDialog,
      miner,
      quantity,
      hashrate,
      power,
      powerCost,
      costOfHw,
      startDate,
      endDate,
      filteredMiners,
      startPickerOptions,
      endPickerOptions,
      energyCostType,
      profitSharePercentage,

      // Methods
      setMinerData,
      selectModel,
      onStartDateChange,
      onEndDateChange,
      emitMiner,
      handleAdvancedSettingsUpdate,
    };
  },
});
</script>

<style lang="scss">
.dashboard-calculator {
  flex: 73%;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dashboard-calculator-form {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .form-group {
    display: flex;
    gap: 16px;
  }

  .calculator-top {
    display: flex;
    gap: 16px;

    > * {
      flex: 1;
    }
  }

  .model-group {
    flex-direction: column;
    gap: 8px;

    .models-details-button {
      width: 100%;
      margin-top: 0;
      height: 32px;
    }
  }

  .specs-group {
    flex-direction: row;
    gap: 16px;

    .dashboard-calculator-form__item {
      flex: 1;
    }
  }

  .costs-group {
    flex-direction: row;

    .dashboard-calculator-form__item {
      flex: 1;
    }
  }

  .date-group {
    flex-direction: row;

    .dashboard-calculator-form__item {
      flex: 1;
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    min-width: 0;

    .label {
      margin-bottom: 4px;
      color: rgba(94, 98, 120, 1);
      font-size: 13px;
      font-weight: 600;
      line-height: 1.4;
    }

    &--model {
      .el-select {
        margin-bottom: 8px;
      }
    }
  }
}

// Input styling
.el-select,
.el-input-number,
.el-date-picker {
  width: 100%;
}

.input-tooltip {
  width: 100%;
}

.input-with-tooltip {
  width: 100%;
}

// Element Plus components styling
:deep(.el-input__wrapper),
:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  height: 32px;
}

:deep(.el-input__inner) {
  height: 32px;
  line-height: 32px;
}

:deep(.el-select) {
  .el-input {
    height: 32px;
  }
}

:deep(.el-date-editor.el-input) {
  width: 100%;
  height: 32px;

  .el-input__wrapper {
    padding: 0 8px;
  }
}

:deep(.el-input-number) {
  .el-input-number__decrease,
  .el-input-number__increase {
    width: 28px;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .el-input__wrapper {
    padding: 0 28px;
  }
}

:deep(.el-button) {
  height: 32px;
  padding: 8px 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

:deep(.el-select-dropdown__item) {
  padding: 0 12px;
  height: 32px;
  line-height: 32px;
}

// Calculate button styling
.calculate-button-container {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.calculate-button {
  min-width: 200px;
  height: 36px;

  &.ai-el-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
}

// Button styling
.button-icon {
  margin-right: 6px;
}

// Icon styling
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.9em;
  height: 0.9em;
}

// Tooltip styling
:deep(.el-tooltip__trigger) {
  display: inline-flex;
  align-items: center;
}

// Responsive Design
@media only screen and (max-width: 1100px) {
  .dashboard-calculator-form {
    .calculator-top {
      flex-direction: column;
    }

    .specs-group {
      flex-direction: column;
    }

    .costs-group,
    .date-group {
      flex-direction: column;
    }

    .form-group {
      gap: 12px;
    }

    &__item {
      min-width: 100%;
    }
  }
}

@media only screen and (max-width: 768px) {
  .dashboard-calculator {
    padding: 12px;
  }

  .calculate-button {
    width: 100%;
  }

  .dashboard-calculator-form {
    gap: 12px;

    .form-group {
      gap: 10px;
    }
  }

  :deep(.el-date-editor.el-input) {
    .el-input__wrapper {
      padding: 0 6px;
    }
  }
}
</style>