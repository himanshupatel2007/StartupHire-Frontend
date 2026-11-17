import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import EmployerMessagesSection from "../sections/EmployerMessagesSection";
import { FEED_URL, feedPost } from "../../../services/feedService";

export default function MessagesPage() {
    const { setToast } = useOutletContext();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messageDraft, setMessageDraft] = useState("");

    useEffect(() => {
        const load = () =>
            fetch(`${FEED_URL}?action=conversations`, { credentials: "include" })
                .then((r) => r.json())
                .then((d) => {
                    if (!d.success) return;
                    setConversations(d.conversations);
                    setActiveConversation((prev) => prev ?? d.conversations[0]?.id ?? null);
                })
                .catch(() => { });
        load();
        const t = setInterval(load, 30000);
        return () => clearInterval(t);
    }, []);

    const openConversation = (id) => {
        setActiveConversation(id);
        setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
        feedPost({ action: "mark_read", application_id: String(id) }).catch(() => { });
    };

    const sendMessage = async () => {
        const text = messageDraft.trim();
        if (!text || !activeConversation) return;
        setMessageDraft("");
        setConversations((prev) =>
            prev.map((c) =>
                c.id === activeConversation ? { ...c, messages: [...c.messages, { from: "me", text }] } : c
            )
        );
        try {
            const d = await feedPost({
                action: "send_message",
                application_id: String(activeConversation),
                body: text,
            });
            if (!d.success) setToast(d.message || "Message not sent");
        } catch {
            setToast("Message not sent");
        }
    };

    return (
        <EmployerMessagesSection
            activeConversation={activeConversation}
            conversations={conversations}
            messageDraft={messageDraft}
            openConversation={openConversation}
            sendMessage={sendMessage}
            setMessageDraft={setMessageDraft}
        />
    );
}