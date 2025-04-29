// users.ts
const BASE_URL = 'http://localhost:8080/api/users'
export function register({
                           name,
                           username,
                           email,
                           password,
                         }: {
  name: string
  username: string
  email: string
  password: string
}) {
  // Basic validation
  if (!name || !username || !email || !password) {
    console.error('All fields are required.')
    return
  }

  // For now, just log the registration details
  console.log('User registered with:', {
    name,
    username,
    email,
    password,
  })

  fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      username,
      email,
      password,
      role: 'Analyst'
    })
  })
      .then(res => res.json())
      .then(data => {
        console.log('Server response:', data)
      })
      .catch((error) => {
        console.log('Error:', error)
      })
}

export function getUsers() {
  fetch(BASE_URL).then(res => res.json())
      .then(data => {
        console.log('Server response:', data)
      })
      .catch((error) => {
        console.log('Error:', error)
      })
}

export async function login({ username, password }: { username: string, password: string }) {
    try {
        const response = await fetch(BASE_URL + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password
            })
        });
        const text = await response.text();
        console.log("TEXT", text)
        if (text.includes("Inaccurate Credential")) {
            console.log('Login failed: Inaccurate Credential');
            return null;
        }
        const data = JSON.parse(text);
        console.log('Server response:', data);
        if (data != null) {
            return data.id;
        }
        return null;
    } catch (error) {
        console.log('Error:', error);
        return null;
    }
}