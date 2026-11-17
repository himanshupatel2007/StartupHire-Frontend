export default function Pagination({ meta, onChange }) {
    if (!meta || meta.last_page <= 1) return null;
    const { page, last_page, total } = meta;

    const nums = [];
    for (let i = Math.max(1, page - 2); i <= Math.min(last_page, page + 2); i++) nums.push(i);

    return (
        <div className="filter-chips" style={{ gridColumn: "1 / -1", justifyContent: "center", alignItems: "center", margin: "18px 0" }}>
            <button className="chip" disabled={page <= 1} onClick={() => onChange(page - 1)}>‹ Prev</button>
            {nums[0] > 1 && <button className="chip" onClick={() => onChange(1)}>1</button>}
            {nums[0] > 2 && <span>…</span>}
            {nums.map((n) => (
                <button key={n} className={`chip ${n === page ? "active" : ""}`} onClick={() => onChange(n)}>{n}</button>
            ))}
            {nums[nums.length - 1] < last_page - 1 && <span>…</span>}
            {nums[nums.length - 1] < last_page && (
                <button className="chip" onClick={() => onChange(last_page)}>{last_page}</button>
            )}
            <button className="chip" disabled={page >= last_page} onClick={() => onChange(page + 1)}>Next ›</button>
            <small style={{ opacity: 0.7, marginLeft: 8 }}>{total} total</small>
        </div>
    );
}