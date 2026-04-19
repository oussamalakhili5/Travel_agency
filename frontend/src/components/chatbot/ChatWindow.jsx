import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ChatMessage from './ChatMessage'

function ChatWindow({
  error,
  inputValue,
  loading,
  messages,
  onClose,
  onInputChange,
  onQuickAction,
  onRedirect,
  onSubmit,
  quickActions,
}) {
  const { t } = useTranslation()
  const messagesRef = useRef(null)
  const inputRef = useRef(null)
  const showWelcomeState = messages.length === 1 && messages[0]?.translationKey === 'chatbot.welcomeMessage'

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const container = messagesRef.current

    if (!container) {
      return
    }

    container.scrollTop = container.scrollHeight
  }, [messages, loading, error])

  return (
    <section
      aria-label={t('chatbot.title')}
      className="chat-widget__window surface-panel"
    >
      <header className="chat-widget__header">
        <div>
          <span className="section-label">{t('chatbot.badge')}</span>
          <h2 className="chat-widget__title">{t('chatbot.title')}</h2>
        </div>

        <button
          aria-label={t('chatbot.closeLabel')}
          className="chat-widget__icon-button"
          onClick={onClose}
          type="button"
        >
          x
        </button>
      </header>

      <div className="chat-widget__messages" ref={messagesRef}>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} onRedirect={onRedirect} />
        ))}

        {showWelcomeState ? (
          <section className="chat-widget__welcome">
            <span className="chat-widget__welcome-kicker">{t('chatbot.welcomeKicker')}</span>
            <h3 className="chat-widget__welcome-title">{t('chatbot.welcomeTitle')}</h3>
            <p className="chat-widget__welcome-copy mb-0">{t('chatbot.welcomeDescription')}</p>

            <div className="chat-widget__quick-actions">
              <span className="chat-widget__quick-actions-label">
                {t('chatbot.quickActionsTitle')}
              </span>

              <div className="chat-widget__quick-actions-grid">
                {quickActions.map((action) => (
                  <button
                    className="chat-widget__quick-action"
                    disabled={loading}
                    key={action.id}
                    onClick={() => onQuickAction(action.message)}
                    type="button"
                  >
                    {t(action.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {loading ? (
          <article className="chat-message chat-message--bot">
            <div className="chat-message__meta">
              <span className="chat-message__sender">{t('chatbot.assistantLabel')}</span>
            </div>
            <div className="chat-message__bubble chat-message__bubble--typing">
              <span className="spinner-border spinner-border-sm" aria-hidden="true" />
              <span>{t('chatbot.loadingText')}</span>
            </div>
          </article>
        ) : null}
      </div>

      {error ? (
        <div className="alert alert-danger chat-widget__error" role="alert">
          {error}
        </div>
      ) : null}

      <form className="chat-widget__form" onSubmit={onSubmit}>
        <label className="visually-hidden" htmlFor="chatbot-message">
          {t('chatbot.inputPlaceholder')}
        </label>
        <input
          className="form-control"
          id="chatbot-message"
          onChange={onInputChange}
          placeholder={t('chatbot.inputPlaceholder')}
          ref={inputRef}
          type="text"
          value={inputValue}
        />
        <button
          className="btn btn-brand"
          disabled={loading || inputValue.trim().length === 0}
          type="submit"
        >
          {t('chatbot.sendButton')}
        </button>
      </form>

      <p className="chat-widget__hint mb-0">{t('chatbot.helpPrompt')}</p>
    </section>
  )
}

export default ChatWindow
