function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'start',
  light = false,
  compact = false,
}) {
  const alignmentClass = align === 'center' ? 'text-center mx-auto' : ''
  const themeClass = light ? 'section-header-light' : ''
  const titleClass = compact ? 'section-title section-title-sm' : 'section-title'

  return (
    <div className={`section-header ${alignmentClass} ${themeClass}`.trim()}>
      {eyebrow ? <span className="section-label">{eyebrow}</span> : null}
      <h2 className={titleClass}>{title}</h2>
      {description ? (
        <p className={`section-description ${light ? 'section-description-light' : ''}`.trim()}>
          {description}
        </p>
      ) : null}
    </div>
  )
}

export default SectionHeader
