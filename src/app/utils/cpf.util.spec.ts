import { cpfValido, limparCpf } from './cpf.util';

describe('cpf.util', () => {
  it('limpa caracteres não numéricos', () => {
    expect(limparCpf('529.982.247-25')).toBe('52998224725');
  });

  it('valida CPF correto', () => {
    expect(cpfValido('52998224725')).toBeTrue();
  });

  it('rejeita CPF inválido', () => {
    expect(cpfValido('11111111111')).toBeFalse();
  });
});
