<template>
  <el-button type="primary"
             @click="exportXLS()"
             class="ai-el-button"
             :loading="loading">
    Export Data
  </el-button>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeMount, watch } from "vue";
import axios from 'axios';
import moment from 'moment/moment';
import { saveAs } from 'file-saver';

export default defineComponent({
  name: "dashboard-export-button",
  props: {
    miner: Object,
    startDate: String,
    endDate: String,
    timeMode: String,
    sellMode: String,
    currency: String,
  },
  setup(props, ctx) {
    const loading = ref(false);

    const exportXLS = () => {
      loading.value = true;
      const host = import.meta.env.VITE_APP_API_HOST;
      const endpoint = 'export';

      const minerValue = props && props.miner && props.miner ? props.miner : null;
      let body;

      if (minerValue) {
        body = {
          user_id: 0,
          time_mode: props.timeMode,
          sell_mode: props.sellMode,
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

      axios.post(`${host}${endpoint}`, body, {
            responseType: 'blob',
          })
          .then(function (response) {
            console.log(response, ' response')
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, 'exported.xlsx');

            saveFile(response);
          })
          .catch(function (error) {
            console.log('Export Error: ', error);
          }).finally(() => {
            loading.value = false;
          });
    }

    const saveFile = (response) => {
      const url = window.URL.createObjectURL(response.data, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'filename.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    return {
      loading,
      exportXLS
    };
  },
});
</script>

<style lang="sass">

</style>

