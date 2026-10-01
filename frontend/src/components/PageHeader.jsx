export function PageHeader({ title, sub, children }) {
  return (
    <div className="mb-5 flex flex-col items-stretch justify-between gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="min-w-0">
        <h1 className="break-words text-[23px] font-extrabold tracking-tight text-ink sm:text-[26px]">{title}</h1>
        {sub && <p className="mt-1 text-[14px] text-muted">{sub}</p>}
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-2.5">{children}</div>
    </div>
  )
}
