import { expect } from 'chai';
import { InvalidCharacterError } from '../errors';

describe('Validation Suggestions', () => {
    it('suggests corrections for common typos', () => {
        const error = new InvalidCharacterError('O');
        expect(error.message).to.include("Did you mean '0'?");
    });

    it('suggests corrections for another typo', () => {
        const error = new InvalidCharacterError('1');
        expect(error.message).to.include("Did you mean 'J'?");
    });

    it('does not suggest for unknown typos', () => {
        const error = new InvalidCharacterError('X');
        expect(error.message).to.not.include("Did you mean");
        expect(error.message).to.equal("Invalid character 'X' in DIGIPIN");
    });
});
