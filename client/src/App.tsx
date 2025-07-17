import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Home from "./pages/main";
import { SignIn } from "./pages/sign-in";
import { Room } from "./pages/room";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import { useUser } from "./user-context";
import Cookies from "universal-cookie";

export default function App() {
  const { call, setUser, setCall, client, isLoading } = useUser();
  const cookies = new Cookies();
 
  // Show loading if still initializing
  if (isLoading) {
    return <div className="loading">Loading Stream client...</div>;
  }
 
  return (
    <div className="app-container">
      {client ? (
        <StreamVideo client={client}>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route
                path="/room/:roomId"
                element={
                  call ? (
                    <StreamCall call={call}>
                      <Room />
                    </StreamCall>
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
            </Routes>
            <button
              className="logout-button"
              onClick={() => {
                cookies.remove("token");
                cookies.remove("name");
                cookies.remove("username");
                setUser(null);
                setCall(undefined);
                window.location.pathname = "/sign-in";
              }}
            >
              Logout
            </button>
          </Router>
        </StreamVideo>
      ) : (
        <Router>
          <Routes>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="*" element={<Navigate to="/sign-in" />} />
          </Routes>
        </Router>
      )}
    </div>
  );
}