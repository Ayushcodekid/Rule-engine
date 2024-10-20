import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './evaluate.css';

const EvaluateRule = () => {
  const [rules, setRules] = useState([]);
  const [ruleId, setRuleId] = useState('');
  const [ruleString, setRuleString] = useState('');
  const [data, setData] = useState('');
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/rules');
        setRules(response.data);
      } catch (error) {
        console.error('Error fetching rules:', error);
      }
    };
    fetchRules();
  }, []);

  const fetchRuleString = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/rules/${id}`);
      setRuleString(response.data.ast);
    } catch (error) {
      console.error('Error fetching rule string:', error);
      setRuleString('');
    }
  };

  useEffect(() => {
    if (ruleId) {
      fetchRuleString(ruleId);
    } else {
      setRuleString('');
    }
  }, [ruleId]);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setResults(null);

    try {
      const parsedDataArray = JSON.parse(data);
      const response = await axios.post('http://localhost:5000/api/rules/evaluate', {
        ruleId,
        dataArray: parsedDataArray,
      });
      setResults(response.data.result); // Assuming your backend returns { result: true/false }
    } catch (error) {
      console.error('Error evaluating rule:', error.response ? error.response.data : error.message);
      setErrorMessage(error.response ? error.response.data.message : 'An error occurred while evaluating the rule.');
      setResults(null);
    }
  };

  return (
    <div className="evaluate-rule-container">
      <form className="evaluate-rule-form" onSubmit={handleEvaluate}>
        <h2>Evaluate Rule</h2>
        <select value={ruleId} onChange={(e) => setRuleId(e.target.value)} required>
          <option value="">Select Rule</option>
          {rules.map(rule => (
            <option key={rule._id} value={rule._id}>{rule.name}</option>
          ))}
        </select>

        {ruleString && (
          <div className="rule-string-container">
            <h3>Rule String:</h3>
            <p>{ruleString}</p>
          </div>
        )}

        <textarea
          placeholder='Data (JSON array format)'
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
          className="textarea-field"
        />
        <button type="submit" className="submit-button">Evaluate Rule</button>
      </form>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {results !== null && (
        <div className="results-container">
          <p className="overall-result-message">
            Overall Evaluation Result: {results ? 'True' : 'False'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EvaluateRule;
