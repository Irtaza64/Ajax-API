const API_URL = 'https://usmanlive.com/wp-json/api/stories';

function showForm() {
    $('.form-section').slideDown(300);
    $('#formTitle').text('Add New Story');
    resetForm();
}

function hideForm() {
    $('.form-section').slideUp(300);
}

// Fetch all stories (GET /)
function fetchStories() {
    $.ajax({
        url: API_URL,
        method: 'GET',
        success: function(stories) {
            if (Array.isArray(stories)) {
                displayStories(stories);
            } else {
                console.error('Invalid response format');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching stories:', error);
            alert('Failed to load stories. Please try again later.');
        }
    });
}

// Display stories in the DOM
function displayStories(stories) {
    $('#storiesList').empty();
    stories.forEach(story => {
        if (story.title && story.content) {
            $('#storiesList').append(`
                <div class="story-card">
                    <h3>${story.title}</h3>
                    <p>${story.content}</p>
                    <div class="story-actions">
                        <button class="edit-btn" data-id="${story.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-btn" data-id="${story.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `);
        }
    });
}

// Create/Update story
$('#storyForm').on('submit', function(e) {
    e.preventDefault();
    
    const story = {
        title: $('#storyTitle').val().trim(),
        content: $('#storyContent').val().trim()
    };

    // Validate input
    if (!story.title || !story.content) {
        alert('Both title and content are required!');
        return;
    }

    const storyId = $('#storyId').val();
    
    if (storyId) {
        // Update existing story (PUT /:id)
        $.ajax({
            url: `${API_URL}/${storyId}`,
            method: 'PUT',
            data: story,
            success: function(response) {
                hideForm();
                fetchStories();
                alert('Story updated successfully!');
            },
            error: function(xhr, status, error) {
                console.error('Error updating story:', error);
                alert('Failed to update story. Please try again.');
            }
        });
    } else {
        // Create new story (POST /)
        $.ajax({
            url: API_URL,
            method: 'POST',
            data: story,
            success: function(response) {
                hideForm();
                fetchStories();
                alert('Story created successfully!');
            },
            error: function(xhr, status, error) {
                console.error('Error creating story:', error);
                alert('Failed to create story. Please try again.');
            }
        });
    }
});

// Get single story (GET /:id)
$(document).on('click', '.edit-btn', function() {
    const id = $(this).data('id');
    
    if (!id) {
        alert('Invalid story ID');
        return;
    }
    
    // First show the form
    showForm();
    
    // Then fetch and populate the story data
    $.ajax({
        url: `${API_URL}/${id}`,
        method: 'GET',
        success: function(story) {
            // Check if we got a valid story object
            if (story && story.title && story.content) {
                // Populate the form fields
                $('#storyId').val(id);  // Set the ID in hidden field
                $('#storyTitle').val(story.title);
                $('#storyContent').val(story.content);
                
                // Update form UI to show it's in edit mode
                $('#submitBtn').html('<i class="fas fa-save"></i> Update Story');
                $('#formTitle').text('Edit Story');
                
                // Scroll to form
                $('html, body').animate({
                    scrollTop: $('.form-section').offset().top - 20
                }, 500);
            } else {
                alert('Story data is incomplete or invalid');
                hideForm();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching story for edit:', error);
            alert('Failed to load story details. Please try again.');
            hideForm();
        }
    });
});

// Delete story (DELETE /:id)
$(document).on('click', '.delete-btn', function() {
    const id = $(this).data('id');
    
    if (!id) {
        alert('Invalid story ID');
        return;
    }
    
    if (confirm('Are you sure you want to delete this story?')) {
        $.ajax({
            url: `${API_URL}/${id}`,
            method: 'DELETE',
            success: function(response) {
                fetchStories();
                alert('Story deleted successfully!');
            },
            error: function(xhr, status, error) {
                console.error('Error deleting story:', error);
                alert('Failed to delete story. Please try again.');
            }
        });
    }
});

// Helper function to reset the form
function resetForm() {
    $('#storyForm')[0].reset();
    $('#storyId').val('');  // Clear the hidden ID field
    $('#storyTitle').val('');  // Explicitly clear title
    $('#storyContent').val('');  // Explicitly clear content
    $('#submitBtn').html('<i class="fas fa-save"></i> Save Story');
    $('#formTitle').text('Add New Story');
}

// Initial load
$(document).ready(function() {
    fetchStories();

    // Event listeners
    $('#addNewBtn').on('click', showForm);
    $('#cancelBtn, .close-btn').on('click', hideForm);
});
