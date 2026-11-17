import { useOutletContext } from "react-router-dom";
import EmployerUsersSection from "../sections/EmployerUsersSection";

export default function UsersPage() {
    const { setToast } = useOutletContext();
    return <EmployerUsersSection setToast={setToast} />;
}