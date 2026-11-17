import { useOutletContext } from "react-router-dom";
import EmployerNotificationsSection from "../sections/EmployerNotificationsSection";

export default function NotificationsPage() {
    const { notifications, markAllRead } = useOutletContext();
    return <EmployerNotificationsSection markAllRead={markAllRead} notifications={notifications} />;
}