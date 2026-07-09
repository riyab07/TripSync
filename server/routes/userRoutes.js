import express from 'express';
import User from '../models/User.js';
import Trip from '../models/Trip.js';
import Post from '../models/Post.js';
import protect from '../middleware/authMiddleware.js';
import optionalAuth from '../middleware/optionalAuth.js';

const router = express.Router();

// GET /api/users/:username — public profile
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.username })
      .select('-password')
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isOwner = req.user && req.user._id.toString() === user._id.toString();

    // Private profile, viewed by a non-owner -> minimal info only
    if (!user.isPublic && !isOwner) {
      return res.json({
        user: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          isPublic: false,
          followerCount: user.followers.length,
        },
        trips: [],
        posts: [],
        message: 'This profile is private',
      });
    }

    // Public profile, or the owner viewing themselves -> full data.
    // Owner sees ALL their trips (public + private); everyone else sees only public ones.
    const tripFilter = isOwner
      ? { author: user._id }
      : { author: user._id, isPublic: true };

    const trips = await Trip.find(tripFilter).sort({ createdAt: -1 });
    const posts = await Post.find({ author: user._id }).populate('author', 'name avatar');

    res.json({ user, trips, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/:id/follow — toggle follow
router.put('/:id/follow', protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: "Can't follow yourself" });
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    const isFollowing = targetUser.followers.includes(req.user._id);
    if (isFollowing) {
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id
      );
    } else {
      targetUser.followers.push(req.user._id);
      currentUser.following.push(req.params.id);
    }
    await targetUser.save();
    await currentUser.save();
    res.json({ following: !isFollowing, followers: targetUser.followers.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me/privacy — toggle own profile visibility
router.put('/me/privacy', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isPublic = !user.isPublic;
    await user.save();
    res.json({ isPublic: user.isPublic });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;