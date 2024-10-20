// const mongoose = require('mongoose');

// const NodeSchema = new mongoose.Schema({
//   type: String,
//   value: mongoose.Schema.Types.Mixed,
//   left: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' },
//   right: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' }
// });

// const RuleSchema = new mongoose.Schema({
//   name: String,
//   rootNode: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' }
// });

// const Node = mongoose.model('Node', NodeSchema);
// const Rule = mongoose.model('Rule', RuleSchema);

// module.exports = { Node, Rule };















const mongoose = require('mongoose');

// Define the schema for the AST tree
const NodeSchema = new mongoose.Schema({
  type: { type: String, required: true }, // Type of the node: 'operator' or 'operand'
  value: mongoose.Schema.Types.Mixed, // Value for the node (e.g., condition)
  left: { type: mongoose.Schema.Types.Mixed }, // Reference to left child or sub-node
  right: { type: mongoose.Schema.Types.Mixed }, // Reference to right child or sub-node
});

// Main Rule schema that includes the AST as a sub-document
const RuleSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the rule
  ast: { type: NodeSchema, required: true }, // The entire AST
  createdAt: { type: Date, default: Date.now }, // Timestamp of creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of update
});

// Exporting models and specify the collection name
const Rule = mongoose.model('Rule', RuleSchema, 'ast_tree'); // Use 'ast_tree' collection
module.exports = { Rule };
