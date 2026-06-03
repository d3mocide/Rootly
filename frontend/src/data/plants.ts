import type { Plant } from '../types/plant';

export const INITIAL_PLANTS: Plant[] = [
  {
    id: 'monstera', name: 'Monstera', species: 'Monstera deliciosa', kind: 'monstera',
    room: 'Living room', moisture: 72, status: 'thriving', every: 9, light: 'Bright, indirect',
    note: 'Soil looks good for now.', growth: [3, 4, 4, 5, 6, 6, 7], lastWater: '5 days ago',
  },
  {
    id: 'fig', name: 'Fiddle-leaf fig', species: 'Ficus lyrata', kind: 'fig',
    room: 'Living room', moisture: 22, status: 'dry', every: 7, light: 'Bright, indirect',
    note: 'Due for a drink.', growth: [2, 2, 3, 3, 4, 4, 4], lastWater: '8 days ago',
  },
  {
    id: 'pothos', name: 'Pothos', species: 'Epipremnum aureum', kind: 'pothos',
    room: 'Bedroom', moisture: 94, status: 'watered', every: 6, light: 'Low to bright',
    note: 'Watered today.', growth: [5, 6, 6, 7, 8, 9, 11], lastWater: 'Today',
  },
  {
    id: 'snake', name: 'Snake plant', species: 'Dracaena trifasciata', kind: 'snake',
    room: 'Office', moisture: 48, status: 'soon', every: 14, light: 'Any',
    note: 'Watering scheduled for tomorrow.', growth: [4, 4, 5, 5, 5, 6, 6], lastWater: '11 days ago',
  },
  {
    id: 'succulent', name: 'Echeveria', species: 'Echeveria elegans', kind: 'succulent',
    room: 'Kitchen', moisture: 60, status: 'thriving', every: 18, light: 'Direct sun',
    note: 'Growth is steady this week.', growth: [1, 1, 2, 2, 2, 3, 3], lastWater: '7 days ago',
  },
];
