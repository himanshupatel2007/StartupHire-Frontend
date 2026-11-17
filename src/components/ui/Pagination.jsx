export default function Pagination({ meta, onPage }) {
    const { page = 1, last_page: last = 1, total = 0 } = meta || {};
    if (last <= 1) return null;

    const from = Math.max(1, page - 2);
    const to = Math.min(last, page + 2);
    const nums = [];
    for (let i = from; i <= to; i++) nums.push(i);

    return (
        <div className="pager">
            <button disabled={page <= 1} onClick={() => onPage(page - 1)}>‹ Prev</button>
            {from > 1 && <><button onClick={() => onPage(1)}>1</button>{from > 2 && <span>…</span>}</>}
            {nums.map((n) => (
                <button key={n} className={n === page ? "active" : ""} onClick={() => onPage(n)}>{n}</button>
            ))}
            {to < last && <>{to < last - 1 && <span>…</span>}<button onClick={() => onPage(last)}>{last}</button></>}
            <button disabled={page >= last} onClick={() => onPage(page + 1)}>Next ›</button>
            <small>{total} total</small>
        </div>
    );
}