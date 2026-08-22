import { useState } from "react";
import { ContextQA } from "./ContextQA";

export default function App() {
  const [activeTab, setActiveTab] = useState<"qa" | "other">("qa");

  return (
    <div style={{ width: "360px", padding: "12px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "bold" }}>AI Browser Assistant</h3>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("qa")}
          style={{
            flex: 1,
            padding: "8px",
            border: "none",
            background: "none",
            cursor: "pointer",
            fontWeight: activeTab === "qa" ? "bold" : "normal",
            borderBottom: activeTab === "qa" ? "2px solid #2563eb" : "none",
            color: activeTab === "qa" ? "#2563eb" : "#64748b",
            fontSize: "12px",
          }}
        >
          Context Q&A
        </button>
      </div>

      {activeTab === "qa" && <ContextQA />}
    </div>
  );
}