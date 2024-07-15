document.addEventListener('DOMContentLoaded', function () {
    fetch('data/overview.json')
        .then(response => response.json())
        .then(data => {
            const propertyTableBody = document.querySelector('#property-table tbody');
            const recognitionTypeFilter = document.getElementById('recognition-type-filter');
            const authorityNameFilter = document.getElementById('authority-name-filter');
            const filterButton = document.getElementById('filter-button');
            
            const populateFilters = () => {
                const recognitionTypes = [...new Set(data.map(item => item['Recognition Type:']).flat())];
                const authorityNames = [...new Set(data.map(item => item['Authority Name']))];
                
                recognitionTypes.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type;
                    recognitionTypeFilter.appendChild(option);
                });

                authorityNames.forEach(name => {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    authorityNameFilter.appendChild(option);
                });
            };

            const renderTable = (data) => {
                propertyTableBody.innerHTML = '';
                data.forEach((property, index) => {
                    const propertyRow = document.createElement('tr');
                    propertyRow.innerHTML = `
                        <td><a href="property.html?property=${index}">${property['Property Name']}</a></td>
                        <td>${property['Authority Name']}</td>
                        <td>${property['Other Name(s):']}</td>
                        <td>${property['Recognition Type:'].join('<br>')}</td>
                        <td>${property['Current Functional Category:']}</td>
                        <td>${property['Current Functional Type:']}</td>
                    `;
                    propertyTableBody.appendChild(propertyRow);
                });
            };

            const sortData = (column, order) => {
                data.sort((a, b) => {
                    const valueA = (a[column] || "").toUpperCase();
                    const valueB = (b[column] || "").toUpperCase();
                    if (valueA < valueB) {
                        return order === 'asc' ? -1 : 1;
                    }
                    if (valueA > valueB) {
                        return order === 'asc' ? 1 : -1;
                    }
                    return 0;
                });
            };

            const filterData = () => {
                const recognitionType = recognitionTypeFilter.value;
                const authorityName = authorityNameFilter.value;
                let filteredData = data;

                if (recognitionType) {
                    filteredData = filteredData.filter(item => item['Recognition Type:'].includes(recognitionType));
                }

                if (authorityName) {
                    filteredData = filteredData.filter(item => item['Authority Name'] === authorityName);
                }

                renderTable(filteredData);
            };

            populateFilters();
            renderTable(data);

            document.querySelectorAll('#property-table th').forEach(header => {
                header.addEventListener('click', () => {
                    const column = header.getAttribute('data-column');
                    const order = header.getAttribute('data-order');
                    const newOrder = order === 'asc' ? 'desc' : 'asc';
                    header.setAttribute('data-order', newOrder);
                    sortData(column, newOrder);
                    renderTable(data);
                });
            });

            filterButton.addEventListener('click', filterData);
        })
        .catch(error => console.error('Error loading JSON:', error));
});
