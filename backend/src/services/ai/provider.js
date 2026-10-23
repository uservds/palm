/**
 * AI Provider contract (JSDoc, no TypeScript).
 *
 * @typedef {Object} AnalyzeParams
 * @property {string} imageBase64
 * @property {string} mimeType
 * @property {string} prompt
 * @property {Object|null} knowledgeBase
 *
 * @typedef {Object} AIProvider
 * @property {string} name
 * @property {(params: AnalyzeParams) => Promise<Object>} analyze
 */