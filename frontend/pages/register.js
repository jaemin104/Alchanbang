import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Register() {
    const [form, setForm] = useState({ nickname: "", email: "", password: "" });
    const router = useRouter();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5001/api/auth/register", form);
            alert("회원가입 성공!");
            router.push("/login");
        } catch (error) {
            alert(error.response.data.message);
        }
    };

    return (
        <div>
            <h1>회원가입</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" name="nickname" placeholder="Nickname" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit">회원가입</button>
            </form>
        </div>
    );
}
