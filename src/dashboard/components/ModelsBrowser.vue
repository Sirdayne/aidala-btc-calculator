<template>
    <el-dialog
      title="Models Details"
      v-model="modelDialogVisible"
      width="80%"
      @open="fetchModelsDetails"
      :before-close="handleClose"
      :modal-append-to-body="false"
    >
      <template #default>
        <!-- Loading Spinner Overlay -->
        <div v-if="isTableLoading" class="loading-overlay">
          <font-awesome-icon :icon="['fas', 'spinner']" class="icon spin" />
          Loading...
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
            />
            <el-table-column
              prop="hashrate"
              label="Hash Rate (TH/s)"
              width="150"
              sortable
            />
            <el-table-column
              prop="power"
              label="Power (W)"
              width="150"
              sortable
            />
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
            />
            <el-table-column label="Action" width="120" fixed="right">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click="selectModel(scope.row)"
                >
                  <font-awesome-icon :icon="['fas', 'check']" class="icon mr-1" />
                  Select
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
  
        <!-- No Data Message -->
        <div
          v-if="!isTableLoading && filteredModelsDetails.length === 0"
          class="no-data-message"
        >
          No models found matching your search criteria.
        </div>
      </template>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">Close</el-button>
        </span>
      </template>
    </el-dialog>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed } from "vue";
  import { ElMessage } from "element-plus";
  import axios from "axios";
  import moment from "moment";
  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
  import {
    faSpinner,
    faSearch,
    faCheck,
  } from "@fortawesome/free-solid-svg-icons";
  import { library } from "@fortawesome/fontawesome-svg-core";
  
  library.add(faSpinner, faSearch, faCheck);
  
  interface Miner {
    id: string;
    miner_name: string;
    hashrate: number;
    power: number;
    release: string;
    efficiency: number;
  }
  
  export default defineComponent({
    name: "ModelsBrowser",
    components: {
      FontAwesomeIcon,
    },
    props: {
      modelDialogVisible: {
        type: Boolean,
        required: true,
      },
      startDate: {
        type: Date,
        required: true,
      },
    },
    emits: ["update:modelDialogVisible", "select-model"],
    setup(props, { emit }) {
      const isTableLoading = ref(false);
      const searchQuery = ref("");
      const modelsDetails = ref<Array<Miner>>([]);
  
      const filteredModelsDetails = computed(() => {
        if (!searchQuery.value) return modelsDetails.value;
        return modelsDetails.value.filter((model) =>
          model.miner_name.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      });
  
      const fetchModelsDetails = async () => {
        isTableLoading.value = true;
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_HOST}asics`
          );
          if (response?.data?.items) {
            const filteredModels = response.data.items.filter((item: any) =>
              moment(item.release).isBefore(props.startDate, "day")
            );
  
            modelsDetails.value = filteredModels
              .sort((a: any, b: any) => b.hashrate - a.hashrate)
              .map((item: any) => ({
                id: item.id,
                miner_name: item.miner_name,
                hashrate: parseFloat(item.hashrate.toString()),
                power: parseInt(item.power.toString(), 10),
                release: item.release,
                efficiency: parseFloat(
                  ((item.hashrate * 1000) / item.power).toFixed(2)
                ),
              }));
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
  
      const formatReleaseDate = (row: Miner, column: any, cellValue: string) => {
        return moment(cellValue).format("MMM-YYYY");
      };
  
      const handleClose = () => {
        searchQuery.value = "";
        modelsDetails.value = [];
        emit("update:modelDialogVisible", false);
      };
  
      const selectModel = (model: Miner) => {
        emit("select-model", model);
        handleClose();
        ElMessage({
          message: `${model.miner_name} has been selected.`,
          type: "success",
        });
      };
  
      return {
        isTableLoading,
        searchQuery,
        modelsDetails,
        filteredModelsDetails,
        fetchModelsDetails,
        formatReleaseDate,
        handleClose,
        selectModel,
      };
    },
  });
  </script>
  
  <style lang="scss" scoped>
  .search-input {
    margin-bottom: 20px;
  }
  
  .table-container {
    max-height: 400px;
    overflow-y: auto;
  }
  
  .no-data-message {
    text-align: center;
    color: #7e8299;
    margin-top: 20px;
    font-size: 16px;
  }
  
  .loading-overlay {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 18px;
    color: #7e8299;
  }
  
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  </style>