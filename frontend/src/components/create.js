import React, { useState } from 'react';
import axios from 'axios';
import './create.css'

const CreateRule = () => {
  const [name, setName] = useState('');
  const [ruleString, setRuleString] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/rules', {
        name,
        ruleString,
      });
      console.log('Rule created:', response.data);
      // Reset form fields after successful submission
      setName('');
      setRuleString('');
    } catch (error) {
      console.error('Error creating rule:', error.response.data);
    }
  };

  const handleReset = () => {
    setName('');
    setRuleString('');
  };

  return (
    <div className="create-rule-container">
      <form className="create-rule-form" onSubmit={handleSubmit}>
        <h2>Create Rule</h2>
        <input
          type="text"
          placeholder="Rule Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input-field"
        />
        <textarea
          placeholder="Rule String"
          value={ruleString}
          onChange={(e) => setRuleString(e.target.value)}
          required
          className="textarea-field"
        />
        <div className="button-container">
          <button type="submit" className="submit-button">Create Rule</button>
          <button type="button" className="reset-button" onClick={handleReset}>Reset</button>
        </div>
      </form>
    </div>
  );
};

export default CreateRule;