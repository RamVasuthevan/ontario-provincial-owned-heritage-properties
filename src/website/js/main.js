document.addEventListener('DOMContentLoaded', function () {
    const recognitionFilter = document.getElementById('filter-recognition');
    const authorityFilter = document.getElementById('filter-authority');
    const applyFiltersButton = document.getElementById('apply-filters');
    const propertiesTableBody = document.getElementById('properties-table').getElementsByTagName('tbody')[0];

    fetch('data/overview.json')
        .then(response => response.json())
        .then(data => {
            // Populate filters
            const recognitionTypes = new Set();
            const authorityNames = new Set();

            data.forEach(property => {
                property['Recognition Type:'].forEach(type => recognitionTypes.add(type.trim()));
                authorityNames.add(property['Authority Name'].trim());
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

            // Render table
            function renderTable(data) {
                propertiesTableBody.innerHTML = '';
                data.forEach((property, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><a href="property.html?property=${index}">${property['Property Name']}</a></td>
                        <td>${property['Authority Name']}</td>
                        <td>${property['Other Name(s):'].join('<br>')}</td>
                        <td>${property['Recognition Type:'].join('<br>')}</td>
                        <td>${property['Current Functional Category:']}</td>
                        <td>${property['Current Functional Type:']}</td>
                    `;
                    propertiesTableBody.appendChild(row);
                });
            }

            // Initial render
            renderTable(data);

            // Apply filters
            applyFiltersButton.addEventListener('click', () => {
                const selectedRecognition = recognitionFilter.value;
                const selectedAuthority = authorityFilter.value;

                const filteredData = data.filter(property => {
                    const recognitionMatch = selectedRecognition === 'all' || property['Recognition Type:'].includes(selectedRecognition);
                    const authorityMatch = selectedAuthority === 'all' || property['Authority Name'] === selectedAuthority;
                    return recognitionMatch && authorityMatch;
                });

                renderTable(filteredData);
            });
        })
        .catch(error => console.error('Error loading property data:', error));
});
