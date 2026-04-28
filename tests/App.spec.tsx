import { render, screen, within } from "@testing-library/react";
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
    test("Movie can be edited and changes saved", () => {
        const newTitle = "My Super Epic Movie";
        const newReleaseYear = "1984";
        const newRating = "10";
        const newDescription = "This movie made billions for Frank Murphy and with those billions he made more movies."
        const newSongName = "Joe's Blues";
        const newSongBy = "Joe Pass";

        render(<App />);
        // Initially, editor pane is not visible.
        expect(screen.queryAllByRole("button", {name: "Cancel"})).toHaveLength(0);
        // Click edit on a movie
        userEvent.click(screen.getAllByRole("button", {name: "Edit"})[0]);
        // Movie editor should now be visible
        expect(screen.getByRole("button", {name: "Cancel"})).toBeInTheDocument();
        
        // Change title 
        const titleInput = screen.getByLabelText("Title:");
        userEvent.clear(titleInput)
        userEvent.type(titleInput, newTitle)
        // Change release year
        const yearInput = screen.getByRole("spinbutton");
        userEvent.clear(yearInput);
        userEvent.type(yearInput, newReleaseYear);
        // Change rating
        userEvent.selectOptions(screen.getByRole("combobox"), newRating);
        // Change description
        const descriptionInput = screen.getByLabelText("Description:");
        userEvent.clear(descriptionInput);
        userEvent.type(descriptionInput, newDescription)

        // Get song items
        const songItems = screen.getAllByRole("listitem");
        const firstSongInputs = within(songItems[0]).getAllByRole("textbox")
        // Change song name and ensure visible
        // (cant test spoitify embed bc it does't actually change)
        const songNameInput = firstSongInputs[0];
        userEvent.clear(songNameInput);
        userEvent.type(songNameInput, newSongName);
        expect(songNameInput).toHaveValue(newSongName);
        // Change song by and ensure change visible 
        // (cant test spoitify embed bc it does't actually change)
        const songByInput = firstSongInputs[1];
        userEvent.clear(songByInput);
        userEvent.type(songByInput, newSongBy);
        expect(songByInput).toHaveValue(newSongBy);

        // Click save
        userEvent.click(screen.getByRole("button", {name: "Save"}));

        // Verify that new properties saved 
        expect(screen.getByText(newTitle)).toBeInTheDocument();
        expect(screen.getByText(`Released ${newReleaseYear}`)).toBeInTheDocument();
        expect(screen.getAllByText("⭐⭐⭐⭐⭐")).toHaveLength(3);
        expect(screen.getByText(newDescription)).toBeInTheDocument();
    });

    test("Movie editing can be cancelled without saving", () => {
        const newTitle = "Iron Man";

        render(<App />);
        // Click Edit on a movie
        userEvent.click(screen.getAllByRole("button", {name: "Edit"})[0]);
        // Change title of movie
        const titleInput = screen.getByLabelText("Title:");
        userEvent.clear(titleInput)
        userEvent.type(titleInput, newTitle)
        // Click cancel 
        userEvent.click(screen.getByRole("button", {name: "Cancel"}))
        // Ensure editor is closed and new title does not appear
        expect(screen.queryByRole("button", {name: "Cancel"})).not.toBeInTheDocument();
        expect(screen.queryByText(newTitle)).not.toBeInTheDocument();
    })
    test("Movie can be deleted", () => {
        render(<App />);
        // Determine number of movies and the title of the 0th movie
        const headingsBefore = screen.getAllByRole("heading", { level: 3 });                     
        const initialCount = headingsBefore.length;              
        const titleToDelete = headingsBefore[0].textContent;   
        // Click edit and delete on 0th movie
        userEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
        userEvent.click(screen.getByRole("button", { name: "Delete" })); 
        // Ensure the title is gone and movie count decreased by one
        expect(screen.queryByRole("heading", {name: titleToDelete})).not.toBeInTheDocument();
        expect(screen.getAllByRole("heading", {level: 3})).toHaveLength(initialCount - 1);
    })
    test("New movie can be added with songs", () => {
        const newYtId = "dQw4w9WgXcQ";
        const newSpotifyId1 = "4PTG3Z6ehGkBFwjybzWkR8"
        const newSpotifyId2 = "0NQYXMweY1mVGnencTuZb4"
        render(<App />);
        // Determine the original number of movies by headings 
        const headingsBefore = screen.getAllByRole("heading", { level: 3 }).length;  
        // Click add new movie button
        userEvent.click(screen.getByRole("button", {name: "Add New Movie"}));
        // Scope into the modal dialog
        const dialog = screen.getByRole("dialog");
        // Input YouTube ID
        const ytIdInput = within(dialog).getByLabelText("YouTube ID:");
        userEvent.type(ytIdInput, newYtId);
        // Add two songs by clicking add song twice
        userEvent.click(within(dialog).getByRole("button", {name: "Add Song"}));
        userEvent.click(within(dialog).getByRole("button", {name: "Add Song"}));
        // Get song input textboxes
        const allTextInputs = within(dialog).getAllByRole("textbox");
        // Type Spotify IDs in Song textboxes
        userEvent.type(allTextInputs[1], newSpotifyId1);
        userEvent.type(allTextInputs[2], newSpotifyId2);
        // Click one of the "X" buttons, deleting the song
        userEvent.click(within(dialog).getAllByRole("button", {name: "❌"})[1])
        // Click "Save Changes", adding the movie
        userEvent.click(within(dialog).getByRole("button", {name: "Save Changes"}));
        // Ensure that the dialog has gone
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        // Ensure that the heading count has increased by 1 
        expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(headingsBefore + 1);
    })
    test("Saving with empty year defaults released to 0", () => {
        render(<App />);                                     
        // Click edit button                                
        userEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);                 
        // Clear year released
        userEvent.clear(screen.getByRole("spinbutton")); 
        // Save changes
        userEvent.click(screen.getByRole("button", { name: "Save" }));   
        // Ensure default value of 0 is rendered                     
        expect(screen.getByText("Released 0")).toBeInTheDocument();                         
    });         
});
