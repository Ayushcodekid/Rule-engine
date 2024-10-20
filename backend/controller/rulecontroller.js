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
async function evaluateRule(ruleString, data) {
  const ast = await createRule(ruleString); // Create AST from the rule string

  if (ast.type === 'operator') {
    const leftResult = await evaluateRule(ast.left, data);
    const rightResult = await evaluateRule(ast.right, data);
    switch (ast.value) {
      case 'AND':
        return leftResult && rightResult;
      case 'OR':
        return leftResult || rightResult;
      default:
        return false;
    }
  } else {
    const [attribute, operator, value] = ast.value.split(' ');
    switch (operator) {
      case '>': return data[attribute] > Number(value);
      case '<': return data[attribute] < Number(value);
      case '=': return data[attribute] == value;
      case '!=': return data[attribute] != value;
      case '>=': return data[attribute] >= Number(value);
      case '<=': return data[attribute] <= Number(value);
      default: return false;
    }
  }
}

// Combine rules
async function combineRules(ruleStrings) {
  if (ruleStrings.length < 2) {
    throw new Error('At least two rules are required to combine.');
  }

  const combinedAST = {
    type: 'operator',
    value: 'AND',
    left: await createRule(ruleStrings[0]),
    right: await createRule(ruleStrings[1]),
  };

  return combinedAST;
}

module.exports = { createRule, evaluateRule, combineRules };
