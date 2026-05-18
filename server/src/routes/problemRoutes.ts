import { Router } from 'express';
import { 
  getProblems, 
  getProblemBySlug, 
  updateProblemCode, 
  createProblem,
  deleteProblem
} from '../controllers/problemController';

const router = Router();

router.get('/', getProblems);
router.get('/:slug', getProblemBySlug);
router.put('/:slug', updateProblemCode);
router.post('/', createProblem);
router.delete('/:slug', deleteProblem);

export default router;
