import express from 'express';
import Trip from '../models/Trip.js';
import protect from '../middleware/authMiddleware.js';
import optionalAuth from '../middleware/optionalAuth.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// GET /api/trips/explore — all public trips (from public profiles only)
router.get('/explore', optionalAuth, async (req, res) => {
  try {
    const trips = await Trip.find({ isPublic: true })
      .populate('author', 'name avatar isPublic')
      .sort({ createdAt: -1 });

    // Hide trips belonging to authors with a private profile,
    // unless the viewer IS that author.
    const visibleTrips = trips.filter((trip) => {
      const isOwner = req.user && req.user._id.toString() === trip.author._id.toString();
      return trip.author.isPublic || isOwner;
    });

    res.json(visibleTrips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/trips/my — logged in user's trips
router.get('/my', protect, async (req, res) => {
  try {
    const trips = await Trip.find({ author: req.user._id })
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/trips — create trip
router.post('/', protect, async (req, res) => {
  try {
    const { title, destination, budget, date, isPublic } = req.body;
    const trip = await Trip.create({
      title,
      destination,
      budget,
      date,
      isPublic,
      author: req.user._id,
    });
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/trips/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await trip.deleteOne();
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/trips/:id/like — toggle like
router.put('/:id/like', protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const liked = trip.likes.includes(req.user._id);
    if (liked) {
      trip.likes = trip.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      trip.likes.push(req.user._id);
    }
    await trip.save();
    res.json({ likes: trip.likes.length, liked: !liked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/trips/:id/clone
router.post('/:id/clone', protect, async (req, res) => {
  try {
    const original = await Trip.findById(req.params.id).populate('author', 'isPublic');
    if (!original) return res.status(404).json({ message: 'Trip not found' });

    const isOwner = original.author._id.toString() === req.user._id.toString();
    const canClone = isOwner || (original.isPublic && original.author.isPublic);

    if (!canClone) {
      return res.status(403).json({ message: 'This trip cannot be cloned' });
    }

    const cloned = await Trip.create({
      title: original.title + ' (Clone)',
      destination: original.destination,
      budget: original.budget,
      date: original.date,
      isPublic: false,
      author: req.user._id,
      clonedFrom: original._id,
    });

    original.cloneCount += 1;
    await original.save();

    res.status(201).json(cloned);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/trips/:id/save — toggle save
router.put('/:id/save', protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const saved = trip.savedBy.includes(req.user._id);
    if (saved) {
      trip.savedBy = trip.savedBy.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      trip.savedBy.push(req.user._id);
    }
    await trip.save();
    res.json({ saved: !saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/trips/:id/cover
router.post('/:id/cover', protect, async (req, res) => {
  try {
    const { image } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const uploaded = await cloudinary.uploader.upload(image, {
      folder: 'tripsync/covers',
      transformation: [{ width: 800, height: 400, crop: 'fill' }],
    });

    trip.coverImage = uploaded.secure_url;
    await trip.save();
    res.json({ coverImage: uploaded.secure_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;