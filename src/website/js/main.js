document.addEventListener('DOMContentLoaded', function () {
    const filters = {
        recognition: 'all',
        authority: 'all',
        category: 'all',
        type: 'all'
    };

    const recognitionSelect = document.getElementById('filter-recognition');
    const authoritySelect = document.getElementById('filter-authority');
    const categorySelect = document.getElementById('filter-category');
    const typeSelect = document.getElementById('filter-type');
    const applyFiltersButton = document.getElementById('apply-filters');
    const propertiesTable = document.getElementById('properties-table').querySelector('tbody');

    fetch('data/overview.json')
        .then(response => response.json())
        .then(data => {
            populateFilters(data);
            displayProperties(data);
        })
        .catch(error => console.error('Error loading property data:', error));

    function populateFilters(data) {
        const recognitionTypes = new Set();
        const authorities = new Set();
        const categories = new Set();
        const types = new Set();

        data.forEach(property => {
            property['Recognition Type:'].forEach(recognition => recognitionTypes.add(recognition));
            authorities.add(property['Authority Name']);
            categories.add(property['Current Functional Category:']);
            types.add(property['Current Functional Type:']);
        });

        recognitionTypes.forEach(recognition => {
            const option = document.createElement('option');
            option.value = recognition;
            option.textContent = recognition;
            recognitionSelect.appendChild(option);
        });

        authorities.forEach(authority => {
            const option = document.createElement('option');
            option.value = authority;
            option.textContent = authority;
            authoritySelect.appendChild(option);
        });

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });
    }

    function displayProperties(data) {
        propertiesTable.innerHTML = '';
        const filteredData = data.filter(property => {
            const matchesRecognition = filters.recognition === 'all' || property['Recognition Type:'].includes(filters.recognition);
            const matchesAuthority = filters.authority === 'all' || property['Authority Name'] === filters.authority;
            const matchesCategory = filters.category === 'all' || property['Current Functional Category:'] === filters.category;
            const matchesType = filters.type === 'all' || property['Current Functional Type:'] === filters.type;
            return matchesRecognition && matchesAuthority && matchesCategory && matchesType;
        });

        filteredData.forEach((property, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="property.html?property=${index}">${property['Property Name']}</a></td>
                <td>${property['Authority Name']}</td>
                <td>${property['Other Name(s):'].join('<br>')}</td>
                <td>${property['Recognition Type:'].join('<br>')}</td>
                <td>${property['Current Functional Category:']}</td>
                <td>${property['Current Functional Type:']}</td>
            `;
            propertiesTable.appendChild(row);
        });
    }

    recognitionSelect.addEventListener('change', function () {
        filters.recognition = this.value;
    });

    authoritySelect.addEventListener('change', function () {
        filters.authority = this.value;
    });

    categorySelect.addEventListener('change', function () {
        filters.category = this.value;
    });

    typeSelect.addEventListener('change', function () {
        filters.type = this.value;
    });

    applyFiltersButton.addEventListener('click', function () {
        fetch('data/overview.json')
            .then(response => response.json())
            .then(data => displayProperties(data))
            .catch(error => console.error('Error loading property data:', error));
    });
});
