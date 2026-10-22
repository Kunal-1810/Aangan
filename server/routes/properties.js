import { Router } from 'express';
import { Property } from '../models.js';
import { requireAuth, requireRole } from '../auth.js';

const r = Router();
const FIELDS = ['title', 'description', 'listingType', 'propertyType', 'price', 'bedrooms', 'bathrooms', 'areaSqft', 'furnished', 'city', 'locality', 'images'];
const pick = body => Object.fromEntries(FIELDS.filter(k => body[k] !== undefined).map(k => [k, body[k]]));
const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const canEdit = (doc, user) => String(doc.owner) === String(user._id) || user.role === 'admin';

// Search, filter, sort, paginate
r.get('/', async (req, res) => {
  const { city, listingType, propertyType, furnished, bedrooms, minPrice, maxPrice, sort = 'newest' } = req.query;
  const q = { status: 'approved' };
  if (city) q.city = new RegExp(escapeRegex(String(city)), 'i');
  if (['rent', 'sale'].includes(listingType)) q.listingType = listingType;
  if (propertyType) q.propertyType = String(propertyType);
  if (furnished) q.furnished = String(furnished);
  if (bedrooms) q.bedrooms = { $gte: Number(bedrooms) };
  if (minPrice || maxPrice) {
    q.price = {};
    if (minPrice) q.price.$gte = Number(minPrice);
    if (maxPrice) q.price.$lte = Number(maxPrice);
  }
  const sorts = { newest: { createdAt: -1 }, priceAsc: { price: 1 }, priceDesc: { price: -1 } };
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 9));
  const [items, total] = await Promise.all([
    Property.find(q).sort(sorts[sort] || sorts.newest).skip((page - 1) * limit).limit(limit).populate('owner', 'name'),
    Property.countDocuments(q)
  ]);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

r.get('/mine', requireAuth, requireRole('owner', 'admin'), async (req, res) => {
  res.json(await Property.find({ owner: req.user._id }).sort({ createdAt: -1 }));
});

r.get('/:id', async (req, res) => {
  const doc = await Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate('owner', 'name phone');
  if (!doc) return res.status(404).json({ error: 'Property not found' });
  res.json(doc);
});

r.post('/', requireAuth, requireRole('owner', 'admin'), async (req, res) => {
  res.status(201).json(await Property.create({ ...pick(req.body), owner: req.user._id }));
});

r.put('/:id', requireAuth, async (req, res) => {
  const doc = await Property.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Property not found' });
  if (!canEdit(doc, req.user)) return res.status(403).json({ error: 'You can only edit your own listings' });
  Object.assign(doc, pick(req.body));
  await doc.save();
  res.json(doc);
});

r.delete('/:id', requireAuth, async (req, res) => {
  const doc = await Property.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Property not found' });
  if (!canEdit(doc, req.user)) return res.status(403).json({ error: 'You can only delete your own listings' });
  await doc.deleteOne();
  res.json({ ok: true });
});

export default r;
