import { intentConfig } from '../config/intentConfig.js';

const {
  greetings,
  thanks,
  helpKeywords,
  summaryIndicators,
  explainIndicators,
  commonKeywords,
  intents
} = intentConfig;

function calculateIntentConfidence(question, intent) {
  if (!intent) return 0;
  
  const lowerQuestion = question.toLowerCase();
  let confidence = 0;
  
  if (intent.excludeKeywords) {
    for (const keyword of intent.excludeKeywords) {
      if (lowerQuestion.includes(keyword.toLowerCase())) {
        return 0;
      }
    }
  }

  const maxScore = 100;
  let score = 0;
  let factors = [];

  if (intent.patterns && intent.patterns.length > 0) {
    for (const pattern of intent.patterns) {
      if (pattern.test(question)) {
        score += 40;
        factors.push(`pattern_match:${pattern}`);
        break;
      }
    }
  }

  if (intent.requiredKeywords && intent.requiredKeywords.length > 0) {
    for (const keywordGroup of intent.requiredKeywords) {
      let allMatch = true;
      for (const keyword of keywordGroup) {
        if (!lowerQuestion.includes(keyword.toLowerCase())) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) {
        score += 30;
        factors.push(`required_keywords:${keywordGroup.join(',')}`);
        break;
      }
    }
  }

  if (intent.keywords && intent.keywords.length > 0) {
    const foundKeywords = intent.keywords.filter(k => 
      lowerQuestion.includes(k.toLowerCase())
    );
    const keywordRatio = foundKeywords.length / intent.keywords.length;
    if (keywordRatio >= 0.5) {
      score += Math.min(20, keywordRatio * 20);
      factors.push(`keywords:${foundKeywords.length}/${intent.keywords.length}`);
    }
  }

  if (intent.action && lowerQuestion.includes('发布')) {
    score += 10;
    factors.push('action_keyword');
  }

  confidence = Math.min(score, maxScore);
  
  return { confidence, factors };
}

function matchesIntent(question, intent) {
  const { confidence } = calculateIntentConfidence(question, intent);
  return confidence >= 30;
}

function isGreeting(question) {
  return greetings.some(g => question.includes(g));
}

function isThanks(question) {
  return thanks.some(t => question.includes(t));
}

function isHelpRequest(question) {
  return helpKeywords.some(k => question.includes(k));
}

function hasSummaryIntent(question) {
  return summaryIndicators.some(kw => question.includes(kw));
}

function hasExplainIntent(question) {
  return explainIndicators.some(kw => question.includes(kw));
}

function smartIdentifyIntent(question, userId) {
  const lowerQuestion = question.toLowerCase();
  
  const scoredIntents = [];
  
  for (const intent of intents) {
    if (intent.requiresUserId && !userId) {
      continue;
    }
    
    const { confidence, factors } = calculateIntentConfidence(question, intent);
    if (confidence > 0) {
      scoredIntents.push({
        ...intent,
        confidence,
        factors
      });
    }
  }
  
  scoredIntents.sort((a, b) => {
    if (b.confidence !== a.confidence) {
      return b.confidence - a.confidence;
    }
    return (b.priority || 0) - (a.priority || 0);
  });
  
  if (scoredIntents.length > 0) {
    const topIntent = scoredIntents[0];
    
    if (scoredIntents.length >= 2) {
      const secondIntent = scoredIntents[1];
      const diff = topIntent.confidence - secondIntent.confidence;
      
      if (diff < 15 && topIntent.action && !secondIntent.action) {
        console.log(`[DEBUG] 意图冲突检测: ${topIntent.type}(${topIntent.confidence}) vs ${secondIntent.type}(${secondIntent.confidence})，优先选择操作意图`);
      } else if (diff < 10) {
        console.log(`[DEBUG] 意图置信度接近: ${topIntent.type}(${topIntent.confidence}) vs ${secondIntent.type}(${secondIntent.confidence})`);
      }
    }
    
    if (topIntent.confidence >= 40) {
      console.log(`[DEBUG] 高置信度匹配: ${topIntent.type} (${topIntent.confidence}%), 因素: ${topIntent.factors.join(', ')}`);
      return { type: topIntent.type, keywords: [], confidence: topIntent.confidence };
    }
  }
  
  if (lowerQuestion.includes('发布') || lowerQuestion.includes('发帖') || lowerQuestion.includes('写文章')) {
    if (lowerQuestion.includes('标题') && lowerQuestion.includes('内容')) {
      return { type: 'create_post', keywords: [], confidence: 60 };
    }
    return { type: 'create_post', keywords: [], confidence: 45 };
  }
  
  if (lowerQuestion.includes('删除') && (lowerQuestion.includes('帖子') || /(ID|编号)\d+/.test(question))) {
    return { type: 'delete_post', keywords: [], confidence: 50 };
  }
  
  if (lowerQuestion.includes('修改') && (lowerQuestion.includes('帖子') || /(ID|编号)\d+/.test(question))) {
    return { type: 'update_post', keywords: [], confidence: 50 };
  }
  
  if (hasSummaryIntent(question)) {
    if (!lowerQuestion.includes('发布') && !lowerQuestion.includes('发帖')) {
      return { type: null, keywords: [], confidence: 0 };
    }
  }
  
  if (hasExplainIntent(question)) {
    if (!lowerQuestion.includes('发布') && !lowerQuestion.includes('发帖')) {
      return { type: null, keywords: [], confidence: 0 };
    }
  }
  
  const foundTechKeywords = commonKeywords.filter(k => question.includes(k));
  
  if (foundTechKeywords.length > 0) {
    return { type: 'search_posts', keywords: foundTechKeywords, confidence: 35 };
  }
  
  return { type: null, keywords: [], confidence: 0 };
}

function getIntentByType(type) {
  return intents.find(i => i.type === type);
}

function addIntent(newIntent) {
  const existing = intents.find(i => i.type === newIntent.type);
  if (existing) {
    Object.assign(existing, newIntent);
  } else {
    intents.push(newIntent);
  }
}

function removeIntent(type) {
  const index = intents.findIndex(i => i.type === type);
  if (index > -1) {
    return intents.splice(index, 1)[0];
  }
  return null;
}

export {
  smartIdentifyIntent,
  isGreeting,
  isThanks,
  isHelpRequest,
  hasSummaryIntent,
  hasExplainIntent,
  matchesIntent,
  commonKeywords,
  getIntentByType,
  addIntent,
  removeIntent,
  intentConfig
};