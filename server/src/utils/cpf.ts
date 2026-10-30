export function limparCpf(cpf: string): string {
  return (cpf || '').replace(/\D/g, '');
}

export function cpfValido(cpf: string): boolean {
  const digits = limparCpf(cpf);
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  const calcDigito = (base: string, fator: number): number => {
    let total = 0;
    for (let i = 0; i < base.length; i++) {
      total += parseInt(base.charAt(i), 10) * (fator - i);
    }
    const resto = (total * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = calcDigito(digits.slice(0, 9), 10);
  const d2 = calcDigito(digits.slice(0, 10), 11);
  return d1 === parseInt(digits.charAt(9), 10) && d2 === parseInt(digits.charAt(10), 10);
}
