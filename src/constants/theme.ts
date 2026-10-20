// CivicSense Colour System Tokens
// Derived from the laptop analytics illustration in the reference image

export const CIVIC_THEME = {
  bgIvory: '#FBF7EF',
  cardCream: '#FFFDF8',
  forestGreen: '#073D32',
  emeraldGreen: '#15966A',
  terracottaOrange: '#E85A24',
  goldenYellow: '#F2B544',
  sageGreen: '#A8B99A',
  coralRed: '#F16B5B',
  softMint: '#DFF2E6',
  softPeach: '#FCE7D7',
  softYellow: '#FFF1C9',
  softRose: '#FBE2E0',
  textDark: '#182820',
  textMuted: '#687568',
  borderBeige: '#E7E0D3',
};

// 3-Class Sentiment Polarity Theme
export const SENTIMENT_THEME = {
  Positive: {
    color: '#15966A',      // Emerald Green
    bg: '#DFF2E6',         // Soft Mint
    border: '#A3E0C0',
    text: '#073D32',
    label: 'Positive'
  },
  Neutral: {
    color: '#F2B544',      // Golden Yellow
    bg: '#FFF1C9',         // Soft Yellow
    border: '#F7D688',
    text: '#8F5C0A',
    label: 'Neutral'
  },
  Negative: {
    color: '#F16B5B',      // Coral Red
    bg: '#FBE2E0',         // Soft Rose
    border: '#F7B7B1',
    text: '#A62419',
    label: 'Negative'
  }
};

// 8 Public-Service Category Color Assignments
export const DOMAIN_THEME: Record<string, { color: string; bg: string; text: string; border: string }> = {
  'Roads': {
    color: '#15966A',      // Emerald Green
    bg: '#DFF2E6',
    text: '#073D32',
    border: '#A3E0C0'
  },
  'Water Supply': {
    color: '#E85A24',      // Terracotta Orange
    bg: '#FCE7D7',
    text: '#7C2D12',
    border: '#FDBA74'
  },
  'Electricity': {
    color: '#8DB600',      // Sage/Golden Green
    bg: '#EDF7D2',
    text: '#365314',
    border: '#BEF264'
  },
  'Healthcare': {
    color: '#5B8A6A',      // Muted Sage
    bg: '#E4EFE7',
    text: '#1C3E29',
    border: '#A7D7B5'
  },
  'Education': {
    color: '#8B5CF6',      // Soft Purple
    bg: '#EDE9FE',
    text: '#4C1D95',
    border: '#DDD6FE'
  },
  'Transportation': {
    color: '#14B8A6',      // Teal
    bg: '#CCFBF1',
    text: '#115E59',
    border: '#99F6E4'
  },
  'Drainage / Sewage': {
    color: '#E85A24',      // Terracotta / Golden Orange
    bg: '#FFF1C9',
    text: '#9A3412',
    border: '#FDE68A'
  },
  'Other Public Services': {
    color: '#A8B99A',      // Warm Olive / Sage
    bg: '#F4F7F2',
    text: '#2F3E29',
    border: '#D5DFD1'
  }
};
