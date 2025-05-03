export const BASE_URL = 'http://localhost:8080/api';

// Generic fetch function with error handling
export async function fetchApi(endpoint: string, options = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response;
}

// HTTP methods
export async function deleteApi(endpoint: string) {
    return fetchApi(endpoint, { method: 'DELETE' });
}

export async function postApi(endpoint: string, data: any) {
    console.log("Data: ", JSON.stringify(data))
    console.log("URL: ", `${BASE_URL}${endpoint}`)
    return fetchApi(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function updateApi(endpoint: string, data: any) {
    return fetchApi(endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}