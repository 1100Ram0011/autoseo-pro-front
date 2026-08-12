import React from "react"
import KPI from "./KPI"
import StatusBadge from "./StatusBadge"

const CampaignSummary = ({ campaign, loading }) => {

    if (loading) {
        return (
            <div style={{ padding: 20 }}>
                Loading campaign summary...
            </div>
        )
    }

    if (!campaign) return null

    const successRate = campaign.totalCount
        ? Math.round((campaign.sentCount / campaign.totalCount) * 100)
        : 0

    return (
        <div style={{
            padding: 20,
            borderBottom: "1px solid var(--border)",
            fontFamily: "'DM Sans', sans-serif"
        }}>
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div>
                    <h3 style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 600
                    }}>
                        {campaign.templateName}
                    </h3>

                    <div style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginTop: 4
                    }}>
                        From: +{campaign.fromNumber}
                    </div>
                </div>

                <StatusBadge status={campaign.status} />
            </div>

            {/* KPI Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
                marginTop: 20
            }}>
                <KPI label="Total" value={campaign.totalCount} />
                <KPI label="Sent" value={campaign.sentCount} />
                <KPI label="Failed" value={campaign.failedCount} />
                <KPI label="Success Rate" value={`${successRate}%`} />
            </div>

            {/* Progress */}
            <div style={{ marginTop: 16 }}>
                <div style={{
                    height: 6,
                    background: "#f0f2f5",
                    borderRadius: 6,
                    overflow: "hidden"
                }}>
                    <div style={{
                        width: `${successRate}%`,
                        height: "100%",
                        background: "var(--primary)",
                        transition: "0.3s ease"
                    }} />
                </div>
            </div>

            {/* Time */}
            <div style={{
                marginTop: 12,
                fontSize: 11,
                color: "var(--text-muted)"
            }}>
                Created: {new Date(campaign.createdAt).toLocaleString()} |
                Completed: {campaign.completedAt
                    ? new Date(campaign.completedAt).toLocaleString()
                    : "-"}
            </div>
        </div>
    )
}

export default CampaignSummary