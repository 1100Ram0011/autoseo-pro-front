import React from "react"
import CampaignRow from "../WaCampaignRow"

const CampaignTable = ({ campaigns = [], loading, onView }) => {

    const headers = [
        "Template",
        "From",
        "Volume",
        "Performance",
        "Status",
        "Created",
        "Actions"
    ]

    return (
        <div style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #eef1f5"
        }}>

            <div style={{ overflowX: "auto", flex: 1 }}>
                <table style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif"
                }}>

                    {/* HEADER */}
                    <thead>
                        <tr style={{
                            background: "#f8fafc",
                            borderBottom: "1px solid #eef1f5"
                        }}>
                            {headers.map(h => (
                                <th key={h}
                                    style={{
                                        padding: "14px 20px",
                                        textAlign: "left",
                                        fontWeight: 600,
                                        color: "#64748b",
                                        fontSize: 11,
                                        letterSpacing: "0.04em",
                                        textTransform: "uppercase",
                                        position: "sticky",
                                        top: 0,
                                        background: "#f8fafc",
                                        zIndex: 5
                                    }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>

                        {loading && (
                            <tr>
                                <td colSpan={7} style={{
                                    padding: 40,
                                    textAlign: "center",
                                    color: "#94a3b8"
                                }}>
                                    Loading campaigns...
                                </td>
                            </tr>
                        )}

                        {!loading && campaigns.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{
                                    padding: 60,
                                    textAlign: "center",
                                    color: "#94a3b8"
                                }}>
                                    No campaigns found
                                </td>
                            </tr>
                        )}

                        {!loading && campaigns.map((c, i) => (
                            <CampaignRow
                                key={c._id}
                                campaign={c}
                                even={i % 2 === 0}
                                onView={() => onView(c)}
                            />
                        ))}

                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CampaignTable