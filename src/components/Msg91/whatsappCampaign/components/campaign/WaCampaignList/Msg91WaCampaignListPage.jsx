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

    const dummyData = [
        {
            _id: "dummy_1",
            templateName: "Welcome Campaign",
            fromNumber: "919876543210",
            totalCount: 1500,
            sentCount: 1500,
            deliveredCount: 1450,
            readCount: 1200,
            failedCount: 50,
            successRate: 96,
            status: "COMPLETED",
            createdAt: new Date().toISOString()
        },
        {
            _id: "dummy_2",
            templateName: "Discount Offer",
            fromNumber: "919876543210",
            totalCount: 5000,
            sentCount: 3000,
            deliveredCount: 2900,
            readCount: 1000,
            failedCount: 100,
            successRate: 60,
            status: "PROCESSING",
            createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            _id: "dummy_3",
            templateName: "Alert Notification",
            fromNumber: "919876543210",
            totalCount: 100,
            sentCount: 100,
            deliveredCount: 10,
            readCount: 5,
            failedCount: 90,
            successRate: 10,
            status: "FAILED",
            createdAt: new Date(Date.now() - 172800000).toISOString()
        }
    ];

    const displayData = (data && data.length > 0) ? data : dummyData;

    const filteredData = displayData.filter(c => {
        const q = search.toLowerCase();
        return !search || 
            c.templateName?.toLowerCase().includes(q) ||
            c.fromNumber?.toLowerCase().includes(q) ||
            c.msg91RequestId?.toLowerCase().includes(q) ||
            c.status?.toLowerCase().includes(q);
    });

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