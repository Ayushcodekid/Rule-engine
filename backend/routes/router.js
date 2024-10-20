

const express = require('express');
const router = express.Router();
const { Rule } = require('../models/rule');
const { createRule, combineRules } = require('../controller/rulecontroller');
const mongoose = require('mongoose');

// Create a new rule
router.post('/', async (req, res) => {
  try {
    const { name, ruleString } = req.body;
    const ast = await createRule(ruleString); // Create the AST
    const rule = new Rule({ name, ast }); // Save rule with AST
    const savedRule = await rule.save();
    res.status(201).json(savedRule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});










const evaluateRule = (ast, data) => {
  // Implement your AST evaluation logic here
  switch (ast.type) {
    case 'operand':
      return eval(ast.value.replace(/(\w+)/g, (match) => data[match]));
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






router.post('/evaluate', async (req, res) => {
  try {
    const { ruleId, dataArray } = req.body;

    // Fetch the rule from the database
    const rule = await Rule.findById(ruleId);
    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }

    // Check if dataArray is provided and is an array
    if (!Array.isArray(dataArray)) {
      return res.status(400).json({ message: 'Data array is required and should be an array.' });
    }

    // Check if all elements in dataArray are objects
    for (const data of dataArray) {
      if (typeof data !== 'object' || data === null) {
        return res.status(400).json({ message: 'Each data entry should be an object.' });
      }
    }

    // Log the entire fetched rule to check its structure
    console.log('Fetched rule:', rule);

    // Ensure that the AST is valid
    const ast = rule.ast;
    if (!ast) {
      return res.status(400).json({ message: 'Invalid rule format. Rule AST is required.' });
    }

    // Evaluate the rule for each data object
    const results = dataArray.map(data => {
      try {
        const result = evaluateRule(ast, data); // Ensure evaluateRule works with ast
        return {
          data,
          result: result !== undefined ? result : false,
        };
      } catch (error) {
        console.error('Error evaluating data:', error);
        return {
          data,
          result: false,
        };
      }
    });

    // Check if all results are true
    const allResults = results.every(r => r.result);

    // Respond with a single result indicating if all evaluations passed
    res.json({ result: allResults });

  } catch (error) {
    console.error('Error evaluating rule:', error);
    res.status(400).json({ result: false, message: 'Error during evaluation.' });
  }
});








// Get all rules
router.get('/getRules', async (req, res) => {
  try {
    const rules = await Rule.find(); // Fetch all rules from the database
    const ruleList = rules.map(rule => ({
      _id: rule._id, // Return _id and name
      name: rule.name,
    }));
    res.json(ruleList);
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch a specific rule by ObjectId
router.get('/:id', async (req, res) => {
  const ruleId = req.params.id;

  console.log('Fetching rule with ID:', ruleId);

  // Check if the provided ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(ruleId)) {
    return res.status(400).json({ message: 'Invalid Rule ID format' });
  }

  try {
    const rule = await Rule.findById(ruleId);

    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }

    res.json(rule);

  } catch (error) {
    console.error('Error fetching rule by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});






// Combine rules
router.post('/combine', async (req, res) => {
  const { ruleIds } = req.body;

  if (!Array.isArray(ruleIds) || ruleIds.length < 2) {
    return res.status(400).json({ message: 'At least two valid rule IDs are required.' });
  }

  try {
    const rules = await Rule.find({ _id: { $in: ruleIds } });
    if (rules.length !== ruleIds.length) {
      return res.status(404).json({ message: 'One or more rules not found.' });
    }

    const ruleStrings = rules.map(rule => rule.ast.value); // Extracting the rule strings
    const combinedAST = await combineRules(ruleStrings);
    
    const combinedRule = new Rule({
      ast: combinedAST,
      name: `Combined Rule: ${ruleIds.join(', ')}`, // Customize as needed
    });

    const savedRule = await combinedRule.save();
    res.json({ combinedRuleId: savedRule._id });
  } catch (error) {
    console.error('Error combining rules:', error);
    res.status(500).json({ message: 'An error occurred while combining rules.' });
  }
});





module.exports = router;
