import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Pehle se load hui list ko pages mein kaatta hai. Page URL mein rehta hai (?page=2).
 *   const { items, meta, setPage } = useClientPaged(list, { perPage: 10 });
 */
export default function useClientPaged(list = [], { perPage = 10, pageKey = "page" } = {}) {
    const [sp, setSp] = useSearchParams();
    const total = list.length;
    const last_page = Math.max(Math.ceil(total / perPage), 1);
    const page = Math.min(Math.max(parseInt(sp.get(pageKey) || "1", 10) || 1, 1), last_page);

    const items = useMemo(
        () => list.slice((page - 1) * perPage, page * perPage),
        [list, page, perPage]
    );

    const setPage = (p) => {
        setSp((prev) => {
            const n = new URLSearchParams(prev);
            n.set(pageKey, String(p));
            return n;
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return { items, meta: { page, per_page: perPage, total, last_page }, setPage };
}