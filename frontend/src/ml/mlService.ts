// TensorFlow.js - Disabled for now
// import * as tf from '@tensorflow/tfjs';

export interface CognitiveMetrics {
  timeOnModule: number;
  errorRate: number;
  hintUsage: number;
  attempts: number;
  previousLoad?: number;
}

let cognitiveModel: any = null;

export async function initCognitiveModel(): Promise<void> {
  // Disabled for now
  /*
  cognitiveModel = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [5], units: 16, activation: 'relu' }),
      tf.layers.dense({ units: 8, activation: 'relu' }),
      tf.layers.dense({ units: 1, activation: 'sigmoid' })
    ]
  });

  cognitiveModel.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError'
  });
  */
}

export function predictCognitiveLoad(metrics: CognitiveMetrics): number {
  const input = [
    metrics.timeOnModule / 600,
    metrics.errorRate,
    metrics.hintUsage / 5,
    metrics.attempts / 5,
    (metrics.previousLoad || 50) / 100
  ];

  if (!cognitiveModel) {
    let loadLevel = 50;
    
    if (metrics.timeOnModule > 600) loadLevel += 15;
    if (metrics.errorRate > 0.5) loadLevel += 20;
    if (metrics.hintUsage > 3) loadLevel += 15;
    if (metrics.attempts > 3) loadLevel += 10;
    if (metrics.previousLoad) loadLevel = (loadLevel + metrics.previousLoad) / 2;
    
    return Math.max(0, Math.min(100, loadLevel));
  }

  // Disabled for now
  /*
  const inputTensor = tf.tensor2d([input]);
  const prediction = cognitiveModel.predict(inputTensor) as tf.Tensor;
  const result = prediction.dataSync()[0] * 100;
  
  inputTensor.dispose();
  prediction.dispose();
  
  return Math.round(Math.max(0, Math.min(100, result)));
  */

  return 50;
}

export function analyzeText(text: string): {
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  complexity: number;
} {
  const positiveWords = ['good', 'great', 'excellent', 'understand', 'learned', 'helpful', 'clear'];
  const negativeWords = ['confused', 'wrong', 'difficult', 'hard', 'struggling', 'unclear'];
  
  const words = text.toLowerCase().split(/\s+/);
  
  const keywords = words.filter(w => 
    ['algorithm', 'function', 'variable', 'loop', 'api', 'database', 'react', 'python', 'code'].some(k => w.includes(k))
  );
  
  const positiveCount = words.filter(w => positiveWords.some(p => w.includes(p))).length;
  const negativeCount = words.filter(w => negativeWords.some(n => w.includes(n))).length;
  
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (positiveCount > negativeCount) sentiment = 'positive';
  else if (negativeCount > positiveCount) sentiment = 'negative';
  
  const complexity = Math.min(100, Math.round((keywords.length * 15) + (text.length / 20)));

  return { keywords, sentiment, complexity };
}

export function getLearningRecommendation(
  cognitiveLoad: number,
  performance: number
): { level: 'increase' | 'decrease' | 'maintain'; message: string } {
  if (cognitiveLoad > 70 || performance < 50) {
    return {
      level: 'decrease',
      message: 'Consider reviewing material before moving forward'
    };
  } else if (cognitiveLoad < 40 && performance > 80) {
    return {
      level: 'increase',
      message: 'You\'re ready for more challenging content'
    };
  }
  return {
    level: 'maintain',
    message: 'Continue with current difficulty level'
  };
}

export function calculateMastery(conceptScores: Record<string, number>): Record<string, string> {
  const mastery: Record<string, string> = {};
  
  for (const [concept, score] of Object.entries(conceptScores)) {
    if (score >= 80) mastery[concept] = 'Expert';
    else if (score >= 60) mastery[concept] = 'Proficient';
    else if (score >= 40) mastery[concept] = 'Developing';
    else mastery[concept] = 'Beginner';
  }
  
  return mastery;
}
