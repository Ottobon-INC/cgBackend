import fetch from 'node-fetch';

async function test() {
    try {
        const res = await fetch('http://localhost:8500/api/components', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "Scorecard",
                description: "A comprehensive scorecard component that displays interview analysis, scores, transcript, and expert feedback.\n\n**Dependencies:** React, framer-motion, lucide-react, ../../api/mockInterviewApi",
                raw_code: "import React from 'react';\nimport { motion } from 'framer-motion';\nimport { CheckCircle2, AlertCircle, MessageSquare, Briefcase, Star, Zap, User } from 'lucide-react';\nimport { requestExpertReview } from '../../api/mockInterviewApi';\n\nconst Scorecard = ({ interview, onUpdate }) => {\n  const { ai_scorecard, status, id, transcript, expert_feedback } = interview;\n\n  const getScoreColor = (score) => {\n    if (score >= 8) return 'bg-black text-white';\n    if (score >= 6) return 'bg-gray-200 text-black';\n    return 'bg-gray-100 text-black opacity-60';\n  };\n\n  const handleRequestReview = async () => {\n    try {\n      await requestExpertReview(id);\n      if (onUpdate) onUpdate();\n    } catch (err) {\n      console.error(\"Failed to request review\", err);\n    }\n  };\n\n  return (\n    <motion.div \n      initial={{ opacity: 0, y: 20 }}\n      animate={{ opacity: 1, y: 0 }}\n      className=\"bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden\"\n    >\n      ...rest of the huge component...\n    </motion.div>\n  );\n};\nexport default Scorecard;",
                author_id: "3a18cdbe-abc4-404e-89a1-77ec14b986cf",
                stack: "vite-react-ts",
                category: "component"
            })
        });
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Body:', text);
    } catch(err) {
        console.error('Fetch failed:', err);
    }
}
test();
