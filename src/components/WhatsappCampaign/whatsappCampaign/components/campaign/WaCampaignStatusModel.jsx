import React, { useState } from "react"
import { useGetCampaignStatusQuery } from "@/redux/apis/Templateapi"

const StatusBadge = ({ status }) => {
    const colors = {
        COMPLETED: "#16a34a",
        SENT: "#16a34a",
        FAILED: "#dc2626",
        PROCESSING: "#f59e0b"
    }

    const color = colors[status] || "#6b7280"

    return (
        <span style={{
            padding: "6px 12px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            background: `${color}15`,
            color
        }}>
            {status}
        </span>
    )
}

const KPI = ({ label, value }) => (
    <div style={{
        flex: 1,
        padding: 14,
        border: "1px solid var(--border)",
        borderRadius: 8,
        background: "#fafbfc"
    }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
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
const applyVariablesToTemplate = (template = "", variables = {}) => {
    return template.replace(/{{\s*(\d+)\s*}}/g, (_, number) => {
        const value = variables[`body_${number}`] || ""
        return `<strong>${value}</strong>`
    })
}

const renderWhatsappText = (text = "") => {
    return text
        .replace(/\*(.*?)\*/g, "<b>$1</b>")
        .replace(/_(.*?)_/g, "<i>$1</i>")
        .replace(/~(.*?)~/g, "<s>$1</s>")
        .replace(/```(.*?)```/g, "<code>$1</code>")
        .replace(/\n/g, "<br/>")
}

const CampaignStatusModal = ({ campaignId, onClose }) => {

    const [selectedRecipient, setSelectedRecipient] = useState(null)

    const {
        data: campaign,
        isLoading
    } = useGetCampaignStatusQuery(campaignId, {
        skip: !campaignId,
        pollingInterval: 5000,
    })

    if (!campaignId) return null
    if (isLoading) return null

    const progress = campaign.successRate || 0

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
        }}>

            <div style={{
                width: "95%",
                maxWidth: 1200,
                height: "85vh",
                background: "#fff",
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                overflow: "hidden"
            }}>

                {/* HEADER */}
                <div style={{
                    padding: "18px 24px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#fff",
                    position: "sticky",
                    top: 0,
                    zIndex: 10
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 18 }}>
                            {campaign.templateName}
                        </h3>

                        <div style={{
                            fontSize: 12,
                            color: "var(--text-muted)",
                            marginTop: 4
                        }}>
                            From: +{campaign.fromNumber} • Created:
                            {" "}
                            {new Date(campaign.createdAt).toLocaleString()}
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <StatusBadge status={campaign.status} />

                        <button
                            onClick={onClose}
                            style={{
                                border: "none",
                                background: "#f3f4f6",
                                padding: "6px 10px",
                                borderRadius: 6,
                                cursor: "pointer"
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* BODY */}
                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 24
                }}>

                    {/* KPI SECTION */}
                    <div style={{
                        display: "flex",
                        gap: 16
                    }}>
                        <KPI label="Total" value={campaign.totalCount} />
                        <KPI label="Sent" value={campaign.sentCount} />
                        <KPI label="Failed" value={campaign.failedCount} />
                        <KPI label="Success Rate" value={`${campaign.successRate}%`} />
                    </div>

                    {/* PROGRESS BAR */}
                    <div>
                        <div style={{
                            height: 8,
                            background: "#f1f5f9",
                            borderRadius: 8,
                            overflow: "hidden"
                        }}>
                            <div style={{
                                width: `${progress}%`,
                                height: "100%",
                                background: progress === 100 ? "#16a34a" : "var(--primary)",
                                transition: "0.3s ease"
                            }} />
                        </div>
                    </div>

                    {/* RECIPIENT TABLE */}
                    <div style={{
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        overflow: "hidden"
                    }}>
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: 12,
                            fontFamily: "'DM Sans', sans-serif"
                        }}>
                            <thead style={{ background: "#fafbfc" }}>
                                <tr>
                                    <th style={th}>Phone</th>
                                    <th style={th}>Name</th>
                                    <th style={th}>Status</th>
                                    <th style={th}>Link</th>
                                    <th style={th}>Error</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaign.recipients.map((r, i) => (
                                    <tr key={i} style={{
                                        borderTop: "1px solid var(--border)",
                                        background: i % 2 === 0 ? "#fff" : "#fafbfc"
                                    }}>
                                        <td style={td}>+{r.phone}</td>
                                        <td style={td}>{r.variables?.body_1}</td>
                                        <td style={td}>
                                            <StatusBadge status={r.status} />
                                        </td>

                                        <td style={td}>
                                            <button
                                                onClick={() => setSelectedRecipient(r)}
                                                style={{
                                                    border: "1px solid var(--border)",
                                                    background: "#fff",
                                                    padding: "4px 10px",
                                                    borderRadius: 6,
                                                    cursor: "pointer",
                                                    fontSize: 11
                                                }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>

            <RecipientDetailsModal
                recipient={selectedRecipient}
                campaign={campaign}
                onClose={() => setSelectedRecipient(null)}
            />
        </div>
    )
}

const th = {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: 11,
    color: "var(--text-muted)"
}

const td = {
    padding: "12px 16px"
}




export default CampaignStatusModal

const RecipientDetailsModal = ({ recipient, campaign, onClose }) => {
    if (!recipient) return null

    const templateBody = campaign?.templateId?.body || ""

    const finalMessage = applyVariablesToTemplate(
        templateBody,
        recipient.variables
    )

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000
        }}>
            <div style={{
                width: 380,
                borderRadius: 16,
                background: "#f0f2f5",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
            }}>

                {/* TOP HEADER (WhatsApp style) */}
                <div style={{
                    background: "#075e54",
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "#fff"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "#25d366",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600
                        }}>
                            {recipient.variables?.body_1?.charAt(0) || "U"}
                        </div>

                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>
                                +{recipient.phone}
                            </div>
                            {/* <div style={{
                                fontSize: 11,
                                opacity: 0.8
                            }}>
                                online
                            </div> */}
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 14, fontSize: 16 }}>
                        {/* <span style={{ cursor: "pointer" }}>📹</span>
                        <span style={{ cursor: "pointer" }}>📞</span>
                        <span style={{ cursor: "pointer" }}>⋮</span> */}
                        <span onClick={onClose} style={{ cursor: "pointer" }}>✕</span>
                    </div>
                </div>

                {/* CHAT AREA */}
                <div style={{
                    background: "#e5ddd5",
                    padding: 16,
                    minHeight: 320,
                    // backgroundImage:
                    //     "url('@/public/openLogo.png')",
                    backgroundSize: "cover",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end"
                }}>

                    <div style={{
                        background: "#dcf8c6",
                        padding: "10px 14px",
                        borderRadius: 8,
                        fontSize: 13,
                        lineHeight: 1.6,
                        maxWidth: "80%",
                        alignSelf: "flex-end",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.15)"
                    }}
                        dangerouslySetInnerHTML={{
                            __html: renderWhatsappText(finalMessage)
                        }}
                    />
                </div>

                {/* INPUT BAR */}

                {/* STATUS FOOTER */}
                <div style={{
                    padding: 12,
                    fontSize: 12,
                    background: "#ffffff",
                    borderTop: "1px solid #eee"
                }}>
                    <div className="" ><strong>Status:</strong><StatusBadge status={recipient.status} /></div>
                    <div className="my-4" ><strong>Error:</strong> <StatusBadge status={recipient.error || "-"} /></div>
                </div>

            </div>
        </div>
    )
}