const editDetails = () => {
    setEditMode(true);
      setPopupContent(`
      <div>
        <div><label>Comment: <input type="text" id="commentInput" /></label></div>
        <div>
          <label>Status: 
            <select id="statusSelect">
              <option value="true" ${statusSelect ? 'selected' : ''}>Active</option>
              <option value="false" ${!statusSelect ? 'selected' : ''}>Inactive</option>
            </select>
          </label>
        </div>
        <button class="btn-save" onclick="window.saveDetails()">Save</button>
      </div>
    `);
  
    // Use a timeout or directly manipulate DOM to set input values after rendering
    setTimeout(() => {
      const inputField = document.getElementById('commentInput') as HTMLInputElement;
      if (inputField) {
        inputField.value = currentFeature.details || '';
      }
  
      const statusSelectField = document.getElementById('statusSelect') as HTMLSelectElement;
      if (statusSelectField) {
        statusSelectField.value = statusSelect ? 'true' : 'false';
      }
    }, 0);
  };
  


  const saveDetails = () => {
    const newComment = (document.getElementById('commentInput') as HTMLInputElement).value;
    const newStatus = (document.getElementById('statusSelect') as HTMLSelectElement).value === 'true';

    // Retrieve existing coordinates from localStorage
    const storedCoordinates = localStorage.getItem('coordinates');
    const coordinatesArray = storedCoordinates ? JSON.parse(storedCoordinates) : [];

    // Ensure that the currentFeature contains latitude and longitude
    if (!currentFeature || typeof currentFeature.latitude !== 'number' || typeof currentFeature.longitude !== 'number') {
      console.error("Current feature is missing latitude or longitude.");
      return;
    }

    // Find the index of the coordinate to update
    const index = coordinatesArray.findIndex((coord: { latitude: unknown; longitude: unknown; }) => 
      coord.latitude === currentFeature.latitude && coord.longitude === currentFeature.longitude
    );

    // Check if the coordinate exists
    if (index === -1) {
      console.error("Coordinate with the specified latitude and longitude not found.");
      return;
    }

    // Update the specific coordinate
    coordinatesArray[index] = { 
      ...coordinatesArray[index], 
      details: newComment, 
      status: newStatus 
    };

    // Save the updated coordinates array back to localStorage
    localStorage.setItem('coordinates', JSON.stringify(coordinatesArray));

    // Update the UI
    setCommentInput(newComment);
    setStatusSelect(newStatus);
    setEditMode(false);
    setPopupContent(`
      <div>
        <p class='new text'>Comment: ${newComment}</p>
        <p>Status: <span class="pop-status">${newStatus ? 'Active' : 'Inactive'}</span></p>
        <button class="btn-change" onclick="window.editDetails()">Edit</button>
      </div>
    `);

    window.location.reload();
  };

  
  

  window.editDetails = editDetails;
  window.saveDetails = saveDetails;