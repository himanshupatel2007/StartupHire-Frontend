import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import MyJobsSection from "../sections/MyJobsSection";
import { mapMyJob } from "../employerHelpers";
import { empPath } from "../paths";
import { API_PHP } from "../../../config/env";

export default function MyJobsPage() {
    const navigate = useNavigate();
    const { company, employerName } = useOutletContext();
    const [myJobs, setMyJobs] = useState([]);

    useEffect(() => {
        fetch(`${API_PHP}/jobs.php?mine=1`, { credentials: "include" })
            .then((r) => r.json())
            .then((d) => {
                if (d.success && Array.isArray(d.jobs)) setMyJobs(d.jobs.map(mapMyJob));
            })
            .catch(() => { });
    }, []);

    const toggleJobStatus = (id) =>
        setMyJobs((prev) =>
            prev.map((j) => (j.id === id ? { ...j, status: j.status === "Active" ? "Paused" : "Active" } : j))
        );

    return (
        <MyJobsSection
            company={company}
            employerName={employerName}
            myJobs={myJobs}
            setActive={(id) => navigate(empPath(id))}
            toggleJobStatus={toggleJobStatus}
        />
    );
}