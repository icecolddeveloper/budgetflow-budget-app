export function LoadingState({ message = "Loading your budget...", fullScreen = false }) {
  return (
    <div className={`loading-state ${fullScreen ? "loading-state--screen" : ""}`}>
      <div className="loading-orb" />
      <p>{message}</p>
    </div>
  );
}
