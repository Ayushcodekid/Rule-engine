const { Rule } = require('../models/rule');

// Function to create the AST
async function createRule(ruleString) {
  const tokens = ruleString.match(/(\w+|\S)/g);
  let index = 0;

  async function parseExpression() {
    if (tokens[index] === '(') {
      index++; // Skip '('
      const left = await parseExpression();  // Parse left expression
      const operator = tokens[index++];      // Parse operator
      const right = await parseExpression(); // Parse right expression
      index++; // Skip ')'

      // Create an operator node
      return {
        type: 'operator',
        value: operator,
        left: left,
        right: right
      };
    } else {
      const value = tokens[index++];     // Left operand
      const operator = tokens[index++];  // Operator
      const right = tokens[index++];     // Right operand
      return {
        type: 'operand',
        value: `${value} ${operator} ${right}`
      };
    }
  }

  try {
    const rootNode = await parseExpression();
    return rootNode;
  } catch (error) {
    console.error('Error creating rule:', error.message);
    throw error;
  }
}

// Function to evaluate the rule against given data
// Function to combine multiple rules into one AST
async function combineRules(ruleStrings) {
  if (ruleStrings.length < 2) {
    throw new Error('At least two rules are required to combine.');
  }

  const asts = await Promise.all(ruleStrings.map(ruleString => createRule(ruleString)));

  const combinedAST = {
    type: 'composite',
    operator: 'AND', // Can be modified as needed
    children: asts, // Array of ASTs
  };

  return combinedAST;
}

// Function to evaluate a rule against data
const evaluateRule = (ast, data) => {
  switch (ast.type) {
    case 'operand':
      return eval(ast.value.replace(/(\w+)/g, (match) => data[match])); // Simplified example
    case 'composite':
      if (ast.operator === 'AND') {
        return ast.children.every(child => evaluateRule(child, data));
      } else if (ast.operator === 'OR') {
        return ast.children.some(child => evaluateRule(child, data));
      }
      break;
    default:
      throw new Error('Unknown AST node type');
  }
};

module.exports = { createRule, evaluateRule, combineRules };
