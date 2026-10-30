export function gerarId(): string {
  const cryptoRef = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (cryptoRef?.randomUUID) {
    return cryptoRef.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
