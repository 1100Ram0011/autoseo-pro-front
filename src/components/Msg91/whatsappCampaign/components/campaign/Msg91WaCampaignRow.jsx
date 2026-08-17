import React from "react"

const StatusBadge = ({ status }) => {

    const styles = {
        COMPLETED: { bg: "#dcfce7", color: "#15803d" },
        PROCESSING: { bg: "#fef3c7", color: "#b45309" },
        FAILEDsss: { bg: "#fee2e2", color: "#b91c1c" },
        SENT: { bg: "#dcfce7", color: "#15803d" },
    }

    const s = styles[status] || { bg: "#e2e8f0", color: "#475569" }

    return (
        <span style={{
            padding: "5px 12px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            background: s.bg,
            color: s.color
        }}>
            {status}
        </span>
    )
}

const Msg91WaCampaignRow = ({ campaign, onView }) => {

    const success = campaign.successRate || 0

    return (
        <tr
            style={{
                transition: "all 0.2s ease",
                borderBottom: "1px solid #f1f5f9",
                cursor: "pointer"
            }}
            onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f8fafc")
            }
            onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#fff")
            }
        >

            {/* TEMPLATE */}
            <td style={{ padding: "18px 20px" }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {campaign.templateName}
                </div>
            </td>

            {/* FROM */}
            <td style={{ padding: "18px 20px", color: "#475569" }}>
                +{campaign.fromNumber}
            </td>

            {/* VOLUME */}
            <td style={{ padding: "18px 20px" }}>
                <div style={{ fontWeight: 600 }}>
                    {campaign.totalCount}
                </div>
                <div style={{
                    fontSize: 11,
                    color: "#94a3b8"
                }}>
                    Sent: {campaign.sentCount} • Failed: {campaign.failedCount}
                </div>
            </td>

            {/* PERFORMANCE */}
            <td style={{ padding: "18px 20px", width: 180 }}>
                <div style={{ fontSize: 12, marginBottom: 6 }}>
                    {success}%
                </div>
                <div style={{
                    height: 6,
                    background: "#e2e8f0",
                    borderRadius: 6,
                    overflow: "hidden"
                }}>
                    <div style={{
                        width: `${success}%`,
                        height: "100%",
                        background: success === 100
                            ? "#22c55e"
                            : "#3b82f6",
                        transition: "0.3s ease"
                    }} />
                </div>
            </td>

            {/* STATUS */}
            <td style={{ padding: "18px 20px" }}>
                <StatusBadge status={campaign.status} />
            </td>

            {/* CREATED */}
            <td style={{
                padding: "18px 20px",
                fontSize: 12,
                color: "#64748b"
            }}>
                {new Date(campaign.createdAt).toLocaleString()}
            </td>

            {/* ACTION */}
            <td style={{ padding: "18px 20px" }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onView()
                    }}
                    style={{
                        background: "#111827",
                        color: "#fff",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        cursor: "pointer",
                        transition: "0.2s ease"
                    }}
                >
                    View Details
                </button>
            </td>

        </tr>
    )
}

export default Msg91WaCampaignRow
