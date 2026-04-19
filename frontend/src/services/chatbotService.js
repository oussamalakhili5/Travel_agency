import api from './api'

export async function sendChatbotMessage(message) {
  const response = await api.post('chatbot/', { message })
  return response.data
}

const chatbotService = {
  sendChatbotMessage,
}

export default chatbotService
