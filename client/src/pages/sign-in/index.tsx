import * as yup from "yup";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser } from "../../user-context";
import Cookies from "universal-cookie";
import { PEOPLES_IMAGES } from "../../avatars";

interface FormValues {
  username: string;
  name: string;
}

export const SignIn = () => {
  const schema = yup.object().shape({
    username: yup
      .string()
      .matches(/^[a-zA-Z0-9_.@$]+$/, "Invalid username")
      .required("Username is required"),
    name: yup.string().required("Name is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const cookies = new Cookies(null, { path: "/" });
  const { setUser, setClient, isLoading, user } = useUser();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const { username, name } = data;
     
      // Get token from backend
      const response = await fetch("http://localhost:3001/auth/stream-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: username }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch token");
      }

      const responseData = await response.json();
      console.log(responseData);

      const userData = {
        id: username,
        name,
        username,
        image: PEOPLES_IMAGES[Math.floor(Math.random() * PEOPLES_IMAGES.length)],
      };

      const myClient = new StreamVideoClient({
        apiKey: '4mdy2gxtmjpm',
        user: {
          id: username,
          name,
          image: userData.image,
        },
        token: responseData.token,
      });

      const expires = new Date();
      expires.setDate(expires.getDate() + 1);
     
      cookies.set("token", responseData.token, { expires });
      cookies.set("username", username, { expires });
      cookies.set("name", name, { expires });

      setClient(myClient);
      setUser(userData);
      navigate("/");
    } catch (error) {
      console.error("Sign in error:", error);
      alert("Failed to sign in. Please try again.");
    }
  };

  if (user && !isLoading) return <Navigate to="/" />;

  return (
    <div className="home">
      <h1>Welcome to EchoBuzz</h1>
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Username: </label>
          <input type="text" {...register("username")} />
          {errors.username && (
            <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
              {errors.username.message}
            </p>
          )}
        </div>
        <div>
          <label>Name: </label>
          <input type="text" {...register("name")} />
          {errors.name && (
            <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
              {errors.name.message}
            </p>
          )}
        </div>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};