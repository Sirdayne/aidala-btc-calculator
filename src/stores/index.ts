import { ref } from 'vue';
import { defineStore } from 'pinia';
import moment from 'moment';

export const useCalculatorStore = defineStore('calculator', () => {
  const calculator = ref({
    startDate: moment('2023-01-01', 'YYYY-MM-DD').format("YYYY-MM-DDTHH:mm:ss"),
    endDate: moment('2024-01-01', 'YYYY-MM-DD').format("YYYY-MM-DDTHH:mm:ss"),
    power_cost: 5.5,
    power: 3348,
    hash_rate: 62,
    quantity: 10,
    cost_of_hw: 500,
  });

  const setCalculator = (newCalculator) => {
    calculator.value = newCalculator;
  };

  const sellMode = ref('daily');

  const setSellMode = (mode) => {
    sellMode.value = mode;
  };

  return {
    calculator,
    setCalculator,
    sellMode,
    setSellMode,
  };
});