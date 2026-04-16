import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="container">
      <section className="not-found-shell">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="not-found-card">
              <span className="section-label">{t('notFound.badge')}</span>
              <h1 className="section-title section-title-sm">{t('notFound.title')}</h1>
              <p className="mb-4">{t('notFound.description')}</p>
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                <Link className="btn btn-brand px-4" to="/">
                  {t('notFound.returnHome')}
                </Link>
                <Link className="btn btn-outline-brand px-4" to="/hotels">
                  {t('notFound.browseHotels')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default NotFound
