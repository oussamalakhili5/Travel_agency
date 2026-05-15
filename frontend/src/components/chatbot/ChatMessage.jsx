import { useTranslation } from 'react-i18next'

function ChatMessage({ message, onQuickAction, onRedirect }) {
  const { t } = useTranslation()
  const isBot = message.sender === 'bot'
  const text = message.translationKey ? t(message.translationKey) : message.text
  const hasQuickActions = isBot && message.quickActions?.length > 0
  const hasSuggestions = isBot && message.suggestions?.length > 0

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

        {hasQuickActions ? (
          <div className="chat-message__actions" aria-label={t('chatbot.responseActionsLabel')}>
            {message.quickActions.map((action) => (
              <button
                className="chat-message__action-chip"
                key={`${message.id}-${action.label}`}
                onClick={() => onQuickAction(action)}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}

        {hasSuggestions ? (
          <ul className="chat-message__suggestions">
            {message.suggestions.map((suggestion) => (
              <li key={`${message.id}-${suggestion}`}>{suggestion}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  )
}

export default ChatMessage
