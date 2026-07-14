type LoaderProps = {
  label?: string;
  fullScreen?: boolean;
};

export default function Loader({
  label = "Loading...",
  fullScreen = false,
}: LoaderProps) {
  return (
    <div className={fullScreen ? "ui-loader ui-loader--fullscreen" : "ui-loader"}>
      <span className="ui-loader__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
