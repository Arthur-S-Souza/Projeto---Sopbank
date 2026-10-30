import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cpfValido, limparCpf } from './cpf';

describe('cpf', () => {
  it('limpa máscara', () => {
    assert.equal(limparCpf('529.982.247-25'), '52998224725');
  });

  it('valida CPF', () => {
    assert.equal(cpfValido('52998224725'), true);
    assert.equal(cpfValido('11111111111'), false);
  });
});
