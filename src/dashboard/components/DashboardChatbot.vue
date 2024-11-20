<template>
  <div class="ai-card chat-container">
    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.role]"
      >
        <div class="message-content">{{ message.content }}</div>
      </div>
    </div>
    <div class="chat-input">
      <input
        v-model="userInput"
        @keyup.enter="sendMessage"
        placeholder="Ask about your mining results..."
        :disabled="isLoading"
        class="chat-input-field"
      />
      <button
        @click="sendMessage"
        :disabled="isLoading || !userInput.trim()"
        class="chat-submit-button"
      >
        Send
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import axios from "axios";

export default defineComponent({
  name: "DashboardChatbot",
  props: {
    miner: {
      type: Object,
      required: true,
    },
    totalSummary: {
      type: Object,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const messages = ref([
      {
        role: "assistant",
        content:
          "Hello! I can help you analyse your mining results. What would you like to know?",
      },
    ]);
    const userInput = ref("");
    const isLoading = ref(false);
    const messagesContainer = ref(null);

    // Auto scroll to bottom when new messages are added
    watch(
      messages,
      () => {
        setTimeout(() => {
          if (messagesContainer.value) {
            messagesContainer.value.scrollTop =
              messagesContainer.value.scrollHeight;
          }
        }, 0);
      },
      { deep: true }
    );

    const sendMessage = async () => {
      if (!userInput.value.trim() || isLoading.value) return;

      const userMessage = userInput.value;
      messages.value.push({ role: "user", content: userMessage });
      userInput.value = "";
      isLoading.value = true;

      try {
        const host = import.meta.env.VITE_APP_API_HOST;
        const endpoint = "chat";
        const response = await axios.post(`${host}${endpoint}`, {
          messages: messages.value, // Send the entire conversation history
          miner_name: props.miner.miner_name,
          power_cost: props.miner.power_cost,
          power: props.miner.power,
          hash_rate: props.miner.hash_rate,
          quantity: props.miner.quantity,
          cost_of_hw: props.miner.cost_of_hw,
          total_revenue: props.totalSummary.revenue,
          total_cost: props.totalSummary.cost,
          total_profit: props.totalSummary.profit,
          avg_cost_btc: props.totalSummary.avgCostBtc,
          currency: props.currency,
        });

        messages.value.push({
          role: "assistant",
          content: response.data.response,
        });
      } catch (error) {
        console.error("Chat error:", error);

        // Array of funny error messages
        const funnyErrors = [
          "Oops! My mining rig is taking a coffee break. Back soon! ⚡",
          "Well, this is awkward... My blockchain just went on vacation. Getting back soon! 🏖️",
          "Hold on... I think I just saw a bear run through the crypto market! 🐻",
          "My ASIC got distracted by some cute LLMs. Soon! 🎮",
        ];

        // Select a random error message
        const randomError =
          funnyErrors[Math.floor(Math.random() * funnyErrors.length)];

        messages.value.push({
          role: "assistant",
          content: randomError,
        });
      } finally {
        isLoading.value = false;
      }
    };

    return {
      messages,
      userInput,
      isLoading,
      sendMessage,
      messagesContainer,
    };
  },
});
</script>

<style scoped>
.chat-container {
  margin-top: 20px;
  padding: 20px;
  height: 300px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Soft shadow */
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  padding-right: 12px; /* Increased padding */
}

.message {
  margin: 10px 0; /* Adjust margin for better spacing */
  padding: 10px 15px;
  border-radius: 15px; /* Rounded corners */
  max-width: 70%;
  line-height: 1.4; /* Improved line height for readability */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* Subtle shadow for messages */
  transition: all 0.3s ease; /* Add a smooth transition */
}

.message.user {
  background-color: #e0f2f7; /* Lighter blue for user */
  margin-left: auto; /* Align to the right */
  align-self: flex-end;
}

.message.assistant {
  background-color: #f0f4f8; /* Lighter grey for assistant */
  margin-right: auto; /* Align to the left */
  align-self: flex-start;
}

.chat-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

.chat-input-field {
  flex-grow: 1;
  padding: 10px 15px;
  border: 1px solid #d1d5db; /* Subtle border */
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.chat-input-field:focus {
  border-color: #3498db; /* Highlight border on focus */
  outline: none;
}

.chat-submit-button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.chat-submit-button:hover:not(:disabled) {
  background-color: #2980b9; /* Darker shade on hover */
}

.chat-submit-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}
</style>
