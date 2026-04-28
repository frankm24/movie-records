import { render, screen } from "@testing-library/react";
import App from "../src/App";
import userEvent from "@testing-library/user-event";


describe("App Component", () => {
    test("renders the course name somewhere", () => {
        render(<App />);
        const linkElement = screen.getByText(/Movie Records/i);
        expect(linkElement).toBeInTheDocument();
    });

    test("Movie can be marked as watched/unwatched", () => {
        render(<App />);
        // Initially, all are unwatched
        expect(screen.getAllByRole("button", {name: "Mark as watched"})).toHaveLength(6);
        expect(screen.queryAllByRole("button", {name: "Mark as unwatched"})).toHaveLength(0);

        // Can we mark as watched?
        userEvent.click(screen.getAllByRole("button", {name: "Mark as watched"})[0])
        const markAsUnwatchedButton = screen.getByRole("button", {name: "Mark as unwatched"});
        expect(markAsUnwatchedButton).toBeInTheDocument();

        // Can we mark as unwatched?
        userEvent.click(markAsUnwatchedButton);
        expect(screen.queryAllByRole("button", {name: "Mark as unwatched"})).toHaveLength(0);
    });
    test("Movie can be liked/unliked", () => {
        render(<App />);
        // Initially, no like buttons are present.
        expect(screen.queryAllByRole("button", {name: "Not liked"})).toHaveLength(0);
        // Click to show a like button.
        userEvent.click(screen.getAllByRole("button", {name: "Mark as watched"})[0]);

        // Find and click not liked button, expect it to say "Liked"
        userEvent.click(screen.getByRole("button", { name: "Not liked"}));
        const likedButton = screen.getByRole("button", {name: "Liked"});
        expect(likedButton).toBeInTheDocument();

        // Click again and expect it to go back to unliked
        userEvent.click(likedButton);
        expect(screen.getByRole("button", {name: "Not liked"})).toBeInTheDocument();

        // Unwatch movie so like/unlike button dissappears, ensure it did
        userEvent.click(screen.getByRole("button", {name: "Mark as unwatched"}));
        expect(screen.queryByRole("button", {name: "Not liked"})).not.toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Liked"})).not.toBeInTheDocument();
    });
});
