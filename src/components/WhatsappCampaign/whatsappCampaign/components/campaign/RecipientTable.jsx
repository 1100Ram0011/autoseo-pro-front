import React from "react"
import RecipientRow from "./RecipientRow"
import SkeletonRow from "./SkeletonRow"

const RecipientTable = ({ recipients, loading }) => {

    const headers = [
        "Phone",
        "Status",
        "Variables",
        "Error"
    ]

    return (
        <div style={{ overflowX: "auto", flex: 1 }}>
            <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
                fontFamily: "'DM Sans', sans-serif"
            }}>
                <thead>
                    <tr style={{
                        background: "#fafbfc",
                        borderBottom: "2px solid var(--border)"
                    }}>
                        {headers.map(h => (
                            <th key={h}
                                style={{
                                    padding: "10px 16px",
                                    textAlign: "left",
                                    fontWeight: 600,
                                    color: "var(--text-muted)",
                                    fontSize: 11,
                                    whiteSpace: "nowrap"
                                }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {loading
                        ? Array.from({ length: 5 })
                            .map((_, i) => <SkeletonRow key={i} colSpan={4} />)
                        : recipients.map((r, i) =>
                            <RecipientRow key={i} r={r} even={i % 2 === 0} />
                        )
                    }
                </tbody>
            </table>
        </div>
    )
}

export default RecipientTable