import React from "react";
import { useSelector } from "react-redux";
import ReportComponents from "../components/ReportComponents";
import { cancelReport } from "../slice/orderSlice";

export default function CancelledReportPage() {
    const { cancelledReplaceReport, cancelledReport, loading } = useSelector((state) => state.order);

    return (
        <ReportComponents
            title="Cancel Report"
            reportData={cancelledReport}
            replaceReportData={cancelledReplaceReport}
            loading={loading}
            queryAction={cancelReport}
        />
    );
}
