import { 
  smartIdentifyIntent, 
  isGreeting, 
  isThanks, 
  isHelpRequest,
  hasSummaryIntent,
  hasExplainIntent,
  intentConfig
} from '../services/intentService.js';

console.log('==========================================');
console.log('意图识别系统配置化改造测试');
console.log('==========================================\n');

console.log('1. 配置加载测试');
console.log(`   - 意图数量: ${intentConfig.intents.length}`);
console.log(`   - 问候语数量: ${intentConfig.greetings.length}`);
console.log(`   - 技术关键词数量: ${intentConfig.commonKeywords.length}`);
console.log('');

const testCases = [
  { question: '你好', expected: 'greeting', userId: null },
  { question: '谢谢', expected: 'thanks', userId: null },
  { question: '怎么使用', expected: 'help', userId: null },
  { question: '总结一下', expected: 'summary', userId: null },
  { question: '详细介绍', expected: 'explain', userId: null },
  { question: '帖子数量', expected: 'total_posts', userId: null },
  { question: '我发布了多少帖子', expected: 'my_posts_count', userId: 1 },
  { question: '我发布了多少帖子', expected: 'null', userId: null },
  { question: '云计算', expected: 'search_posts', userId: null },
  { question: 'Vue', expected: 'search_posts', userId: null },
  { question: '各分类统计', expected: 'category_stats', userId: null },
  { question: '最新帖子', expected: 'latest_posts', userId: null },
  { question: '浏览量', expected: 'total_views', userId: null },
  { question: '评论数量', expected: 'total_comments', userId: null },
  { question: '用户数量', expected: 'total_users', userId: null },
  { question: '烟台天气怎么样', expected: 'null', userId: 1 },
];

console.log('2. 意图识别测试');
console.log('──────────────────────────────────────────');

let passed = 0;
let failed = 0;

for (const test of testCases) {
  let result = '';
  
  if (isGreeting(test.question)) {
    result = 'greeting';
  } else if (isThanks(test.question)) {
    result = 'thanks';
  } else if (isHelpRequest(test.question)) {
    result = 'help';
  } else if (hasSummaryIntent(test.question)) {
    result = 'summary';
  } else if (hasExplainIntent(test.question)) {
    result = 'explain';
  } else {
    const intent = smartIdentifyIntent(test.question, test.userId);
    result = intent.type || 'null';
  }
  
  const status = result === test.expected ? '✓ PASS' : '✗ FAIL';
  if (status === '✓ PASS') passed++;
  else failed++;
  
  console.log(`${status} | "${test.question}" (userId: ${test.userId})`);
  if (result !== test.expected) {
    console.log(`    期望: ${test.expected}, 实际: ${result}`);
  }
}

console.log('');
console.log('3. 优先级排序验证');
console.log('──────────────────────────────────────────');
const sortedIntents = [...intentConfig.intents].sort((a, b) => (b.priority || 0) - (a.priority || 0));
console.log('意图优先级排序:');
sortedIntents.forEach((intent, index) => {
  console.log(`   ${index + 1}. ${intent.type} (priority: ${intent.priority})`);
});

console.log('');
console.log('==========================================');
console.log(`测试结果: ${passed} 个通过, ${failed} 个失败`);
console.log('==========================================');

process.exit(failed > 0 ? 1 : 0);