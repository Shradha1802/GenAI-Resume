
let is_Prod=true; //in casee of localhost make it false
const server = is_Prod
  ? "https://genai-resume-n27l.onrender.com"
  : "https://localhost:3000";
export default server;

//in casee of localhost make it false