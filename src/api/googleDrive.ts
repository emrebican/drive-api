import { gapi } from "gapi-script";

export const initializeGapiClient = async () => {
  return new Promise((resolve, reject) => {
    gapi.load("client:auth2", async () => {
      try {
        await gapi.client.init({
          apiKey: "<YOUR_API_KEY>",
          clientId: "<YOUR_CLIENT_ID>",
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
          ],
          scope:
            "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file",
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
      q: `'${folderId}' in parents and mimeType contains 'image/'`,
      fields: "files(id, name, webViewLink, thumbnailLink)",
    });
    return response.result.files || [];
  } catch (error) {
    console.error("Error listing folder images:", error);
    return [];
  }
};

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
    console.error("Error uploading image:", error);
  }
};
