const endpoints = [
  {
    method: "POST",
    register: "/auth/register",
  },
  {
    method: "POST",
    login: "/auth/login",
  },
  {
    method: "GET",
    "get loggedin users": "/users",
  },
  {
    method: "GET",
    "get all messages from chat": "/messages",
  },
  {
    method: "POST",
    "send a mesage": "/messages",
  },
];

export default endpoints;
