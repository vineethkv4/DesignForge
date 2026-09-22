interface AvatarInitialProps {
  name: string;
}

export function AvatarInitial({ name }: AvatarInitialProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="app-avatar" title={name}>
      {initial}
    </div>
  );
}
