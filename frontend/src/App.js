import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';
import CreateRule from './components/create';
import EvaluateRule from './components/evaluate';
import CombineRules from './components/existing'; // Adjusted component import
import './App.css'; // If you have styles here

function App() {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/rules');
      setRules(response.data);
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  const handleRuleCreated = () => {
    fetchRules(); // Refresh the rules after a new rule is created
  };

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Rule Engine</h1>
          <nav className="app-nav">
            <Link to="/create-rule">Create Rule</Link>
            <Link to="/evaluate-rule">Evaluate Rule</Link>
            <Link to="/combine-rules">Combine Rules</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/create-rule" element={<CreateRule onRuleCreated={handleRuleCreated} />} />
            <Route path="/evaluate-rule" element={<EvaluateRule rules={rules} />} />
            <Route path="/combine-rules" element={<CombineRules rules={rules} />} /> {/* Pass rules to CombineRules */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
