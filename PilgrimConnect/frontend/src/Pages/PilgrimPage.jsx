import { useEffect, useState } from "react";

function PilgrimPage() {
  const [pilgrims, setPilgrims] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    age: "",
    gender: ""
  });

  // STEP A: FETCH DATA (READ)
  useEffect(() => {
    fetch("http://localhost:5000/pilgrims")
      .then(res => res.json())
      .then(data => setPilgrims(data))
      .catch(err => console.error(err));
  }, []);

  // STEP B: HANDLE INPUT
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // STEP C: CREATE DATA (WRITE)
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:5000/pilgrims", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(() => {
        alert("Pilgrim added successfully!");

        // Re-fetch data after insert
        return fetch("http://localhost:5000/pilgrims");
      })
      .then(res => res.json())
      .then(data => setPilgrims(data));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Pilgrim</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="full_name"
          placeholder="Full Name"
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="age"
          type="number"
          placeholder="Age"
          onChange={handleChange}
        />
        <br /><br />

        <select name="gender" onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <br /><br />

        <button type="submit">Add Pilgrim</button>
      </form>

      <hr />

      <h2>Pilgrim List</h2>
      <ul>
        {pilgrims.map((p) => (
          <li key={p.id}>
            {p.full_name} ({p.gender}) - Age {p.age}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PilgrimPage;
