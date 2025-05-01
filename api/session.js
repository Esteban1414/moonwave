// api/session.js
export default function handler(req, res) {
    const { token } = req.cookies;
  
    if (token === "authenticated") {
      return res.status(200).json({ authenticated: true });
    }
  
    return res.status(401).json({ authenticated: false });
  }
  