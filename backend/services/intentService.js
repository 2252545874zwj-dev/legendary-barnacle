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

function matchesIntent(question, intent) {
  if (!intent) return false;
  
  const lowerQuestion = question.toLowerCase();
  
  if (intent.excludeKeywords) {
    for (const keyword of intent.excludeKeywords) {
      if (lowerQuestion.includes(keyword.toLowerCase())) {
        return false;
      }
    }
  }

  if (intent.patterns && intent.patterns.length > 0) {
    for (const pattern of intent.patterns) {
      if (pattern.test(question)) {
        return true;
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
        return true;
      }
    }
  }

  if (intent.keywords && intent.keywords.length > 0) {
    const foundKeywords = intent.keywords.filter(k => 
      lowerQuestion.includes(k.toLowerCase())
    );
    if (foundKeywords.length >= Math.ceil(intent.keywords.length / 2)) {
      return true;
    }
  }

  return false;
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
  if (hasSummaryIntent(question)) {
    return { type: null, keywords: [] };
  }
  
  if (hasExplainIntent(question)) {
    return { type: null, keywords: [] };
  }
  
  const sortedIntents = [...intents].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
  for (const intent of sortedIntents) {
    if (intent.requiresUserId && !userId) {
      continue;
    }
    
    if (matchesIntent(question, intent)) {
      return { type: intent.type, keywords: [] };
    }
  }
  
  const foundTechKeywords = commonKeywords.filter(k => question.includes(k));
  
  if (foundTechKeywords.length > 0) {
    return { type: 'search_posts', keywords: foundTechKeywords };
  }
  
  return { type: null, keywords: [] };
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