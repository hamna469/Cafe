import { useState } from "react";

export default function AutofillTest() {
  const [values, setValues] = useState({
    visibleUsername: "",
    hiddenUsername: "",
    visibleEmail: "",
    hiddenEmail: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div style={{ padding: "40px", maxWidth: "700px" }}>
      <h1>Autofill Leakage Test</h1>

      <p>
        This page is only for testing browser autofill behavior.
      </p>

      <hr />

      <h2>Visible Fields</h2>

      <input
        type="text"
        name="visibleUsername"
        placeholder="Username"
        autoComplete="username"
        value={values.visibleUsername}
        onChange={handleChange}
      />

      <br />
      <br />

      <input
        type="email"
        name="visibleEmail"
        placeholder="Email"
        autoComplete="email"
        value={values.visibleEmail}
        onChange={handleChange}
      />

      <h2>Hidden Fields</h2>

      <input
        type="text"
        name="hiddenUsername"
        autoComplete="username"
        value={values.hiddenUsername}
        onChange={handleChange}
        style={{ display: "none" }}
      />

      <input
        type="email"
        name="hiddenEmail"
        autoComplete="email"
        value={values.hiddenEmail}
        onChange={handleChange}
        style={{ display: "none" }}
      />

      <h2>Detected Values</h2>

      <pre
        style={{
          background: "#f4f4f4",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        {JSON.stringify(values, null, 2)}
      </pre>
    </div>
  );
}