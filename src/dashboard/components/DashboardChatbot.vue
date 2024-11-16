<template>
    <div class="ai-card chat-container">
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="(message, index) in messages" :key="index" 
             :class="['message', message.role]">
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
          class="chat-submit-button">
          Send
        </button>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch } from 'vue'
  import axios from 'axios'
  
  interface Message {
    role: 'system' | 'user' | 'assistant'
    content: string
    }
    
  export default defineComponent({
    name: 'DashboardChatbot',
    props: {
      miner: {
        type: Object,
        required: true
      },
      totalSummary: {
        type: Object,
        required: true
      },
      currency: {
        type: String,
        required: true
      }
    },
    setup(props) {
      const messages = ref<Message[]>([
        { 
          role: 'assistant',
          content: 'Hello! I can help you analyze your mining results. What would you like to know?'
        }
      ])
      const userInput = ref('')
      const isLoading = ref(false)
      const messagesContainer = ref(null)
  
      // Auto scroll to bottom when new messages are added
      watch(messages, () => {
        setTimeout(() => {
          if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
          }
        }, 0)
      }, { deep: true })
  
      const sendMessage = async () => {
        if (!userInput.value.trim() || isLoading.value) return
  
        const userMessage = userInput.value
        messages.value.push({ role: 'user', content: userMessage })
        userInput.value = ''
        isLoading.value = true
  
        try {
          const baseUrl = import.meta.env.VITE_API_URL || 'https://aidala.uk'
          const response = await axios.post(`${baseUrl}/api/chat`, {
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
            currency: props.currency
          })
  
          messages.value.push({
            role: 'assistant',
            content: response.data.response
          })
        } catch (error) {
          console.error('Chat error:', error)
          messages.value.push({
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.'
          })
        } finally {
          isLoading.value = false
        }
      }
  
      return {
        messages,
        userInput,
        isLoading,
        sendMessage,
        messagesContainer
      }
    }
  })
  </script>
  
  <style scoped>
  .chat-container {
    margin-top: 20px;
    padding: 16px;
    height: 300px;
    display: flex;
    flex-direction: column;
  }
  
  .chat-messages {
    flex-grow: 1;
    overflow-y: auto;
    margin-bottom: 16px;
    padding-right: 8px;
  }
  
  .message {
    margin: 8px 0;
    padding: 8px 12px;
    border-radius: 8px;
    max-width: 80%;
  }
  
  .message.user {
    background-color: #e3f2fd;
    margin-left: auto;
  }
  
  .message.assistant {
    background-color: #f5f5f5;
    margin-right: auto;
  }
  
  .chat-input {
    display: flex;
    gap: 8px;
  }
  
  .chat-input-field {
    flex-grow: 1;
    padding: 8px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .chat-submit-button {
    padding: 8px 16px;
    background-color: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .chat-submit-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  </style>