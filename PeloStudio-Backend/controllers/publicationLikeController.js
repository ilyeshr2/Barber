const { PublicationLike, Publication, User } = require('../models');
const { Op } = require('sequelize');

// Like a publication
exports.likePublication = async (req, res) => {
  try {
    const { publicationId } = req.params;
    const userId = req.userId;

    // Check if publication exists
    const publication = await Publication.findByPk(publicationId);
    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }

    // Check if user has already liked the publication
    const existingLike = await PublicationLike.findOne({
      where: {
        user_id: userId,
        publication_id: publicationId
      }
    });

    if (existingLike) {
      return res.status(400).json({ message: 'You have already liked this publication' });
    }

    // Create the like
    await PublicationLike.create({
      user_id: userId,
      publication_id: publicationId
    });

    // Update publication likes count
    await publication.increment('likes');

    res.status(201).json({ message: 'Publication liked successfully' });
  } catch (error) {
    console.error('Error liking publication:', error);
    res.status(500).json({ message: 'Server error while liking publication' });
  }
};

// Unlike a publication
exports.unlikePublication = async (req, res) => {
  try {
    const { publicationId } = req.params;
    const userId = req.userId;

    // Check if publication exists
    const publication = await Publication.findByPk(publicationId);
    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }

    // Find and delete the like
    const like = await PublicationLike.findOne({
      where: {
        user_id: userId,
        publication_id: publicationId
      }
    });

    if (!like) {
      return res.status(400).json({ message: 'You have not liked this publication' });
    }

    await like.destroy();

    // Update publication likes count
    await publication.decrement('likes');

    res.status(200).json({ message: 'Publication unliked successfully' });
  } catch (error) {
    console.error('Error unliking publication:', error);
    res.status(500).json({ message: 'Server error while unliking publication' });
  }
};

// Get likes for a publication
exports.getPublicationLikes = async (req, res) => {
  try {
    const { publicationId } = req.params;

    // Check if publication exists
    const publication = await Publication.findByPk(publicationId);
    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }

    // Get all likes for the publication with user details
    const likes = await PublicationLike.findAll({
      where: { publication_id: publicationId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'first_name', 'last_name', 'photo_url']
      }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      count: likes.length,
      likes: likes.map(like => ({
        id: like.id,
        user: like.user,
        created_at: like.created_at
      }))
    });
  } catch (error) {
    console.error('Error getting publication likes:', error);
    res.status(500).json({ message: 'Server error while getting publication likes' });
  }
};

// Check if current user has liked a publication
exports.getLikeStatus = async (req, res) => {
  try {
    const { publicationId } = req.params;
    const userId = req.userId;

    // Check if publication exists
    const publication = await Publication.findByPk(publicationId);
    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }

    // Check if user has liked the publication
    const like = await PublicationLike.findOne({
      where: {
        user_id: userId,
        publication_id: publicationId
      }
    });

    res.status(200).json({
      hasLiked: !!like,
      likeId: like ? like.id : null
    });
  } catch (error) {
    console.error('Error getting like status:', error);
    res.status(500).json({ message: 'Server error while getting like status' });
  }
}; 