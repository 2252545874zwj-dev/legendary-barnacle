/**
 * 豆包AI服务
 * 负责与豆包API交互，提供AI问答和内容分析功能
 */

import axios from 'axios';

const ARK_API_KEY = process.env.ARK_API_KEY || '';
const ARK_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/responses';
const DOBAO_MODEL = process.env.DOBAO_MODEL || 'doubao-seed-1-8-251228';

const MAX_RETRIES = 2;
const TIMEOUT = 15000;

const doubaoClient = axios.create({
  baseURL: ARK_API_URL,
  headers: {
    'Authorization': `Bearer ${ARK_API_KEY}`,
    'Content-Type': 'application/json'
  },
  responseType: 'json',
  timeout: TIMEOUT
});

/**
 * 公共API调用方法
 * @param {string} prompt - 提示词
 * @returns {string} - AI回复内容
 */
async function _callAPI(prompt) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Doubao API request (attempt ${attempt}/${MAX_RETRIES}):`, { prompt });

      const response = await doubaoClient.post('', {
        "model": DOBAO_MODEL,
        "input": [
          {
            "role": "user",
            "content": [
              {
                "type": "input_text",
                "text": prompt
              }
            ]
          }
        ]
      });

      const data = response.data;
      
      if (data && data.output && data.output.length > 0) {
        const messageOutput = data.output.find(item => item.type === 'message' && item.role === 'assistant');
        if (messageOutput && messageOutput.content && messageOutput.content.length > 0) {
          const textContent = messageOutput.content.find(item => item.type === 'output_text');
          if (textContent && textContent.text) {
            return textContent.text;
          }
        }
      }
      return '没有返回内容';
    } catch (error) {
      lastError = error;
      console.error(`Doubao API error (attempt ${attempt}/${MAX_RETRIES}):`, error.response?.data || error.message);
      
      if (attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export const doubaoService = {
  /**
   * 发送问题给AI并获取回答
   * @param {string} question - 用户问题
   * @param {string} context - 上下文信息
   * @returns {Object} - 包含answer的对象
   */
  async ask(question, context = '') {
    const prompt = context 
      ? `根据以下上下文回答问题：\n\n上下文：${context}\n\n问题：${question}`
      : question;

    const answer = await _callAPI(prompt);
    return { answer };
  },

  /**
   * 分析内容
   * @param {string} content - 要分析的内容
   * @param {string} analysisType - 分析类型：summary/keywords/sentiment
   * @returns {Object} - 包含answer的对象
   */
  async analyzeContent(content, analysisType = 'summary') {
    let prompt = '';
    switch (analysisType) {
      case 'summary':
        prompt = `请总结以下内容的核心要点：\n\n${content}`;
        break;
      case 'keywords':
        prompt = `请为以下内容提取5-10个关键词：\n\n${content}`;
        break;
      case 'sentiment':
        prompt = `请分析以下内容的情感倾向（正面/中性/负面），并给出理由：\n\n${content}`;
        break;
      default:
        prompt = `请分析以下内容：\n\n${content}`;
    }

    const answer = await _callAPI(prompt);
    return { answer };
  },

  /**
   * 流式回答（逐字输出）
   * @param {string} question - 用户问题
   * @param {string} context - 上下文信息
   * @returns {Generator} - 逐字返回回答内容
   */
  async *askStream(question, context = '') {
    try {
      const prompt = context 
        ? `根据以下上下文回答问题：\n\n上下文：${context}\n\n问题：${question}`
        : question;

      console.log('Doubao API stream request:', { prompt });

      const answer = await _callAPI(prompt);
      
      // 模拟流式输出，逐字返回
      for (let i = 0; i < answer.length; i++) {
        yield answer[i];
        // 根据字符类型调整延迟，中文稍快，英文和数字稍慢
        const char = answer[i];
        if (/[\u4e00-\u9fa5]/.test(char)) {
          await new Promise(resolve => setTimeout(resolve, 30)); // 中文字符
        } else if (/[a-zA-Z]/.test(char)) {
          await new Promise(resolve => setTimeout(resolve, 20)); // 英文字母
        } else if (/[0-9]/.test(char)) {
          await new Promise(resolve => setTimeout(resolve, 15)); // 数字
        } else {
          await new Promise(resolve => setTimeout(resolve, 40)); // 标点符号
        }
      }
      
    } catch (error) {
      console.error('Doubao API stream error:', error.response?.data || error.message);
      throw error;
    }
  }
};
