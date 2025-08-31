import { expect } from 'chai';
import { digiPinValidator } from '../util';

describe('DigiPin Validator', () => {
  it('accepts valid hyphenated pins', () => {
    expect(() => digiPinValidator('K4P-9C6-LMPT')).to.not.throw();
  });

  it('accepts valid non-hyphenated pins', () => {
    expect(() => digiPinValidator('K4P9C6LMPT')).to.not.throw();
  });

  it('rejects invalid length', () => {
    expect(() => digiPinValidator('K4P-9C6')).to.throw('Invalid DIGIPIN');
  });

  it('rejects invalid characters', () => {
    expect(() => digiPinValidator('K4P-9C6-LMP1')).to.throw('Invalid character');
  });
});

