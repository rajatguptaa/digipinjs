import { expect } from 'chai';
import { digiPinValidator, normalizeDigiPin } from '../util';
import { InvalidCharacterError, PinFormatError } from '../errors';

describe('DigiPin Validator', () => {
  it('accepts valid hyphenated pins', () => {
    expect(() => digiPinValidator('K4P-9C6-LMPT')).to.not.throw();
  });

  it('accepts valid non-hyphenated pins', () => {
    expect(() => digiPinValidator('K4P9C6LMPT')).to.not.throw();
  });

  it('rejects invalid length', () => {
    expect(() => digiPinValidator('K4P-9C6')).to.throw(PinFormatError);
  });

  it('rejects invalid characters', () => {
    expect(() => digiPinValidator('K4P-9C6-LMP1')).to.throw(InvalidCharacterError);
  });

  it('normalizes pins to uppercase compact format', () => {
    const normalized = normalizeDigiPin('k4p-9c6-lmpt');
    expect(normalized).to.equal('K4P9C6LMPT');
  });
});
