import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { mockPush, mockRefresh } from "@/lib/test/navigation-mocks";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: mockPush,
  }),
  usePathname: () => "/",
}));

afterEach(() => {
  cleanup();
});
