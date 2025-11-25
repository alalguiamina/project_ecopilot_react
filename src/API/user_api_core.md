# 📘 User API – Core Endpoints Documentation

## 3. Create User

### **POST `/user/users/`**

#### **Request Body Example**

```json
{
  "username": "agent1",
  "password": "test1234",
  "role": "agent",
  "sites": [1]
}
```

#### **Success Response (201)**

```json
{
  "id": 12,
  "username": "agent1",
  "role": "agent",
  "sites": [1]
}
```

#### **Possible Errors**

- **Superuser trying to create admin**

```json
{
  "detail": "Un Superuser ne peut créer que des Users ou Agents."
}
```

- **Agent/User trying to create a user**

```json
{
  "detail": "Vous n'avez pas la permission de créer un utilisateur."
}
```

- **Agent/User with more than one site**

```json
{
  "sites": ["Un Agent ou un User ne peut être associé qu'à un seul site."]
}
```

---

## 4. Get User Details

### **GET `/user/users/{id}/`**

#### **Success Response**

```json
{
  "id": 12,
  "username": "agent1",
  "role": "agent",
  "sites": [1]
}
```

---

## 5. Edit User

### **PUT `/user/users/{id}/`**

_(Full update — must include all fields)_

#### **Request Body Example**

```json
{
  "username": "agent_updated",
  "role": "user",
  "sites": [3]
}
```

---

### **PATCH `/user/users/{id}/`**

_(Partial update — send only changed fields)_

#### **Request Body Example**

```json
{
  "role": "user"
}
```

#### **Success Response**

```json
{
  "id": 12,
  "username": "agent1",
  "role": "user",
  "sites": [1]
}
```

#### **Possible Errors**

- **Not allowed to edit user**

```json
{
  "detail": "Vous n'avez pas la permission de modifier cet utilisateur."
}
```

- **Agent/User assigned to more than one site**

```json
{
  "sites": ["Un Agent ou un User ne peut être associé qu'à un seul site."]
}
```

---

## 6. Delete User

### **DELETE `/user/users/{id}/`**

#### **Success Response**

```json
{
  "detail": "User deleted successfully."
}
```

#### **Possible Errors**

- **Not allowed to delete**

```json
{
  "detail": "Vous n'avez pas la permission de supprimer cet utilisateur."
}
```
