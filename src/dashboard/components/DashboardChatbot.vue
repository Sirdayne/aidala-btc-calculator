<template>
  <div class="ai-card">
    <!-- Collapsible Header -->
    <div 
      class="chat-header"
      @click="toggleExpand"
    >
      <div class="header-content">
        <div class="assistant-avatar breathing">
          <i class="fas fa-robot"></i>
        </div>
        <div class="assistant-info">
          <span class="assistant-name">MineGPT</span>
        </div>
      </div>
      <div class="header-actions">
        <span class="status-indicator" :class="{ 'online': true }"></span>
        <i :class="['fas', isExpanded ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
      </div>
    </div>

    <!-- Chat Container -->
    <div :class="['chat-container', { 'expanded': isExpanded }]">
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.role]"
        >
          <div class="message-content">
            <div v-if="message.role === 'assistant'" class="assistant-icon breathing">
              <i class="fas fa-robot"></i>
            </div>
            <div class="message-text">{{ message.content }}</div>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <input
          v-model="userInput"
          @keyup.enter="sendMessage"
          placeholder="Ask MineGPT about your mining stats..."
          :disabled="isLoading"
          class="chat-input-field"
        />
        <button
          @click="sendMessage"
          :disabled="isLoading || !userInput.trim()"
          class="chat-submit-button"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
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
          "Hi! I'm MineGPT, your mining analytics assistant. I can help analyse your mining setup and provide insights. What would you like to know? 🤖",
      },
    ]);
    const userInput = ref("");
    const isLoading = ref(false);
    const isExpanded = ref(false);
    const messagesContainer = ref(null);

    const toggleExpand = () => {
      isExpanded.value = !isExpanded.value;
    };

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

    // Also scroll to bottom when expanded
    watch(isExpanded, (newValue) => {
      if (newValue) {
        setTimeout(() => {
          if (messagesContainer.value) {
            messagesContainer.value.scrollTop =
              messagesContainer.value.scrollHeight;
          }
        }, 300); // Wait for expansion animation
      }
    });

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
          messages: messages.value,
          miner_name: props.miner.miner_name,
          power_cost: props.miner.power_cost / 100, // Convert cents to dollars
          power: props.miner.power,
          hash_rate: props.miner.hash_rate,
          quantity: props.miner.quantity,
          cost_of_hw: props.miner.cost_of_hw,
          total_revenue: props.totalSummary.revenue,
          total_cost: props.totalSummary.cost,
          total_profit: props.totalSummary.profit,
          avg_cost_btc: props.totalSummary.avgCostBtc,
          currency: props.currency,
          release: props.miner.release,
        });

        messages.value.push({
          role: "assistant",
          content: response.data.response,
        });
      } catch (error) {
        console.error("Chat error:", error);

        const funnyErrors = [
          "Oops! My mining rig is taking a coffee break. Back soon! ⚡",
          "Well, this is awkward... My blockchain just went on vacation. Getting back soon! 🏖️",
          "Hold on... I think I just saw a bear run through the crypto market! 🐻",
          "My ASIC got distracted by some cute LLMs. Soon! 🎮",
        ];

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
      isExpanded,
      sendMessage,
      toggleExpand,
      messagesContainer,
    };
  },
});
</script>

<style scoped>
.ai-card {
  margin-top: 12px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.chat-header {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-radius: 12px;
  background-color: white;
  transition: background-color 0.3s ease;
}

.chat-header:hover {
  background-color: #f8f9fa;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

@keyframes breathing {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4);
  }
  
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(52, 152, 219, 0);
  }
  
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(52, 152, 219, 0);
  }
}

.assistant-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.assistant-avatar.breathing {
  animation: breathing 3s ease-in-out infinite;
}

.assistant-avatar i {
  color: white;
  font-size: 18px;
}

.assistant-info {
  display: flex;
  flex-direction: column;
}

.assistant-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 15px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #95a5a6;
}

.status-indicator.online {
  background-color: #2ecc71;
}

.chat-container {
  height: 0;
  opacity: 0;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
}

.chat-container.expanded {
  height: 300px;
  opacity: 1;
  padding: 20px;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  padding-right: 12px;
}

.message {
  margin: 10px 0;
  max-width: 80%;
}

.message.user {
  margin-left: auto;
}

.message.assistant {
  margin-right: auto;
}

.message-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 15px;
  border-radius: 15px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.message.user .message-content {
  background-color: #3498db;
  color: white;
  flex-direction: row-reverse;
}

.assistant-icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.assistant-icon i {
  color: white;
  font-size: 12px;
}

.message-text {
  flex: 1;
}

.chat-input {
  display: flex;
  gap: 10px;
  align-items: center;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 12px;
}

.chat-input-field {
  flex-grow: 1;
  padding: 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background-color: white;
}

.chat-input-field:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.chat-submit-button {
  padding: 10px;
  width: 40px;
  height: 40px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-submit-button:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.chat-submit-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

@media (max-width: 768px) {

  .chat-container.expanded {
    height: 400px;
  }
}
</style>