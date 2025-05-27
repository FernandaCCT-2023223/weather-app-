// filepath: c:\Users\caioJ\react-native\cct\utils\__tests__\normaliseCityName.test.ts
import { normaliseCityName } from '../normaliseCityName';

describe('normaliseCityName', () => {
  it('capitalises single word', () => {
    expect(normaliseCityName('dublin')).toBe('Dublin');
  });
  it('capitalises each word in multi-word city', () => {
    expect(normaliseCityName('new york')).toBe('New York');
    expect(normaliseCityName('rio de janeiro')).toBe('Rio De Janeiro');
  });
  it('trims and fixes spacing', () => {
    expect(normaliseCityName('   san   francisco  ')).toBe('San Francisco');
  });
  it('handles empty string', () => {
    expect(normaliseCityName('')).toBe('');
  });
});