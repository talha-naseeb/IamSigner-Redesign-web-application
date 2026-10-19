import { graphConfig } from "./authConfig";

/**
 * Fetches user's profile information from Microsoft Graph API
 * @param accessToken
 */
export async function callMsGraph(accessToken) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(graphConfig.graphMeEndpoint, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

/**
 * Fetches OneDrive files from the user's root directory
 * @param accessToken
 */
export async function getOneDriveFiles(accessToken) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers: headers,
  };

  const endpoint = "https://graph.microsoft.com/v1.0/me/drive/root/children";

  return fetch(endpoint, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}
