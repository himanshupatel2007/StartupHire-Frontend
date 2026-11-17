import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import useClientPaged from "../../hooks/useClientPaged";
import Pagination from "./Pagination";

export default function PagedList({ list = [], perPage = 10, pageKey = "page", resetKey = "", children }) {
    const { items, meta, setPage } = useClientPaged(list, { perPage, pageKey });
    const [, setSp] = useSearchParams();
    const first = useRef(true);

    // search/filter badle to page 1 par wapas (pehli baar skip, taaki refresh par page na jaye)
    useEffect(() => {
        if (first.current) { first.current = false; return; }
        setSp((prev) => {
            const n = new URLSearchParams(prev);
            n.delete(pageKey);
            return n;
        }, { replace: true });
        // eslint-disable-next-line
    }, [resetKey]);

    return (
        <>
            {children(items)}
            <Pagination meta={meta} onChange={setPage} />
        </>
    );
}