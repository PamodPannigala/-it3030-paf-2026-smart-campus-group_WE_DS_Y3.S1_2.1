import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./AIInsightPanel.css";

const AIInsightPanel = ({ resources }) => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); //panel open close state

  const systemPrompt = `
# ROLE
You are a High-Precision Infrastructure Auditor and AI Strategy Consultant. You must perform 100% accurate data extraction and provide deep, data-driven strategic decisions.

# SYSTEM CONSTANTS (Current Year: 2026)
- Lifespans: Projector=5, AC=8, Laptop=4, Furniture=10, Others=8.


# ANALYSIS LOGIC (SMART FILTER)
1. **Data Discovery**: First, look through the provided JSON to find the resource the user is asking about (Match by ID or Name).
2. **Identification**: 
   - IF the resource is **EQUIPMENT**: Proceed immediately to the CALCULATION ALGORITHM.
   - IF the resource is a **FACILITY or LOCATION**: Stop and politely explain that you can only provide health insights for specific equipment.
   - IF NO match is found at all: Provide the "⚠️ NOT FOUND" report.

4. **IF Type == "EQUIPMENT"**:
   - Proceed to the CALCULATION ALGORITHM.

5. **IF Type == "FACILITY"**:
   - Stop and politely explain that you can only provide health insights for specific equipment.

# CALCULATION ALGORITHM (STRICT STEPS)
## STEP 0: DATA LOOKUP (CRITICAL)
- Search the JSON for the given ID  for type is "EQUIPMENTs" only.
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
      const res = await axios.post("http://localhost:11434/api/generate", {
        model: "qwen2.5-coder:7b",
        prompt: systemPrompt + "\nUser Question: " + question,
        stream: false,
        options: { temperature: 0, num_ctx: 4096, top_k: 1, top_p: 0.01 },
      });
      setResponse(res.data.response);
    } catch (err) {
      setResponse("⚠️ Sorry, please check your Ollama setup.");
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="ai-fab" onClick={() => setIsOpen(true)}>
          <i className="bi bi-robot fs-3 text-white"></i>
        </div>
      )}

      {/* Floating AI Panel */}
      {isOpen && (
        <div className="ai-floating-card">
          {/* Header */}
          <div className="ai-card-header">
            <span className="fw-bold">
              <i className="bi bi-stars"></i> AI EQUIPMENT Health Checker
            </span>
            <button
              className="btn btn-sm text-white"
              onClick={() => setIsOpen(false)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Body (Response Area) */}
          <div className="ai-card-body">
            {loading ? (
              <div className="text-center mt-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                ></div>
                <p className="mt-2 text-muted">
                  Analyzing Infrastructure... ⏳
                </p>
              </div>
            ) : (
              <div className="ai-response-text">
                <ReactMarkdown>
                  {response ||
                    "👋 Hello Admin! Ask me anything about your equipment health."}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* (Input Area) */}
          <div className="ai-card-footer">
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Analyze ID6 health..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && askAI()}
              />
              <button
                onClick={askAI}
                className="btn btn-primary btn-sm"
                disabled={loading}
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
            <p
              style={{
                fontSize: "10px",
                color: "#94a3b8",
                textAlign: "center",
                margin: 0,
              }}
            >
              *AI uses custom risk formulas for predictive analysis.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIInsightPanel;
