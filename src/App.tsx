import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";
import {
  initializeGapiClient,
  listFolderImages,
  uploadImage,
} from "./api/googleDrive";

const FOLDER_ID = "<YOUR_FOLDER_ID>"; // Replace with your folder ID

// npm install googleapis gapi-script

const App: React.FC = () => {
  const [images, setImages] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initGapi = async () => {
      try {
        await initializeGapiClient();
        setIsAuthenticated(true);
        fetchImages();
      } catch (error) {
        console.error("Error initializing GAPI:", error);
      }
    };
    initGapi();
  }, []);

  const fetchImages = async () => {
    const files = await listFolderImages(FOLDER_ID);
    setImages(files);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      await uploadImage(FOLDER_ID, file);
      fetchImages(); // Refresh images after upload
    }
  };

  const handleLogin = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  const handleLogout = () => {
    gapi.auth2.getAuthInstance().signOut();
    setIsAuthenticated(false);
  };

  return (
    <div>
      <h1>Google Drive Image Gallery</h1>
      {!isAuthenticated ? (
        <button onClick={handleLogin}>Login with Google</button>
      ) : (
        <>
          <button onClick={handleLogout}>Logout</button>
          <input type="file" accept="image/*" onChange={handleUpload} />
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {images.map((image) => (
              <div key={image.id} style={{ margin: "10px" }}>
                <img
                  src={image.thumbnailLink}
                  alt={image.name}
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                  }}
                />
                <p>{image.name}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
