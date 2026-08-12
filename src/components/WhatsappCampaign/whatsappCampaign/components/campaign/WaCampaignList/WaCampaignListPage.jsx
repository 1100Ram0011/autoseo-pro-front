import React, { useEffect, useState } from "react"
import axios from "axios"
import CampaignTable from "../WaCampaignList/WaCampaignTable.jsx"
import { useGetAllCampaignsQuery } from "@/redux/apis/Templateapi.js"
import CampaignStatusPage from "../WaCampaignStatusModel.jsx"

const WaCampaignListPage = () => {
    const { data, isLoading, isError, refetch } = useGetAllCampaignsQuery()

    const [selectedCampaign, setSelectedCampaign] = useState(null)

    useEffect(() => {
        refetch()
    }, [])

    return (
        <>

            <div style={{
                flex: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                background: "#fff"
            }}>
                <CampaignTable campaigns={data} loading={isLoading} onView={(campaign) => setSelectedCampaign(campaign._id)} />
            </div>

            <div>
                <CampaignStatusPage
                    campaignId={selectedCampaign}
                    onClose={() => setSelectedCampaign(null)}
                />
            </div>

        </>
    )
}

export default WaCampaignListPage