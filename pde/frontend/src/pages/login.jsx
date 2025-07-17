import { useNavigate } from "react-router-dom";
import Form from "../components/form";

function Login() {
	const navigate = useNavigate();

	const handleRegisterClick = () => {
		navigate("/register");
	};

	return (
		<div style={{ textAlign: "center", marginTop: "50px" }}>
			<Form route="/api/token/" method="login" />
			<p style={{ marginTop: "20px" }}>
				Don't have an account?{" "}
				<span
					onClick={handleRegisterClick}
					style={{
						textDecoration: "underline",
						color: "blue",
						cursor: "pointer",
					}}
				>
					Register
				</span>
			</p>
		</div>
	);
}

export default Login;