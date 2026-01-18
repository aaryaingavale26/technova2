import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";

const Register = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [err, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/register", inputs);
      navigate("/login");
    } catch (err) {
      setError(err.response.data);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-orange-50">
      <Card className="w-full max-w-md p-6 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-orange-600">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input required type="text" placeholder="Username" name="username" onChange={handleChange} />
            <Input required type="email" placeholder="Email" name="email" onChange={handleChange} />
            <Input required type="password" placeholder="Password" name="password" onChange={handleChange} />
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              Register
            </Button>
            {err && <p className="text-red-500 text-center text-sm">{err}</p>}
            <p className="text-center text-sm text-gray-600">
              Already have an account? <Link to="/login" className="text-orange-500 font-bold">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;