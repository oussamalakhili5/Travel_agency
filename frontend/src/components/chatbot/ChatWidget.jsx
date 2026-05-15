import axios from 'axios'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import chatbotService from '../../services/chatbotService'
import ChatWindow from './ChatWindow'

let nextMessageId = 1

function createMessage(sender, options = {}) {
  return {
    id: `chat-message-${nextMessageId++}`,
    sender,
    text: options.text ?? '',
    translationKey: options.translationKey,
    redirect: options.redirect ?? null,
    requiresAuth: options.requiresAuth ?? false,
    intent: options.intent ?? null,
    entities: options.entities ?? {},
    quickActions: options.quickActions ?? [],
    suggestions: options.suggestions ?? [],
  }
}

function buildSearchString(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) {
      return
    }

    searchParams.set(key, value)
  })

  const search = searchParams.toString()
  return search ? `?${search}` : ''
}

function ChatWidget() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState(() => [
    createMessage('bot', { translationKey: 'chatbot.welcomeMessage' }),
  ])
  const quickActions = [
    {
      id: 'hotels',
      labelKey: 'chatbot.quickActions.findHotels',
      messageKey: 'chatbot.quickActionMessages.findHotels',
      requestMessage: 'I want to find hotels',
    },
    {
      id: 'transports',
      labelKey: 'chatbot.quickActions.browseTransports',
      messageKey: 'chatbot.quickActionMessages.browseTransports',
      requestMessage: 'Show me transport options',
    },
    {
      id: 'packages',
      labelKey: 'chatbot.quickActions.browsePackages',
      messageKey: 'chatbot.quickActionMessages.browsePackages',
      requestMessage: 'Show me travel packages',
    },
    {
      id: 'reservations',
      labelKey: 'chatbot.quickActions.myReservations',
      messageKey: 'chatbot.quickActionMessages.myReservations',
      requestMessage: 'Show me my reservations',
    },
    {
      id: 'payments',
      labelKey: 'chatbot.quickActions.paymentHelp',
      messageKey: 'chatbot.quickActionMessages.paymentHelp',
      requestMessage: 'I need payment help',
    },
    {
      id: 'support',
      labelKey: 'chatbot.quickActions.contactSupport',
      messageKey: 'chatbot.quickActionMessages.contactSupport',
      requestMessage: 'I need support',
    },
    {
      id: 'login',
      labelKey: 'chatbot.quickActions.loginHelp',
      messageKey: 'chatbot.quickActionMessages.loginHelp',
      requestMessage: 'How do I log in?',
    },
    {
      id: 'verify-email',
      labelKey: 'chatbot.quickActions.verifyEmailHelp',
      messageKey: 'chatbot.quickActionMessages.verifyEmailHelp',
      requestMessage: 'I need help verifying my email',
    },
  ]

  async function sendMessage(messageText, options = {}) {
    const trimmedMessage = messageText.trim()

    if (!trimmedMessage || loading) {
      return
    }

    setError('')
    setMessages((currentMessages) => [
      ...currentMessages,
      createMessage(
        'user',
        options.displayTranslationKey
          ? { translationKey: options.displayTranslationKey }
          : { text: trimmedMessage },
      ),
    ])
    setInputValue('')
    setLoading(true)

    try {
      const response = await chatbotService.sendChatbotMessage(trimmedMessage)

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage('bot', {
          text: response.reply,
          redirect: response.redirect,
          requiresAuth: response.requires_auth,
          intent: response.intent,
          entities: response.entities,
          quickActions: response.quick_actions,
          suggestions: response.suggestions,
        }),
      ])
    } catch (requestError) {
      setError(
        axios.isAxiosError(requestError) && requestError.code === 'ERR_NETWORK'
          ? t('chatbot.networkError')
          : t('chatbot.errorMessage'),
      )
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendMessage(inputValue)
  }

  function handleQuickAction(action) {
    if (action.requestMessage) {
      sendMessage(action.requestMessage, { displayTranslationKey: action.messageKey })
      return
    }

    if (action.message) {
      sendMessage(action.message)
      return
    }

    if (action.path) {
      handleRedirect(action)
    }
  }

  function handleRedirect(redirect) {
    const search = buildSearchString(redirect.params)

    navigate({
      pathname: redirect.path,
      search,
    })
  }

  return (
    <div className={`chat-widget ${isOpen ? 'chat-widget--open' : ''}`}>
      {isOpen ? (
        <ChatWindow
          error={error}
          inputValue={inputValue}
          loading={loading}
          messages={messages}
          onClose={() => setIsOpen(false)}
          onInputChange={(event) => setInputValue(event.target.value)}
          onQuickAction={handleQuickAction}
          onRedirect={handleRedirect}
          onSubmit={handleSubmit}
          quickActions={quickActions}
        />
      ) : null}

      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? t('chatbot.closeLabel') : t('chatbot.openLabel')}
        className="chat-widget__toggle"
        onClick={() => setIsOpen((currentState) => !currentState)}
        type="button"
      >
        <span className="chat-widget__toggle-icon">{t('chatbot.toggleIcon')}</span>
        <span className="chat-widget__toggle-copy">
          {isOpen ? t('chatbot.minimizeLabel') : t('chatbot.openButton')}
        </span>
      </button>
    </div>
  )
}

export default ChatWidget
