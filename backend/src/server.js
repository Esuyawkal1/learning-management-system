import app from "./app.js";
import config from "./config/index.js";

const { port, nodeEnv } = config.env;

config.connectDB();

app.listen(port, () => {
  console.log(`Server running in ${nodeEnv} mode on port ${port}`);
  
});