import { Router } from 'express';
import { getCategories, createCategory, getTaxonomyStats, updateCategory, deleteCategory } from '../controllers/categoryController';

const router = Router();

router.get('/', getCategories);
router.post('/', createCategory);
router.get('/stats', getTaxonomyStats);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
