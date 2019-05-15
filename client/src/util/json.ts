/**
 * Sends a GET request to the given route and returns the JSON response.
 */
export function getJSON(route: string): Promise<any> {
    return fetch(route, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => response.json());
}

/**
 * Sends a POST request to the given route with the given JSON-serializable data.
 */
export function postJSON(route: string, data: any): Promise<any> {
    return fetch(route, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(response => response.json());
}

export function deleteJSON(route: string): Promise<any> {
    return fetch(route, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
    }).then(response => response.json());
}