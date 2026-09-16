const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { sub: "123456" }, 
  "super_secret_temporary_key_for_dev_only_change_in_prod", 
  { algorithm: "HS256", expiresIn: "1h" }
);

console.log("Token:", token);

fetch("http://localhost:8000/api/v1/analytics/metrics", {
  headers: {
    "Authorization": `Bearer ${token}`
  }
}).then(async res => {
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}).catch(console.error);
