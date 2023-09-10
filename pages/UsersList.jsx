import { useEffect, useState } from 'react';

function UsersList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch the list of users from the API
    fetch('/api/users')
      .then((response) => {
        if (!response.ok) {
            throw new Error('Failed to fetch users');
            }
        return response.json();

    })
      .then((data) => {
        setUsers(data);
    })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.username}</li>
        ))
        }
      </ul>
    </div>
  );
}

export default UsersList;
