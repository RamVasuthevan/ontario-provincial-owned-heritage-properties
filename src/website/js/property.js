document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyIndex = urlParams.get('property');

    if (propertyIndex !== null) {
        fetch('data/overview.json')
            .then(response => response.json())
            .then(data => {
                const property = data[propertyIndex];
                if (property) {
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
                } else {
                    console.error('Property not found.');
                }
            })
            .catch(error => console.error('Error loading JSON:', error));
    } else {
        console.error('No property index specified in URL.');
    }
});
