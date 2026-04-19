import { useTranslation } from 'react-i18next'

function ChatMessage({ message, onRedirect }) {
  const { t } = useTranslation()
  const isBot = message.sender === 'bot'
  const text = message.translationKey ? t(message.translationKey) : message.text

  return (
    <article
      className={`chat-message ${isBot ? 'chat-message--bot' : 'chat-message--user'}`}
    >
      <div className="chat-message__meta">
        <span className="chat-message__sender">
          {isBot ? t('chatbot.assistantLabel') : t('chatbot.userLabel')}
        </span>
        {message.requiresAuth ? (
          <span className="chat-message__badge">{t('chatbot.requiresAuth')}</span>
        ) : null}
      </div>

      <div className="chat-message__bubble">
        <p className="mb-0">{text}</p>

        {isBot && message.redirect?.path ? (
          <button
            className="btn btn-sm btn-outline-brand mt-3"
            onClick={() => onRedirect(message.redirect)}
            type="button"
          >
            {message.redirect.label || t('chatbot.redirectFallback')}
          </button>
        ) : null}
      </div>
    </article>
  )
}

export default ChatMessage
