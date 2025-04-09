import app from "./app";
import "dotenv";

const port = process.env.PORT || 8080;

try {
  app.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}`);
  });
} catch (error) {
  process.exit(1);
}
