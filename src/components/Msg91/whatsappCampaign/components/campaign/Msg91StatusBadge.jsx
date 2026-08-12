import React from "react"

const Msg91StatusBadge = ({ status }) => {

    const colors = {
        COMPLETED: "#22c55e",
        SENT: "#22c55e",
        FAILED: "#ef4444",
        PROCESSING: "#f59e0b"
    }

    const color = colors[status] || "#6b7280"

    return (
        <span style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "6px 12px",
            borderRadius: 20,
            background: `${color}15`,
            color
        }}>
            {status}
        </span>
    )
}

export default Msg91StatusBadge