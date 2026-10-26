import express from 'express';
import {
  getPosts,
  getRecommendedPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  applyToPost,
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/recommended', protect, getRecommendedPosts);
router.get('/:id', getPostById);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/apply', protect, applyToPost);

export default router;
