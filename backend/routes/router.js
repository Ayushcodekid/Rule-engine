const express = require('express');
const router = express.Router();
const { Rule } = require('../models/rule');
const { createRule, evaluateRule, combineRules } = require('./controller/rulecontroller');

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

// Evaluate a rule
router.post('/evaluate', async (req, res) => {
  try {
    const { ruleString, dataArray } = req.body; // Accept ruleString instead of ruleId

    if (!ruleString) {
      return res.status(400).json({ message: 'ruleString is required.' });
    }

    // Create the AST from the ruleString
    const ast = await createRule(ruleString);

    // Check if dataArray is provided
    if (!dataArray) {
      return res.status(400).json({ message: 'dataArray is required.' });
    }

    // If dataArray is not an array, assume it's a single object and convert it into an array
    const dataInputs = Array.isArray(dataArray) ? dataArray : [dataArray];

    // Evaluate each data object
    const results = dataInputs.map(data => {
      try {
        const result = evaluateRule(ast, data); // Evaluate using AST
        return {
          data,
          result: result !== undefined ? result : false, // Ensure a result is returned
        };
      } catch (error) {
        console.error('Error evaluating data:', error);
        return {
          data,
          result: false, // Handle individual evaluation errors
        };
      }
    });

    // Check if all results are true
    const allResults = results.every(r => r.result);

    // Respond with a single result indicating if all evaluations passed, return true or false
    res.json({ result: allResults }); // Return true if all are true, false otherwise

  } catch (error) {
    console.error('Error evaluating rule:', error);
    res.status(400).json({ result: false }); // Send false on error
  }
});

// Combine rules
router.post('/combine', async (req, res) => {
  try {
    const { ruleStrings } = req.body; // Accept ruleStrings instead of ruleIds

    // Check if ruleStrings are provided
    if (!ruleStrings || ruleStrings.length < 2) {
      return res.status(400).json({ message: 'At least two ruleStrings are required to combine.' });
    }

    const combinedAST = await combineRules(ruleStrings);
    const combinedRule = new Rule({ name: 'Combined Rule', ast: combinedAST });
    const savedCombinedRule = await combinedRule.save();

    res.json({ combinedRuleId: savedCombinedRule._id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all rules
router.get('/', async (req, res) => {
  try {
    const rules = await Rule.find(); // Fetch all rules from the database
    const ruleList = rules.map(rule => ({
      name: rule.name, // Only return the name
    }));
    res.json(ruleList);
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
