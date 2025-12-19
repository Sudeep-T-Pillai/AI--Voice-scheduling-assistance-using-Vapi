"use client";
import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";

const vapi = new Vapi("1591b790-8d76-4700-99f2-b84164a51542"); // GET THIS FROM VAPI DASHBOARD

export default function Home() {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);
    });
    vapi.on("call-end", () => {
      setConnecting(false);
      setConnected(false);
    });
    return () => {
      vapi.removeAllListeners();
    };
  }, []);

  const startCall = () => {
    setConnecting(true);
    // Replace with your Assistant ID from Vapi Dashboard
    vapi.start("8ebfb780-3a27-4677-bb0b-ac86bf4fdc94");
  };

  const endCall = () => {
    vapi.stop();
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", background: "#f0f2f5" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", textAlign: "center" }}>
        <h1 style={{ marginBottom: "20px" }}>Vikara AI Scheduling Assistant</h1>
        <p style={{ marginBottom: "30px", color: "#666" }}>Click below to schedule your meeting.</p>
        
        {!connected ? (
          <button 
            onClick={startCall} 
            disabled={connecting}
            style={{ padding: "12px 24px", fontSize: "16px", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", opacity: connecting ? 0.7 : 1 }}
          >
            {connecting ? "Connecting..." : "Start Conversation"}
          </button>
        ) : (
          <button 
            onClick={endCall}
            style={{ padding: "12px 24px", fontSize: "16px", background: "#dc2626", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            End Call
          </button>
        )}
      </div>
    </div>
  );
}
