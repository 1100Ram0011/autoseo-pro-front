import React from "react"
import StatusBadge from "./StatusBadge"

const Msg91RecipientRow = ({ r, even }) => {

    return (
        <tr style={{
            borderBottom: "1px solid var(--border)",
            background: even ? "#fff" : "#fafbfc"
        }}>
            <td style={{ padding: "10px 16px" }}>
                +{r.phone}
            </td>

            <td style={{ padding: "10px 16px" }}>
                <StatusBadge status={r.status} />
            </td>

            <td style={{ padding: "10px 16px" }}>
                <pre style={{
                    margin: 0,
                    fontSize: 11,
                    background: "#f5f7fa",
                    padding: 6,
                    borderRadius: 4,
                    overflowX: "auto"
                }}>
                    {JSON.stringify(r.variables, null, 2)}
                </pre>
            </td>

            <td style={{
                padding: "10px 16px",
                color: "#ef4444"
            }}>
                {r.error || "-"}
            </td>
        </tr>
    )
}

export default Msg91RecipientRow