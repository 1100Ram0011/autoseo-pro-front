import React, { useEffect, useState } from "react"
import { useMsg91GetAllCampaignsQuery } from "@/redux/apis/Templateapi.js"
import CampaignStatusPage from "../Msg91WaCampaignStatusModel.jsx"
import CampaignTable from "./Msg91WaCampaignTable.jsx"

const Msg91WaCampaignListPage = ({
    ModalWaCampaignOpen,
    refreshKey,
    onLoadingChange,
    search = ''
}) => {
    const { data, isLoading, isError, refetch } = useMsg91GetAllCampaignsQuery();

    const [selectedCampaign, setSelectedCampaign] = useState(null);

    useEffect(() => {
        onLoadingChange?.(isLoading);
    }, [isLoading]);

    useEffect(() => {
        if (!ModalWaCampaignOpen) {
            refetch();
        }
    }, [ModalWaCampaignOpen, refetch]);

    useEffect(() => {
        if (refreshKey > 0) {
            refetch();
        }
    }, [refreshKey, refetch]);

    const filteredData = data ? data.filter(c => {
        const q = search.toLowerCase();
        return !search || 
            c.templateName?.toLowerCase().includes(q) ||
            c.fromNumber?.toLowerCase().includes(q) ||
            c.msg91RequestId?.toLowerCase().includes(q) ||
            c.status?.toLowerCase().includes(q);
    }) : [];

    return (
        <>

            <div style={{
                flex: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                // background: "#fff"
            }}>
                <CampaignTable campaigns={filteredData} loading={isLoading} onView={(campaign) => setSelectedCampaign(campaign._id)} />
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

export default Msg91WaCampaignListPage