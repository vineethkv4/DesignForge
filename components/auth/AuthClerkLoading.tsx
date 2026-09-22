export function AuthClerkLoading() {
  return (
    <div className="auth-clerk-loading" aria-busy="true" aria-label="Loading sign-in form">
      <div className="auth-clerk-loading-bar" />
      <div className="auth-clerk-loading-bar short" />
      <div className="auth-clerk-loading-bar" />
    </div>
  );
}
