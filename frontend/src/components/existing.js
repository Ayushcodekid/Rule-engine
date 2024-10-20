import React, { useState } from 'react';
import axios from 'axios';
import './existing.css'; // Import the CSS file

const CombineRules = () => {
  const [ruleIds, setRuleIds] = useState('');
  const [combinedRuleId, setCombinedRuleId] = useState('');

  const handleCombine = async (e) => {
    e.preventDefault();
    const idsArray = ruleIds.split(',').map(id => id.trim());
    try {
      const response = await axios.post('http://localhost:5000/api/rules/combine', {
        ruleIds: idsArray,
      });
      setCombinedRuleId(response.data.combinedRuleId);
      console.log('Combined Rule ID:', response.data.combinedRuleId);
    } catch (error) {
      console.error('Error combining rules:', error.response.data);
    }
  };

  const handleReset = () => {
    setRuleIds('');
    setCombinedRuleId(''); // Reset combined rule ID when resetting form
  };

  return (
    <div className="combine-rules-container">
      <form className="combine-rules-form" onSubmit={handleCombine}>
        <h2>Combine Rules</h2>
        <input
          type="text"
          placeholder="Rule IDs (comma-separated)"
          value={ruleIds}
          onChange={(e) => setRuleIds(e.target.value)}
          required
          className="input-field"
        />
        <div className="button-container">
          <button type="submit" className="combine-button">Combine Rules</button>
          <button type="button" className="reset-button" onClick={handleReset}>Reset</button>
        </div>
        {combinedRuleId && <p className="result-message">Combined Rule ID: {combinedRuleId}</p>}
      </form>
    </div>
  );
};

export default CombineRules;