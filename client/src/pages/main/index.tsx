import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "../../App.css";
import { Call, StreamVideo } from "@stream-io/video-react-sdk";
import { useUser } from "../../user-context";
import CryptoJS from "crypto-js";

interface Room {
  id: string;
  title: string;
  description: string;
  participantsLength: number;
  createdBy: string;
}

interface NewRoom {
  name: string;
  description: string;
}

const Home = () => {
  const { user, isLoading, client, setCall } = useUser();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoom, setNewRoom] = useState<NewRoom>({
    name: "",
    description: "",
  });

  const hashRoomName = (roomName: string): string => {
    const hash = CryptoJS.SHA256(roomName).toString(CryptoJS.enc.Base64);
    return hash.replace(/[^a-zA-Z0-9_-]/g, "");
  };

  const createRoom = async () => {
    const { name, description } = newRoom;
    if (!client || !user || !name || !description) return;
    
    try {
      const roomID = hashRoomName(name);
      const call = client.call("audio_room", roomID);
      await call.join({
        create: true,
        data: {
          members: [{ user_id: user.username }],
          custom: {
            title: name,
            description,
          },
        },
      });
      setCall(call);
      navigate(`/room/${roomID}`);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!client) return;
    
    try {
      const call = client.call("audio_room", roomId);
      await call.join();
      setCall(call);
      navigate("/room/" + roomId);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  useEffect(() => {
    if (client) fetchListOfCalls();
  }, [client]);

  type CustomCallData = {
    description?: string;
    title?: string;
  };

  const fetchListOfCalls = async () => {
    if (!client) return;
    
    try {
      const callsQueryResponse = await client.queryCalls({
        filter_conditions: { ongoing: true },
        limit: 25,
        watch: true,
      });
      
      if (!callsQueryResponse) {
        console.log("Error fetching calls");
        return;
      }

      const getCallInfo = async (call: Call): Promise<Room> => {
        const callInfo = await call.get();
        const customData = callInfo.call.custom;
        const { title, description } = (customData || {}) as CustomCallData;
        const participantsLength = callInfo.members.length ?? 0;
        const createdBy = callInfo.call.created_by.name ?? "";
        const id = callInfo.call.id ?? "";
        return {
          id,
          title: title ?? "",
          description: description ?? "",
          participantsLength,
          createdBy,
        } as Room;
      };

      const roomPromises = callsQueryResponse.calls.map((call) =>
        getCallInfo(call)
      );
      const rooms = await Promise.all(roomPromises);
      setRooms(rooms);
    } catch (error) {
      console.error("Error fetching calls:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  
  if (!isLoading && !user) {
    console.log("No user found, redirecting to sign-in");
    return <Navigate to="/sign-in" />;
  }

  if (!client) return <div>Loading Stream client...</div>;

  return (
    <StreamVideo client={client}>
      <div className="home">
        <h1>Welcome, {user?.name}</h1>

        <div className="form">
          <h2>Create Your Own Room</h2>
          <input
            placeholder="Room Name..."
            value={newRoom.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRoom((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <input
            placeholder="Room Description..."
            value={newRoom.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRoom((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <button
            onClick={createRoom}
            style={{ backgroundColor: "rgb(125, 7, 236)" }}
            disabled={!newRoom.name || !newRoom.description}
          >
            Create Room
          </button>
          <h2>Available Rooms</h2>
        </div>
        
        <div className="grid">
          {rooms.map((room) => (
            <div
              className="card"
              key={room.id}
              onClick={() => joinRoom(room.id)}
            >
              <h4>{room.title}</h4>
              <p>{room.description}</p>
              <p>{room.participantsLength} Participants</p>
              <p>Created By: {room.createdBy}</p>
              <div className="shine"></div>
            </div>
          ))}
        </div>
      </div>
    </StreamVideo>
  );
};

export default Home;