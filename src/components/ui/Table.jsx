/**
 * Table — reusable data table with sticky header, hover rows,
 * empty state, and optional row-click handler.
 */
export function Table({ columns, rows, onRowClick, empty = "No records found." }) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-3.5 py-2.5 whitespace-nowrap"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3.5 py-8 text-center text-sm text-slate-400"
              >
                {empty}
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr
              key={row.id ?? i}
              onClick={() => onRowClick?.(row)}
              className={`${
                onRowClick
                  ? "hover:bg-indigo-50/40 cursor-pointer transition-colors"
                  : ""
              }`}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className="px-3.5 py-2.5 align-middle text-slate-700"
                >
                  {c.render ? c.render(row) : (row[c.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
