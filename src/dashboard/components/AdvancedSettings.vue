<template>
    <div class="advanced-settings">
      <div class="advanced-settings-header" @click="toggleSettings">
        <font-awesome-icon :icon="['fas', 'sliders']" class="icon mr-2" />
        Advanced Settings
        <font-awesome-icon
          :icon="['fas', isOpen ? 'chevron-up' : 'chevron-down']"
          class="icon ml-2"
        />
      </div>
  
      <div v-show="isOpen" class="advanced-settings-content">
        <div class="settings-group">
          <div class="label">
            <font-awesome-icon
              :icon="['fas', 'file-contract']"
              class="icon mr-2"
            />
            Payment Terms
          </div>
          <el-radio-group
            v-model="localEnergyCostType"
            class="energy-cost-options"
            @change="handleCostTypeChange"
          >
            <el-radio label="fixed">
              <font-awesome-icon :icon="['fas', 'dollar-sign']" class="icon" />
              Fixed Rate
              <span
                v-if="powerCost && localEnergyCostType === 'fixed'"
                class="current-rate"
              >
                ({{ powerCost }}¢/kWh)
              </span>
            </el-radio>
            <el-radio label="profitShare">
              <font-awesome-icon :icon="['fas', 'chart-pie']" class="icon" />
              Profit Share
            </el-radio>
            <el-radio label="hybrid">
              <font-awesome-icon :icon="['fas', 'coins']" class="icon" />
              Fixed Rate
              <span
                v-if="powerCost && localEnergyCostType === 'hybrid'"
                class="current-rate"
              >
                ({{ powerCost }}¢/kWh)
              </span>
              + Profit Share
              <span v-if="localEnergyCostType === 'hybrid'" class="current-rate">
                ({{ localProfitShare }}%)
              </span>
            </el-radio>
          </el-radio-group>
  
          <!-- Profit Share Slider -->
          <div
            v-if="['profitShare', 'hybrid'].includes(localEnergyCostType)"
            class="profit-share-input"
          >
            <div class="label">
              <font-awesome-icon
                :icon="['fas', 'percentage']"
                class="icon mr-2"
              />
              Profit Share Percentage
              <span class="share-value">{{ localProfitShare }}%</span>
            </div>
            <div class="slider-container">
              <el-slider
                v-model="localProfitShare"
                :min="0"
                :max="100"
                :step="1"
                :format-tooltip="(value) => `${value}%`"
                @change="emitUpdate"
              />
              <el-input-number
                v-model="localProfitShare"
                :min="0"
                :max="100"
                :step="1"
                controls-position="right"
                @change="emitUpdate"
                class="share-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  // Update the imports to include new icon
  import { defineComponent, ref, watch } from "vue";
  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
  import { library } from "@fortawesome/fontawesome-svg-core";
  import {
    faSliders,
    faChevronUp,
    faChevronDown,
    faDollarSign,
    faChartPie,
    faCoins,
    faPercentage,
    faFileContract, // New icon for payment terms
  } from "@fortawesome/free-solid-svg-icons";
  
  library.add(
    faSliders,
    faChevronUp,
    faChevronDown,
    faDollarSign,
    faChartPie,
    faCoins,
    faPercentage,
    faFileContract
  );
  
  export default defineComponent({
    name: "AdvancedSettings",
    components: {
      FontAwesomeIcon,
    },
    props: {
      energyCostType: {
        type: String,
        default: "fixed",
      },
      powerCost: {
        type: Number,
        default: 5.5,
      },
      profitShare: {
        type: Number,
        default: 30,
      },
    },
    emits: ["update"],
    setup(props, { emit }) {
      const isOpen = ref(false);
      const localEnergyCostType = ref(props.energyCostType);
      const localProfitShare = ref(props.profitShare);
  
      // Watch for prop changes
      watch(
        () => props.energyCostType,
        (newVal) => {
          localEnergyCostType.value = newVal;
        }
      );
      watch(
        () => props.profitShare,
        (newVal) => {
          localProfitShare.value = newVal;
        }
      );
  
      const handleCostTypeChange = (type: string) => {
        if (type === "profitShare") {
          localProfitShare.value = 50; // Default for profit share
        } else if (type === "hybrid") {
          localProfitShare.value = 30; // Default for hybrid
        }
        emitUpdate();
      };
  
      const toggleSettings = () => {
        isOpen.value = !isOpen.value;
      };
  
      const emitUpdate = () => {
        emit("update", {
          energyCostType: localEnergyCostType.value,
          powerCost: props.powerCost, // We're not modifying this anymore
          profitShare: localProfitShare.value,
        });
      };
  
      return {
        isOpen,
        localEnergyCostType,
        localProfitShare,
        toggleSettings,
        emitUpdate,
        handleCostTypeChange,
      };
    },
  });
  </script>
  
  <style lang="scss" scoped>
  .advanced-settings {
    flex-direction: column;
    border: 1px solid #ebedf0;
    border-radius: 8px;
    overflow: hidden;
    margin-top: 10px;
    background-color: #fafbfc;
  
    &-header {
      padding: 10px 12px;
      background-color: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      font-weight: 500;
      color: #8f95a7;
      transition: all 0.2s ease;
      font-size: 0.9rem;
  
      &:hover {
        background-color: #f8f9fa;
        color: #5e6278;
      }
  
      .icon {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
  
    &-content {
      padding: 15px 20px;
      background-color: white;
      border-top: 1px solid #ebedf0;
      transition: all 0.3s ease-in-out;
    }
  }
  
  .settings-group {
    display: flex;
    flex-direction: column;
    gap: 14px;
  
    .label {
      color: #5e6278;
      font-size: 0.9rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      margin-bottom: 4px;
  
      .icon {
        margin-right: 8px;
        font-size: 0.9rem;
        opacity: 0.8;
      }
    }
  }
  
  .energy-cost-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  
    :deep(.el-radio) {
      display: flex;
      align-items: center;
      height: 32px;
      margin: 0;
      padding: 0 8px;
      width: 100%;
  
      .el-radio__input {
        margin-right: 8px;
  
        .el-radio__inner {
          border-color: #d4d6dd;
  
          &::after {
            width: 6px;
            height: 6px;
          }
        }
      }
  
      .el-radio__label {
        display: flex;
        align-items: center;
        color: #5e6278;
        font-size: 0.9rem;
        padding-left: 4px;
        white-space: normal;
        line-height: 1.4;
  
        .icon {
          margin-right: 8px;
          width: 16px;
          color: #5e6278;
          opacity: 0.8;
        }
  
        .current-rate {
          margin-left: 8px;
          color: #7e8299;
          font-size: 0.85rem;
        }
      }
  
      &:hover {
        background-color: #f8f9fa;
      }
    }
  
    :deep(.el-radio.is-checked) {
      .el-radio__label {
        color: var(--el-color-primary);
  
        .icon {
          color: var(--el-color-primary);
          opacity: 1;
        }
      }
    }
  }
  
  .profit-share-input {
    margin-top: 12px;
    padding: 12px 16px;
    background-color: #fafbfc;
    border-radius: 6px;
    border: 1px solid #ebedf0;
  
    .label {
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #5e6278;
      font-size: 0.85rem;
      font-weight: 500;
  
      .icon {
        font-size: 0.85rem;
        opacity: 0.8;
      }
  
      .share-value {
        color: #5e6278;
        font-weight: 500;
        font-size: 0.85rem;
        background: transparent;
      }
    }
  
    .slider-container {
      display: flex;
      align-items: center;
      gap: 12px;
  
      :deep(.el-slider) {
        flex: 1;
  
        .el-slider__runway {
          margin: 6px 0;
          height: 2px;
          background-color: #e5e7eb;
        }
  
        .el-slider__bar {
          height: 2px;
          background-color: #5e6278;
        }
  
        .el-slider__button-wrapper {
          top: -15px;
        }
  
        .el-slider__button {
          width: 12px;
          height: 12px;
          border: 2px solid #5e6278;
          background-color: white;
          transition: all 0.2s ease;
  
          &:hover {
            transform: scale(1.2);
          }
        }
  
        .el-slider__stop {
          width: 4px;
          height: 4px;
          background-color: #e5e7eb;
        }
      }
  
      .share-input {
        width: 90px;
  
        :deep(.el-input-number__decrease),
        :deep(.el-input-number__increase) {
          border-color: #ebedf0;
          color: #5e6278;
          background-color: #fafbfc;
          height: 14px;
          width: 28px;
  
          &:hover {
            color: #5e6278;
            background-color: #f3f4f6;
          }
        }
  
        :deep(.el-input__inner) {
          text-align: center;
          font-size: 0.85rem;
          color: #5e6278;
          padding: 0 4px;
          height: 28px;
        }
  
        :deep(.el-input__wrapper) {
          box-shadow: 0 0 0 1px #ebedf0 inset;
  
          &:hover {
            box-shadow: 0 0 0 1px #d4d6dd inset;
          }
        }
      }
    }
  }
  
  @media only screen and (max-width: 768px) {
    .advanced-settings {
      margin-top: 5px;
  
      &-content {
        padding: 12px 15px;
      }
  
      &-header {
        padding: 8px 12px;
      }
    }
  
    .profit-share-input {
      padding: 10px;
  
      .slider-container {
        flex-direction: column;
        gap: 12px;
  
        .share-input {
          width: 100%;
        }
      }
    }
  
    .energy-cost-options {
      gap: 8px;
    }
  }
  </style>  