import { useOutletContext } from "react-router-dom";
import ApplicantsPanel from "../ApplicantsPanel";

export default function ShortlistedPage() {
    const { setToast } = useOutletContext();
    return <ApplicantsPanel initialStatus="Shortlisted" onToast={setToast} />;
}