import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/interactionsService";

/**
 * Reusable paged list. Page URL mein rehta hai (?page=2).
 *   usePagedList("/interactions/candidates", "candidates", { search, category })
 *   usePagedList("/connections", "connections")
 * Ek page par do list ho to pageKey alag do: { pageKey: "page2" }
 */
export default function usePagedList(path, key, params = {}, opts = {}) {
    const { perPage = 12, pageKey = "page" } = opts;
    const [sp, setSp] = useSearchParams();
    const page = Math.max(parseInt(sp.get(pageKey) || "1", 10) || 1, 1);

    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tick, setTick] = useState(0);

    const paramsKey = JSON.stringify(params);

    const setPage = useCallback((p) => {
        setSp((prev) => {
            const n = new URLSearchParams(prev);
            n.set(pageKey, String(p));
            return n;
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [setSp, pageKey]);

    useEffect(() => {
        let off = false;
        setLoading(true);
        const qs = new URLSearchParams({ page, per_page: perPage });
        Object.entries(params).forEach(([k, v]) => {
            if (v && v !== "All") qs.set(k, v);
        });

        api(`${path}?${qs}`)
            .then((d) => {
                if (off) return;
                if (d.success) {
                    setItems(d[key] || []);
                    setMeta(d.meta || null);
                    setError("");
                } else {
                    setItems([]);
                    setError(d.message || "Failed to load");
                }
            })
            .catch(() => { if (!off) { setItems([]); setError("Failed to load"); } })
            .finally(() => { if (!off) setLoading(false); });

        return () => { off = true; };
    }, [path, key, page, paramsKey, perPage, tick]);

    return { items, meta, loading, error, page, setPage, reload: () => setTick((t) => t + 1) };
}