import { RouterProvider } from "react-router-dom";
import { CompatibilityProvider } from "../features/compatibility/state/CompatibilityContext";
import { router } from "./router";

export function App() {
  return (
    <CompatibilityProvider>
      <RouterProvider router={router} />
    </CompatibilityProvider>
  );
}
