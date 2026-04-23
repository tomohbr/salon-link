export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--gray-0)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full animate-spin"
          style={{
            border: '3px solid var(--gray-200)',
            borderTopColor: 'var(--brand)',
          }}
        />
        <p className="text-xs tracking-wider" style={{ color: 'var(--gray-500)' }}>
          読み込み中...
        </p>
      </div>
    </div>
  );
}
