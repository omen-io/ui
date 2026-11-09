import {cleanup, fireEvent, render, screen} from "@testing-library/react"
import {afterEach, describe, expect, it, vi} from "vitest"

import {ThemeProvider} from "@/components/theme-provider"
import {ProfilePage} from "./profile-page"

afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    localStorage.clear()
})

const currentUser = {
    id: "user-1",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.test",
    roles: ["analyst"],
    entitlements: ["settings:write"],
}

function renderProfile() {
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:5173")
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(currentUser), {
            headers: {"Content-Type": "application/json"},
            status: 200,
        }),
    )

    return render(
        <ThemeProvider defaultTheme="light">
            <ProfilePage/>
        </ThemeProvider>,
    )
}

describe("profile page", () => {
    it("displays the current user's information and avatar fallback", async () => {
        renderProfile()

        expect(await screen.findByText("Ada Lovelace")).toBeTruthy()
        expect(screen.getByText("ada@example.test")).toBeTruthy()
        expect(screen.getByLabelText("Ada Lovelace")).toBeTruthy()
        expect(screen.getByText("AL")).toBeTruthy()
    })

    it("persists the selected light or dark theme", async () => {
        renderProfile()

        await screen.findByText("Ada Lovelace")
        fireEvent.click(screen.getByRole("button", {name: "Dark"}))

        expect(localStorage.getItem("theme")).toBe("dark")
        expect(screen.getByRole("button", {name: "Dark"}).getAttribute("aria-pressed")).toBe("true")
    })
})
