import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import redisClient from '../config/redis';
import logger from '../utils/logger';

// Judge0 Language IDs
const LANGUAGE_IDS: Record<string, number> = {
  python: 71,      // Python 3.8.1
  javascript: 63,  // Node.js 12.14.0
  typescript: 74,  // TypeScript 3.7.4
  java: 62,        // OpenJDK 13.0.1
  cpp: 54,         // GCC 9.2.0
  c: 50,           // GCC 9.2.0
};

const CACHE_TTL = 3600; // 1 hour

const generateCacheKey = (language: string, code: string, stdin: string) => {
  const content = `${language}:${code}:${stdin}`;
  return `exec:${crypto.createHash('sha256').update(content).digest('hex')}`;
};

export const executeCode = async (req: Request, res: Response) => {
  const { language, code, stdin } = req.body;

  if (!language || !code) {
    return res.status(400).json({ message: 'Language and code are required.' });
  }

  const languageId = LANGUAGE_IDS[language.toLowerCase()];

  if (!languageId) {
    return res.status(400).json({ message: `Language ${language} is not supported by our current execution engine.` });
  }

  const cacheKey = generateCacheKey(language, code, stdin || '');

  try {
    // 1. Check Cache
    if (redisClient.isOpen) {
      const cachedResult = await redisClient.get(cacheKey);
      if (cachedResult) {
        return res.setHeader('X-Cache', 'HIT').json(JSON.parse(cachedResult));
      }
    }

    // 2. Execute if cache miss
    const response = await axios.post(
      'https://ce.judge0.com/submissions?base64_encoded=false&wait=true',
      {
        source_code: code,
        language_id: languageId,
        stdin: stdin || '',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { stdout, stderr, compile_output, message, status } = response.data;

    const result = {
      run: {
        stdout: stdout || '',
        stderr: stderr || compile_output || message || '',
        output: stdout || compile_output || message || '',
        status: status?.description || 'Unknown'
      }
    };

    // 3. Store in Cache if successful and Redis is connected
    if (redisClient.isOpen && status?.id === 3) { // 3 = Accepted
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
    }

    res.setHeader('X-Cache', 'MISS').json(result);
  } catch (error: any) {
    logger.error('Execution Engine Error:', { 
      message: error.message, 
      data: error.response?.data,
      body: req.body 
    });
    res.status(500).json({ 
      message: 'Failed to execute code. The execution engine might be down.',
      error: error.response?.data || error.message
    });
  }
};
