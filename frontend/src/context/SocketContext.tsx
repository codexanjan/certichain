import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { getAccessToken } from "../services/api";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinCertificateRoom: (certId: string) => void;
  leaveCertificateRoom: (certId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const token = getAccessToken();

    const socketInstance = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socketInstance.on("connect", () => {
      setConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const joinCertificateRoom = (certId: string) => {
    if (socket && certId) {
      socket.emit("join:certificate", certId);
    }
  };

  const leaveCertificateRoom = (certId: string) => {
    if (socket && certId) {
      socket.emit("leave:certificate", certId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        joinCertificateRoom,
        leaveCertificateRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
