export default function SetupNeeded() {
  return (
    <div className="container">
      <div className="card stack">
        <h1>Almost there ⛳</h1>
        <p>
          This app needs a free Firebase project to store live scores and handle admin sign-in.
          No Firebase config was found in the build.
        </p>
        <p className="muted">
          Copy <code>.env.example</code> to <code>.env</code>, fill in your Firebase project's
          config values, and restart the dev server. Full step-by-step instructions are in{' '}
          <code>README.md</code>.
        </p>
      </div>
    </div>
  )
}
