import type { Server } from "http";
import app from "./app.ts";
import envConfig from "./app/config/index.ts";

const port = envConfig.PORT || 5000;

async function main() {
  const server: Server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Base URL: ${envConfig.BASE_URL}`);
  });
}

main();
