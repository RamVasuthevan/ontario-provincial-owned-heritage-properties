document.addEventListener('DOMContentLoaded', function () {
    fetch('data/overview.json')
        .then(response => response.json())
        .then(data => {
            const propertyList = document.getElementById('property-list');
            const propertyDetails = new URLSearchParams(window.location.search).get('property');

            if (propertyList) {
                data.forEach((property, index) => {
                    const propertyItem = document.createElement('div');
                    propertyItem.className = 'property-item';
                    propertyItem.innerHTML = `
                        <h2><a href="property.html?property=${index}">${property.property_name}</a></h2>
                        <p>${property.recognition_type}</p>
                    `;
                    propertyList.appendChild(propertyItem);
                });
            }

            if (propertyDetails !== null) {
                const property = data[propertyDetails];
                document.getElementById('property-name').textContent = property.property_name;
                document.getElementById('other-names').textContent = property.other_name;
                document.getElementById('recognition-type').textContent = property.recognition_type;
                document.getElementById('address').textContent = property.address;
                document.getElementById('authority-name').textContent = property.authority_name;
                document.getElementById('description-of-property').textContent = property.description_of_property;
                document.getElementById('statement-of-value').textContent = property.statement_of_value;
                document.getElementById('description-of-attributes').textContent = property.description_of_attributes;
                document.getElementById('current-functional-category').textContent = property.current_functional_category;
                document.getElementById('current-functional-type').textContent = property.current_functional_type;
            }
        })
        .catch(error => console.error('Error loading JSON:', error));
});
