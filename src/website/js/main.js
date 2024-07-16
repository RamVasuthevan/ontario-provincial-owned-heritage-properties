document.addEventListener('DOMContentLoaded', function () {
    const propertiesTable = document.getElementById('properties-table').getElementsByTagName('tbody')[0];
    const recognitionFilter = document.getElementById('filter-recognition');
    const authorityFilter = document.getElementById('filter-authority');
    const applyFiltersButton = document.getElementById('apply-filters');
    let propertiesData = [];

    // Function to populate the table with properties data
    function populateTable(data) {
        propertiesTable.innerHTML = '';
        data.forEach((property, index) => {
            const row = propertiesTable.insertRow();
            row.innerHTML = `
                <td><a href="property.html?property=${index}">${property['Property Name']}</a></td>
                <td>${property['Authority Name']}</td>
                <td>${property['Other Name(s):'].join('<br>')}</td>
                <td>${property['Recognition Type:'].join('<br>')}</td>
                <td>${property['Current Functional Category:']}</td>
                <td>${property['Current Functional Type:']}</td>
            `;
        });
    }

    // Function to populate filter options
    function populateFilters(data) {
        const recognitionTypes = new Set();
        const authorityNames = new Set();

        data.forEach(property => {
            property['Recognition Type:'].forEach(type => recognitionTypes.add(type));
            authorityNames.add(property['Authority Name']);
        });

        recognitionTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            recognitionFilter.appendChild(option);
        });

        authorityNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            authorityFilter.appendChild(option);
        });
    }

    // Function to filter data based on selected filters
    function applyFilters() {
        const selectedRecognition = recognitionFilter.value;
        const selectedAuthority = authorityFilter.value;

        const filteredData = propertiesData.filter(property => {
            const matchesRecognition = selectedRecognition === 'all' || property['Recognition Type:'].includes(selectedRecognition);
            const matchesAuthority = selectedAuthority === 'all' || property['Authority Name'] === selectedAuthority;
            return matchesRecognition && matchesAuthority;
        });

        populateTable(filteredData);
    }

    // Fetch and load data
    fetch('data/overview.json')
        .then(response => response.json())
        .then(data => {
            propertiesData = data;
            populateTable(data);
            populateFilters(data);
        })
        .catch(error => console.error('Error loading property data:', error));

    // Apply filters when the button is clicked
    applyFiltersButton.addEventListener('click', applyFilters);
});
