import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";
import {
  initializeGapiClient,
  listFolderImages,
  uploadImage,
} from "./api/googleDrive";
import { ImageList } from "./components/ImageList";
import { Button, Flex } from "antd";

const FOLDER_ID = import.meta.env.VITE_FOLDER_ID;

const App: React.FC = () => {
  const [images, setImages] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Check if user is already authenticated
  const checkAuthStatusInGapi = async () => {
    try {
      await initializeGapiClient();
      const authInstance = gapi.auth2.getAuthInstance();
      const isSignedIn = authInstance.isSignedIn.get();
      setIsAuthenticated(isSignedIn);
      if (isSignedIn) {
        fetchImages();
      }
    } catch (error) {
      console.error("Error initializing GAPI:", error);
    }
  };

  useEffect(() => {
    checkAuthStatusInGapi();
  }, []);

  const fetchImages = async () => {
    const files = await listFolderImages(FOLDER_ID);
    setImages(files);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log("Uploading file:", file);

      await uploadImage(FOLDER_ID, file);
      fileInputRef.current!.value = ""; // Clear file input
      fetchImages(); // Refresh images after upload
    }
  };

  const handleLogin = async () => {
    try {
      await gapi.auth2.getAuthInstance().signIn();
      setIsAuthenticated(true);
      fetchImages();
    } catch (error) {
      console.error("Error login:", error);
    }
  };

  const handleLogout = () => {
    gapi.auth2.getAuthInstance().signOut();
    setIsAuthenticated(false);
  };

  return (
    <div>
      <h1>Google Drive Api</h1>
      {!isAuthenticated ? (
        <Button variant="outlined" onClick={handleLogin}>
          Login with Google
        </Button>
      ) : (
        <>
          <Flex align="center" wrap gap="small" style={{ margin: "1rem 0" }}>
            <Button variant="outlined" onClick={handleLogout}>
              Logout
            </Button>
            <input
              type="file"
              accept="image/*,application/pdf"
              ref={fileInputRef}
              onChange={handleUpload}
            />
          </Flex>
          <ImageList imageFiles={images} />
        </>
      )}
    </div>
  );
};

export default App;
