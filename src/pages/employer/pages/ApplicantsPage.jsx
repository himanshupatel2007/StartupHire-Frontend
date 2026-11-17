import { useOutletContext } from "react-router-dom";
import ApplicantsPanel from "../ApplicantsPanel";

export default function ApplicantsPage() {
    const { setToast } = useOutletContext();
    return <ApplicantsPanel onToast={setToast} />;
}