import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/interactionsService";

export default function usePagedList(path, { key = "data", perPage = 12, extra = {} } = {}) {
    const [sp, setSp] = useSearchParams();
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10));

    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ page: 1, per_page: perPage, total: 0, last_page: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const extraKey = JSON.stringify(extra);

    useEffect(() => {
        let off = false;
        setLoading(true);

        const qs = new URLSearchParams({ page, per_page: perPage });
        Object.entries(extra).forEach(([k, v]) => {
            if (v !== "" && v != null && v !== "All") qs.set(k, v);
        });

        api(`${path}?${qs}`)
            .then((d) => {
                if (off) return;
                if (d.success) {
                    setItems(d[key] || []);
                    if (d.meta) setMeta(d.meta);
                    setError("");
                } else {
                    setError(d.message || "Failed to load");
                }
            })
            .catch(() => !off && setError("Could not load data"))
            .finally(() => !off && setLoading(false));

        return () => { off = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, page, perPage, extraKey, key]);

    const setPage = (p) => {
        const next = new URLSearchParams(sp);
        next.set("page", String(p));
        setSp(next);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return { items, meta, page, setPage, loading, error };
}