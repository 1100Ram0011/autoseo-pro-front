import React from "react"

const Msg91SkeletonRow = ({ colSpan }) => (
    <tr>
        <td colSpan={colSpan}
            style={{
                padding: 16,
                borderBottom: "1px solid var(--border)"
            }}>
            <div style={{
                height: 12,
                background: "#e5e7eb",
                borderRadius: 4,
                width: "100%",
                animation: "pulse 1.5s infinite"
            }} />
        </td>
    </tr>
)

export default Msg91SkeletonRow