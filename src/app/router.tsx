import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { HomePage } from "../features/compatibility/pages/HomePage";
import { ModeLayout } from "../features/compatibility/pages/ModeLayout";
import { NotFoundPage } from "../features/compatibility/pages/NotFoundPage";
import { PersonAPage } from "../features/compatibility/pages/PersonAPage";
import { PersonBPage } from "../features/compatibility/pages/PersonBPage";
import { ReadingPage } from "../features/compatibility/pages/ReadingPage";
import { ResultPage } from "../features/compatibility/pages/ResultPage";
import { ReviewPage } from "../features/compatibility/pages/ReviewPage";

/**
 * /                              homepage (mode selection — no form here)
 * /:modeSlug/nguoi-thu-nhat      Person A   (modeSlug = tinh-iu | be-ban)
 * /:modeSlug/nguoi-thu-hai       Person B
 * /:modeSlug/kiem-tra            Review
 * /:modeSlug/dang-xem            be is reading (loading / error)
 * /:modeSlug/ket-qua             Result
 */
export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: ":modeSlug",
        element: <ModeLayout />,
        children: [
          { index: true, element: <NotFoundPage /> },
          { path: "nguoi-thu-nhat", element: <PersonAPage /> },
          { path: "nguoi-thu-hai", element: <PersonBPage /> },
          { path: "kiem-tra", element: <ReviewPage /> },
          { path: "dang-xem", element: <ReadingPage /> },
          { path: "ket-qua", element: <ResultPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
