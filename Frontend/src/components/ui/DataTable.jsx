export function DataTable({ columns, rows, emptyMessage = 'Aucune donnee' }) {
  if (!rows || rows.length === 0) {
    return <div className="pm-empty">{emptyMessage}</div>
  }

  return (
    <div className="pm-table-wrap">
      <table className="pm-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id ?? rowIndex}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row, rowIndex) : row[column.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
