const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/LoginForm.jsx', 'utf8');

// I will find the 'return (' block for LoginForm and completely replace it.
const startIdx = code.indexOf('return (\n    <div className="relative flex min-h-screen');
const endIdx = code.indexOf('{/* footer */}');
if (startIdx !== -1 && endIdx !== -1) {
    const newRender = \eturn (
    <div className="relative flex min-h-screen w-full flex-col bg-white px-5 pb-6 pt-20 sm:px-10 lg:w-[46%] lg:px-12 lg:pt-8 xl:px-16">
      {/* language */}
      <div className="absolute right-6 top-6 sm:right-8 lg:right-10">
        <LanguageSelect
          lang={lang}
          onPick={(l) => {
            setLang(l)
            toast('Language changed to ' + l, 'success')
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-[400px] flex-1">
        <div className="mb-10 text-center">
          <BrandLogo />
        </div>

        {forgot ? (
          <form onSubmit={(e) => { e.preventDefault(); sendReset() }} noValidate className="mt-9 space-y-4">
            <h1 className="text-center text-[26px] font-black tracking-tight text-ink">
              Reset Password
            </h1>
            <p className="mt-2 text-center text-[15.5px] text-gray-500 mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div>
              <div className="relative">
                <input
                  type="email"
                  autoFocus
                  placeholder="Email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="\ pr-4 border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex h-[56px] w-full items-center justify-center gap-2.5 rounded-xl bg-brand-600 text-[17px] font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
            >
              Send Reset Link
            </button>
            <button
              type="button"
              onClick={() => setForgot(false)}
              className="h-11 w-full text-[14px] font-semibold text-gray-500 transition hover:text-brand-600"
            >
              ← Back to login
            </button>
          </form>
        ) : (
        <>
          <h1 className="text-center text-[26px] font-black tracking-tight text-ink">
            {security ? (security.setupRequired ? 'Set Security Question' : 'Security Check') : 'Welcome Back'}
          </h1>
          <p className="mt-2 text-center text-[15.5px] text-gray-500">
            {security ? (security.setupRequired ? 'Please set a security question to secure your account' : 'Answer your security question to continue') : 'Sign in to your SMS & SMPP account'}
          </p>

          {!security ? (
          <form onSubmit={handleSubmit} noValidate className="mt-9 space-y-4">
            <div>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <UserIcon className="h-[21px] w-[21px]" />
                </span>
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="User ID"
                  value={userId}
                  onChange={(e) => { setUserId(e.target.value); setErrors({}) }}
                  className="\ pr-4 \"
                />
              </div>
              {errors.userId && <p className="mt-1.5 pl-1 text-[12.5px] font-medium text-red-500">{errors.userId}</p>}
            </div>

            <div>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <LockIcon className="h-[21px] w-[21px]" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors({}) }}
                  className="\ pr-12 \"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon className="h-[21px] w-[21px]" /> : <EyeIcon className="h-[21px] w-[21px]" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 pl-1 text-[12.5px] font-medium text-red-500">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer select-none items-center gap-2.5">
                <input type="checkbox" className="sr-only" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span className="\ flex h-[21px] w-[21px] items-center justify-center rounded-[6px] border transition">
                  <CheckIcon className="h-3 w-3" />
                </span>
                <span className="text-[14.5px] font-medium text-gray-700">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setForgot(true)}
                className="text-[14px] font-semibold text-brand-600 transition hover:text-brand-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-[56px] w-full items-center justify-center gap-2.5 rounded-xl bg-brand-600 text-[17px] font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading ? <><SpinnerIcon className="h-5 w-5" /> Signing in.</> : <>Login <ArrowRightIcon className="h-5 w-5" /></>}
            </button>
          </form>
          ) : security.setupRequired ? (
          <form onSubmit={setupSecurity} noValidate className="mt-9 space-y-4">
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 mb-4">
              <div className="text-[13px] font-bold text-blue-800">First Time Login</div>
              <div className="mt-1 text-[13px] text-blue-600">Please set a security question to secure your account. You will be asked this question on future logins.</div>
            </div>
            <div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Your Question (e.g., What is your pet's name?)"
                  value={security.question}
                  onChange={(e) => { setSecurity({ ...security, question: e.target.value }); setErrors({}) }}
                  className="\ pr-4 border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <LockIcon className="h-[21px] w-[21px]" />
                </span>
                <input
                  type="text"
                  placeholder="Your Answer"
                  value={security.answer}
                  onChange={(e) => { setSecurity({ ...security, answer: e.target.value }); setErrors({}) }}
                  className="\ pr-4 border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              {errors.answer && <p className="mt-1.5 pl-1 text-[12.5px] font-medium text-red-500">{errors.answer}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-[56px] w-full items-center justify-center gap-2.5 rounded-xl bg-brand-600 text-[17px] font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading ? <><SpinnerIcon className="h-5 w-5" /> Saving…</> : <>Save & Continue <ArrowRightIcon className="h-5 w-5" /></>}
            </button>
            <button
              type="button"
              onClick={() => { setSecurity(null); setErrors({}); setPassword('') }}
              className="h-11 w-full text-[14px] font-semibold text-gray-500 transition hover:text-brand-600"
            >
              ← Back to login
            </button>
          </form>
          ) : (
          <form onSubmit={answerQuestion} noValidate className="mt-9 space-y-4">
            <div className="rounded-xl border border-gray-100 bg-[#fafbfc] p-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Security question</div>
              <div className="mt-1.5 text-[15px] font-semibold leading-relaxed text-ink">{security.question}</div>
            </div>
            <div>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <LockIcon className="h-[21px] w-[21px]" />
                </span>
                <input
                  autoFocus
                  type="password"
                  autoComplete="off"
                  placeholder="Security answer"
                  value={security.answer}
                  onChange={(e) => { setSecurity({ ...security, answer: e.target.value }); setErrors({}) }}
                  className="\ pr-4 \"
                />
              </div>
              {errors.answer && <p className="mt-1.5 pl-1 text-[12.5px] font-medium text-red-500">{errors.answer}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-[56px] w-full items-center justify-center gap-2.5 rounded-xl bg-brand-600 text-[17px] font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading ? <><SpinnerIcon className="h-5 w-5" /> Verifying…</> : <>Verify & Continue <ArrowRightIcon className="h-5 w-5" /></>}
            </button>
            <button
              type="button"
              onClick={() => { setSecurity(null); setErrors({}); setPassword('') }}
              className="h-11 w-full text-[14px] font-semibold text-gray-500 transition hover:text-brand-600"
            >
              ← Back to login
            </button>
          </form>
          )}

          {!security && <div className="mt-6 text-center">
            <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-gray-400">Demo accounts — tap to fill</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                ['superadmin', 'super@123', 'Super Admin', 'bg-rose-50 text-rose-600 border-rose-200'],
                ['reseller1', 'reseller@123', 'Reseller', 'bg-violet-50 text-violet-600 border-violet-200'],
                ['user1', 'user@123', 'User', 'bg-emerald-50 text-emerald-600 border-emerald-200'],
              ].map(([u, p, label, cls]) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => { setUserId(u); setPassword(p); setErrors({}) }}
                  className={\lex items-center gap-1.5 rounded-full border border-dashed px-3.5 py-1.5 text-[12px] font-bold transition hover:opacity-80 \\}
                >
                  {label} · {u}
                </button>
              ))}
            </div>
          </div>}
        </>
        )}
      </div>

      ;
    
    code = code.substring(0, startIdx) + newRender + code.substring(endIdx);
    fs.writeFileSync('frontend/src/components/LoginForm.jsx', code, 'utf8');
}
