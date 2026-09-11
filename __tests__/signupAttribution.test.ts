import {
  attributionFromSearchParams,
  parseSignupAttribution,
} from '../lib/signupAttribution';

describe('signup attribution', () => {
  it('maps supported UTM parameters', () => {
    const params = new URLSearchParams(
      'utm_source=meta&utm_campaign=summer&utm_medium=paid_social&utm_content=video&utm_term=bike'
    );

    expect(attributionFromSearchParams(params)).toEqual({
      source: 'meta',
      campaign: 'summer',
      medium: 'paid_social',
      content: 'video',
      term: 'bike',
    });
  });

  it('requires a source and limits stored values', () => {
    expect(attributionFromSearchParams(new URLSearchParams('utm_campaign=summer'))).toBeNull();
    expect(parseSignupAttribution({ source: 'x'.repeat(250) })?.source).toHaveLength(200);
  });

  it('ignores unknown fields', () => {
    expect(parseSignupAttribution({ source: 'meta', unexpected: 'value' })).toEqual({
      source: 'meta',
      campaign: undefined,
      medium: undefined,
      content: undefined,
      term: undefined,
    });
  });
});
