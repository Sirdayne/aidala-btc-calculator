<template>
  <div class="dashboard-share">
    <div class="dashboard-share-title">Share results quickly</div>
    <div class="dashboard-share-content">
      <el-input v-model="link" disabled :suffix-icon="CopyDocument" class="dashboard-share-content__input"></el-input>
      <el-button type="primary"
                 @click="share()"
                 class="ai-el-button"
      >
        Share
      </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeMount, watch, onMounted, toRaw } from "vue";
import { CopyDocument } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import CryptoJS from 'crypto-js';
import moment from "moment";
import { useCalculatorStore } from '@/stores';
import { storeToRefs } from 'pinia';

export default defineComponent({
  name: "dashboard-share",
  computed: {
    CopyDocument() {
      return CopyDocument
    }
  },
  props: {
    miner: Object,
    startDate: String,
    endDate: String,
    timeMode: String,
    currency: String,
  },
  setup(props, ctx) {
    const link = ref('aidala.uk/dashboard?quantity=10&hashrate=62&power=3348&powerCost=5.5');

    const copyClipboard = () => {
      navigator.clipboard.writeText(link.value);
      ElMessage({
        message: 'Copied to clipboard!',
        type: 'warning',
      })
    }

    const encodeObject = (obj, secretKey = 'salt') => {
      const jsonString = JSON.stringify(obj);
      const encrypted = CryptoJS.AES.encrypt(jsonString, secretKey).toString();
      return encrypted;
    }

    const share = () => {
      let miner = toRaw(props.miner);
      miner = {
        startDate: moment(props.startDate).format("YYYY-MM-DD"),
        endDate: moment(props.endDate).format("YYYY-MM-DD"),
        ...miner
      }
      const hash = encodeURIComponent(encodeObject(miner));
      link.value = `${window.location.href}?hash=${hash}`;
      copyClipboard();
    }

    return {
      link,
      share
    };
  },
});
</script>

<style lang="sass">
.dashboard-share-title
  color: #3F4254
  font-size: 18px
  font-weight: 600
  line-height: 18px

.dashboard-share-content
  margin-top: 12px
  display: flex
  align-items: center
  gap: 6px

@media only screen and (max-width: 500px)
  .dashboard-share-content
    display: block

    .ai-el-button
      margin-top: 15px
      margin-bottom: 30px
</style>

