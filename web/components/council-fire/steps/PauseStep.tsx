interface Props {
  accentColor: string;
}

export function PauseStep({ accentColor }: Props) {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Still circle — silence */}
      <div
        className="cf-glow-circle mb-8"
        style={{ background: accentColor, opacity: 0.3 }}
      />
    </div>
  );
}
