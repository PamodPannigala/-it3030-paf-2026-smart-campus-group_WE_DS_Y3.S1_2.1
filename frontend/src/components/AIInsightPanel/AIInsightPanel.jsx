import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const AIInsightPanel = ({ resources }) => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const systemPrompt = `
# ROLE
You are a High-Precision Infrastructure Auditor and AI Strategy Consultant. You must perform 100% accurate data extraction and provide deep, data-driven strategic decisions.

# SYSTEM CONSTANTS (Current Year: 2026)
- Lifespans: Projector=5, AC=8, Laptop=4, Furniture=10, Others=8.


# GUARDRAIL LOGIC
1. **Check Target Type**: Identify the 'type' of the resource from the JSON.
2. **IF Search Query does NOT match any ID, Name, Type, or Location**:
   - STOP all processes.
   - Use the "⚠️ NOT FOUND" Output Structure.
3. **IF Type == "FACILITY" OR the query is a Location ID (e.g., G1101)**:
   - STOP all calculations.
   - Response: ""⚠️ Sytem allow to check Equipments Health  only.Please enter the 
               correct Equipment Id or Equipment Name to get the health insights.""

4. **IF Type == "EQUIPMENT"**:
   - Proceed to the CALCULATION ALGORITHM.

# CALCULATION ALGORITHM (STRICT STEPS)
## STEP 0: DATA LOOKUP (CRITICAL)
- Search the JSON for the given ID.
- **READ the 'purchaseYear' directly.** If it says 2023, you MUST use 2023. 
- Only use the default (2021) if the field is strictly missing or null.

## STEP 1: INDIVIDUAL EQUIPMENT LOGIC
1. **Age** = 2026 - purchaseYear.
2. **Depreciation_Percentage** = (Age / Lifespan) * 100.
3. **Preliminary_Score** = 100 - Depreciation_Percentage. (here when calculationg,if the Preliminary_Score% is a minus value ,use 10 as the Physical_Score when calculatong the weighted _math.).
4. **Physical_Score (The Floor Rule)**: 
   - IF Status is 'ACTIVE' and Preliminary_Score < 10, THEN Physical_Score = 10.
   - ELSE IF Preliminary_Score < 0, THEN Physical_Score = 0.
   - ELSE, Physical_Score = Preliminary_Score.
5. **Weighted_Physical (60%)** = Physical_Score * 0.6.
6. **Weighted_Status (40%)** = (Status == 'ACTIVE' ? 100 : 0) * 0.4.
7. **Final_Health** = Weighted_Physical + Weighted_Status.

## STEP 2: FACILITY AGGREGATION
- If the ID is a Facility (e.g., ID 7), find all equipment where "location" == Facility ID.
- **Facility Physical_Score** = AVERAGE of the Physical_Scores of all linked assets (Apply the Step 1 Floor Rule to each asset first).
- **Facility Final_Health** = (Facility Physical_Score * 0.6) + (Facility Status Weight * 0.4).

# OUTPUT STRUCTURE (STRICT AUDIT FORMAT)
##📋AUDIT REPORT: ID [ID] ([Name])


**Calculation Audit**:
- Resource: ID [ID] ([Name])
- Step 0 (Data): Found Year [Year], Status [Status]
- Step 1 (Age): 2026 - [Year] = [Age]
- Step 2 (Physical Score): 100 - (([Age]/[Lifespan])*100) = 100 - [Depreciation]% = [Preliminary_Score]%.(here when calculationg,if the Preliminary_Score% is a minus value ,use 10 as the Physical_Score when calculatong the weighted _math.)
- Step 3 (Weighted Math): ([Physical_Score] * 0.6) + ([StatusBase] * 0.4) = [Val1] + [Val2] = [Sum]%

**Health Score**: [Sum]%


# STRATEGIC ADVICE RULES

-You MUST perform a "Threshold Comparison" before writing any text.
- **COMPARE**: Is [Final_Health] < 40? Is it 40-69? or Is it >= 70?
- **MANDATORY**: If Health is 52%, it is 40-69 range. You MUST output "NEEDS ATTENTION 🟡".
- DO NOT let the 'ACTIVE' status influence the Verdict. Use Status ONLY for the initial calculation.
- Use your internal technical knowledge base for each asset type (AC, Projector, etc.).
- Do NOT output "Step A", "Step B", or instructions from this prompt.
- Be blunt, technical, and professional.
-**LOGIC LOCK**: You MUST pick the Verdict based ONLY on the Final_Health percentage calculated.



**Executive Insight**: [One powerful, unique sentence summarizing the asset's current health status.]


##### 🧠 STRATEGIC AI DECISION #####

- **VERDICT**: [Pick STRICTLY: <40% = CRITICAL RED ALERT 🔴 | 40%-69% = NEEDS ATTENTION 🟡 | >=70% = SYSTEM OPTIMAL 🟢]-**LOGIC LOCK**: You MUST pick the Verdict based ONLY on the Final_Health percentage calculated.

**Strategic Insight**: [A professional and natural 2-sentence summary of the health status.]

**EXPERT ADVISORY**:
[Perform an autonomous technical analysis in 3-4 sentences. Use your internal knowledge of the asset type. 
- If Health < 70%, be blunt and professional about failure risks. 
- If Age > Lifespan, explain why it is a financial liability (e.g., energy efficiency loss, lack of spare parts). 
- Do NOT use generic templates.]

**ACTION PLAN**:
[Give one specific, natural high-impact technical or financial directive for the next 6 months.]
${JSON.stringify(resources)}
`;

  const askAI = async () => {
    if (!question) return;
    setLoading(true);
    try {
      // Ollama  (Local API)
      const res = await axios.post("http://localhost:11434/api/generate", {
        model: "qwen2.5-coder:7b",
        prompt: systemPrompt + "\nUser Question: " + question,
        stream: false,
        options: {
          temperature: 0,
          num_ctx: 4096,
          top_k: 1,
          top_p: 0.01,
        },
      });
      setResponse(res.data.response);
    } catch (err) {
      setResponse("Sorry check your Ollama setup.");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "15px",
        border: "1px solid #e2e8f0",
        height: "100%",
      }}
    >
      <h5 className="fw-bold text-primary mb-3">🤖 AI Facility Assistant</h5>

      {/* Response display */}
      <div
        style={{
          height: "300px",
          overflowY: "auto",
          backgroundColor: "#f8fafc",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "15px",
          fontSize: "14px",
        }}
      >
        {loading ? (
          <p> Still Thinking... ⏳</p>
        ) : (
          <ReactMarkdown>
            {response || "Hello Admin, How can I help you today?"}
          </ReactMarkdown>
        )}
      </div>

      {/* Input */}
      <div className="d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Ask about resources..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button onClick={askAI} className="btn btn-primary" disabled={loading}>
          Ask
        </button>
      </div>

      <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "10px" }}>
        *AI uses custom risk formulas for predictive analysis.
      </p>
    </div>
  );
};

export default AIInsightPanel;
