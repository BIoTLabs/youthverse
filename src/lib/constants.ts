export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export const AFFILIATIONS = [
  'NYSC Corps Member',
  'NiYA Academy Participant',
  'University Student',
  'Polytechnic Student',
  'College of Education Student',
  'Secondary School Student',
  'Unemployed Youth',
  'Self-Employed',
  'Employed',
  'Green Schools Initiative',
  'Other'
];

export const TREE_SPECIES = [
  'Mahogany', 'Iroko', 'Cashew', 'Mango', 'Neem', 'Shea', 'Locust Bean',
  'Moringa', 'Palm Oil', 'Coconut', 'Eucalyptus', 'Teak', 'Gmelina', 'Other'
];

export const GIG_CATEGORIES = [
  'Technology', 'Design', 'Writing', 'Data Entry', 'Research',
  'Community Outreach', 'Agriculture', 'Education', 'Health', 'Environment'
];

export const SKILL_CATEGORIES = [
  'Digital Literacy', 'Entrepreneurship', 'Agriculture', 'Technology',
  'Financial Literacy', 'Leadership', 'Green Skills', 'Health & Safety'
];

// Simplified CO2 estimation: kg CO2 per year per tree by species
export const CO2_ESTIMATES: Record<string, number> = {
  'Mahogany': 35, 'Iroko': 30, 'Cashew': 20, 'Mango': 25, 'Neem': 22,
  'Shea': 18, 'Locust Bean': 20, 'Moringa': 15, 'Palm Oil': 28, 'Coconut': 22,
  'Eucalyptus': 32, 'Teak': 30, 'Gmelina': 28, 'Other': 20
};
