import { gapi } from "gapi-script";

const API_KEY = import.meta.env.VITE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const DISCOVERY_DOCS = [import.meta.env.VITE_DISCOVERY_DOCS];
const SCOPES = import.meta.env.VITE_SCOPES;

export const initializeGapiClient = async () => {
  return new Promise((resolve, reject) => {
    gapi.load("client:auth2", async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        });
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  });
};

export const listFolderImages = async (folderId: string) => {
  try {
    const response = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType='application/pdf')`,
      fields: "files(id, name, mimeType, webViewLink, thumbnailLink)",
    });
    console.log("fetching images", response);

    return response.result.files || [];
  } catch (error) {
    console.error("Error listing folder images:", error);
    return [];
  }
};

// Exponential backoff not working
/* 
const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await gapi.client.drive.files.list({
        q: `'${folderId}' in parents and mimeType contains 'image/'`,
        fields: "files(id, name, webViewLink, thumbnailLink)",
      });
      console.log('fetching images', response);
      
      return response.result.files || [];
    } catch (error:any) {
      if (error.status === 429 && attempt < maxRetries - 1) {
        attempt++;
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error("Error listing folder images:", error);
        return [];
      }
    }
  }
*/

export const uploadImage = async (folderId: string, file: File) => {
  try {
    const metadata = {
      name: file.name,
      parents: [folderId],
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", file);

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${gapi.auth.getToken().access_token}`,
        },
        body: form,
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error uploading files:", error);
  }
};
