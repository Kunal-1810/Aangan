import mongoose from 'mongoose';
import { connectDB } from './db.js';
import { User, Property } from './models.js';

await connectDB();
const owner = await User.findOne({ role: { $in: ['owner', 'admin'] } });
if (!owner) {
  console.log('Create an owner account first.');
  process.exit(1);
}

const img = s => `https://picsum.photos/seed/${s}/600/400`;
const data = [
  { title: '2 BHK apartment near the metro', listingType: 'rent', propertyType: 'apartment', price: 32000, bedrooms: 2, bathrooms: 2, areaSqft: 1150, furnished: 'furnished', city: 'Bengaluru', locality: 'Indiranagar', images: [img('aangan1')], description: 'Bright apartment with a balcony, covered parking and 24x7 security.' },
  { title: '3 BHK villa with garden', listingType: 'rent', propertyType: 'villa', price: 48000, bedrooms: 3, bathrooms: 3, areaSqft: 1800, furnished: 'semi', city: 'Bengaluru', locality: 'Whitefield', images: [img('aangan2')], description: 'Independent villa in a gated community with a small private garden.' },
  { title: '2 BHK flat for sale', listingType: 'sale', propertyType: 'apartment', price: 12000000, bedrooms: 2, bathrooms: 2, areaSqft: 1050, furnished: 'unfurnished', city: 'Bengaluru', locality: 'HSR Layout', images: [img('aangan3')], description: 'Ready to move in, east-facing, close to schools and markets.' },
  { title: 'Compact 1 BHK with sea breeze', listingType: 'rent', propertyType: 'apartment', price: 38000, bedrooms: 1, bathrooms: 1, areaSqft: 520, furnished: 'furnished', city: 'Mumbai', locality: 'Powai', images: [img('aangan4')], description: 'Fully furnished flat near the lake, suitable for a single professional or couple.' },
  { title: '3 BHK apartment, society with club', listingType: 'sale', propertyType: 'apartment', price: 18500000, bedrooms: 3, bathrooms: 3, areaSqft: 1450, furnished: 'semi', city: 'Delhi', locality: 'Dwarka', images: [img('aangan5')], description: 'Spacious flat near the metro with a gym, park and power backup.' },
  { title: '2 BHK in a tech corridor', listingType: 'rent', propertyType: 'apartment', price: 28000, bedrooms: 2, bathrooms: 2, areaSqft: 1100, furnished: 'semi', city: 'Hyderabad', locality: 'Gachibowli', images: [img('aangan6')], description: 'Ten minutes from major offices, with modular kitchen and wardrobes.' },
  { title: '4 BHK independent house', listingType: 'sale', propertyType: 'house', price: 34000000, bedrooms: 4, bathrooms: 4, areaSqft: 2600, furnished: 'furnished', city: 'Pune', locality: 'Koregaon Park', images: [img('aangan7')], description: 'Three-floor house with a terrace, car parking for two and a quiet lane.' },
  { title: '1 BHK for working professionals', listingType: 'rent', propertyType: 'apartment', price: 14000, bedrooms: 1, bathrooms: 1, areaSqft: 600, furnished: 'unfurnished', city: 'Noida', locality: 'Sector 62', images: [img('aangan8')], description: 'Affordable flat near the metro and IT offices.' },
  { title: 'Residential plot, corner', listingType: 'sale', propertyType: 'plot', price: 4500000, bedrooms: 0, bathrooms: 0, areaSqft: 1800, furnished: 'unfurnished', city: 'Jaipur', locality: 'Mansarovar', images: [img('aangan9')], description: 'Corner plot on a 30 ft road, clear title, ready for construction.' },
  { title: 'Ground-floor shop on main road', listingType: 'rent', propertyType: 'commercial', price: 55000, bedrooms: 0, bathrooms: 1, areaSqft: 400, furnished: 'unfurnished', city: 'Chandigarh', locality: 'Sector 17', images: [img('aangan10')], description: 'High footfall location, suitable for retail or a showroom.' }
];

await Property.insertMany(data.map(d => ({ ...d, owner: owner._id })));
console.log(`Added ${data.length} listings`);
await mongoose.disconnect();