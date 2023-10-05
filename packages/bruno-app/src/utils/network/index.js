export const sendNetworkRequest = async (item, collection, environment, collectionVariables) => {
  return new Promise((resolve, reject) => {
    if (['http-request', 'graphql-request'].includes(item.type)) {
      sendHttpRequest(item, collection, environment, collectionVariables)
        .then((response) => {
          resolve({
            state: 'success',
            data: response.data,
            headers: Object.entries(response.headers),
            size: response.headers['content-length'] || 0,
            status: response.status,
            statusText: response.statusText,
            duration: response.duration
          });
        })
        .catch((err) => reject(err));
    }
  });
};

const sendHttpRequest = async (item, collection, environment, collectionVariables) => {
  return new Promise((resolve, reject) => {
    const { ipcRenderer } = window;

    ipcRenderer
      .invoke('send-http-request', item, collection.uid, collection.pathname, environment, collectionVariables)
      .then(resolve)
      .catch(reject);
  });
};

export const fetchGqlSchema = async (endpoint, environment) => {
  return new Promise((resolve, reject) => {
    const { ipcRenderer } = window;

    ipcRenderer.invoke('fetch-gql-schema', endpoint, environment).then(resolve).catch(reject);
  });
};

export const cancelNetworkRequest = async (cancelTokenUid) => {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke('cancel-http-request', cancelTokenUid).then(resolve).catch(reject);
  });
};
