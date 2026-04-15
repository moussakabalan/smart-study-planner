export default function Analytics() {
  const rows = [
    { label: "Tasks completed (sample week)", value: "3" },
    { label: "Planned study time (sample)", value: "4h 30m" },
    { label: "Actual study time logged (sample)", value: "3h 15m" },
    { label: "Average time to complete a task (sample)", value: "2.4 days" },
  ];

  return (
    <div className="page">
      <h1 className="page-title">Analytics</h1>
      <p className="page-lead">
        This page will show server-calculated stats. For now the table uses static sample values.
      </p>

      <section className="panel" aria-label="Sample analytics">
        <h2 className="panel-title">Sample summary</h2>

        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Metric</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td className="table-num">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}