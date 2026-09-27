// Static reference data for Metro Manila's rail lines and the EDSA BRT
// corridor. Order matters: each station/stop's index in its array is its
// position along the line, which price.js uses to work out how many
// stops apart two points are (needed for the MRT-3 fare tiers).
const RAIL_LINES = {
  'MRT-3': {
    label: 'MRT-3',
    stations: [
      'North Avenue',
      'Quezon Avenue',
      'GMA Kamuning',
      'Cubao (MRT-3)',
      'Santolan-Annapolis',
      'Ortigas',
      'Shaw Boulevard',
      'Boni',
      'Guadalupe',
      'Buendia',
      'Ayala',
      'Magallanes',
      'Taft Avenue'
    ]
  },
  'LRT-1': {
    label: 'LRT-1',
    stations: [
      'Baclaran',
      'EDSA',
      'Libertad',
      'Gil Puyat',
      'Vito Cruz',
      'Quirino Avenue',
      'Pedro Gil',
      'United Nations',
      'Central Terminal',
      'Carriedo',
      'Doroteo Jose',
      'Bambang',
      'Tayuman',
      'Blumentritt',
      'Abad Santos',
      'R. Papa',
      '5th Avenue',
      'Monumento',
      'Balintawak',
      'Roosevelt (Fernando Poe Jr.)'
    ]
  },
  'LRT-2': {
    label: 'LRT-2',
    stations: [
      'Recto',
      'Legarda',
      'Pureza',
      'V. Mapa',
      'J. Ruiz',
      'Gilmore',
      'Betty Go-Belmonte',
      'Araneta Cubao (LRT-2)',
      'Anonas',
      'Katipunan',
      'Santolan (LRT-2)',
      'Marikina-Pasig',
      'Antipolo'
    ]
  },
  'BRT': {
    label: 'EDSA Busway (BRT)',
    geocodeSuffix: 'Bus Stop',
    // Southbound stop order, Monumento to PITX - the northbound run covers
    // almost the same stops in reverse, so one ordered list is enough for
    // nearest-stop lookup.
    stations: [
      'Monumento',
      'Bagong Barrio',
      'Balintawak',
      'Kaingin',
      'Fernando Poe Jr.',
      'SM North Edsa',
      'North Avenue',
      'Philam',
      'Quezon Avenue',
      'Kamuning',
      'Nepa Q-Mart',
      'Main Avenue',
      'Santolan-Annapolis',
      'Ortigas',
      'Guadalupe',
      'Buendia',
      'One Ayala',
      'Tramo',
      'Taft Avenue',
      'Roxas Boulevard',
      'SM Mall of Asia',
      'DFA',
      'Ayala Malls Aseana',
      'PITX'
    ]
  }
};