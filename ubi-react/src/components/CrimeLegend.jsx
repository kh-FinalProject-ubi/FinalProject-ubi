const CrimeLegend = ({ visible = true, selectedType }) => {
  const levels = [
    { color: "#ffffb2", label: "1등급" },
    { color: "#fed976", label: "2등급" },
    { color: "#feb24c", label: "3등급" },
    { color: "#fd8d3c", label: "4등급" },
    { color: "#fc4e2a", label: "5등급" },
    { color: "#e31a1c", label: "6등급" },
    { color: "#b10026", label: "7등급" },
  ];

  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "60px",
        left: "20px",
        backgroundColor: "white",
        padding: "12px",
        borderRadius: "12px",
        boxShadow: "0 0 8px rgba(0,0,0,0.15)",
        fontSize: "14px",
        zIndex: 1000,
        width: "160px",
      }}
    >
      <p style={{ margin: "0 0 10px" }}>범죄주의구간 - {selectedType}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {levels.map(({ color, label }, i) => (
          <li
            key={i}
            style={{
              backgroundColor: color,
              padding: "4px 8px",
              borderRadius: "4px",
              marginBottom: "4px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CrimeLegend;
