export const malaysiaStatesAndCities = {
  selangor: ['Shah Alam', 'Petaling Jaya', 'Subang Jaya'],
  johor: ['Johor Bahru', 'Batu Pahat', 'Muar'],
  penang: ['George Town', 'Butterworth', 'Bukit Mertajam'],
  perak: ['Ipoh', 'Taiping', 'Teluk Intan'],
  sarawak: ['Kuching', 'Miri', 'Sibu'],
  sabah: ['Kota Kinabalu', 'Sandakan', 'Tawau']
} as const;

export type MalaysiaState = keyof typeof malaysiaStatesAndCities;
export type MalaysiaCity =
  (typeof malaysiaStatesAndCities)[MalaysiaState][number];

// Function to get a random state
export const getRandomState = (): MalaysiaState => {
  const states = Object.keys(malaysiaStatesAndCities) as MalaysiaState[];
  return states[Math.floor(Math.random() * states.length)];
};

// Function to get a random city for a given state
export const getRandomCity = (state: MalaysiaState): MalaysiaCity => {
  const cities = malaysiaStatesAndCities[state];
  return cities[Math.floor(Math.random() * cities.length)];
};
