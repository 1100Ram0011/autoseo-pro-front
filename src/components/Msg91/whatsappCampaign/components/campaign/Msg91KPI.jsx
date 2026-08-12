import React from "react"

const Msg91KPI = ({ label, value }) => (
    <div style={{
        padding: 12,
        border: "1px solid var(--border)",
        borderRadius: 6,
        background: "#fafbfc"
    }}>
        <div style={{
            fontSize: 11,
            color: "var(--text-muted)"
        }}>
            {label}
        </div>

        <div style={{
            fontSize: 18,
            fontWeight: 600,
            marginTop: 4
        }}>
            {value}
        </div>
    </div>
)

export default Msg91KPI