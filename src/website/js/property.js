document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyIndex = urlParams.get('property');

    fetch('data/overview.json')
        .then(response => response.json())
        .then(data => {
            const property = data[propertyIndex];
            const propertyDetails = document.getElementById('property-details');

            if (property) {
                propertyDetails.innerHTML = `
                    <h2>${property['Property Name']}</h2>
                    <table>
                        <tr>
                            <th>Other Name(s)</th>
                            <td>${property['Other Name(s):']}</td>
                        </tr>
                        <tr>
                            <th>Recognition Type</th>
                            <td>${property['Recognition Type:'].join(', ')}</td>
                        </tr>
                        <tr>
                            <th>Address</th>
                            <td>${property['Address:']}</td>
                        </tr>
                        <tr>
                            <th>Authority Name</th>
                            <td>${property['Authority Name']}</td>
                        </tr>
                        <tr>
                            <th>Description of Property</th>
                            <td>${property['Description of Property:']}</td>
                        </tr>
                        <tr>
                            <th>Statement of Cultural Heritage Value or Interest</th>
                            <td>${property['Statement of Cultural Heritage Value or Interest:']}</td>
                        </tr>
                        <tr>
                            <th>Description of Heritage Attributes</th>
                            <td>${property['Description of Heritage Attributes:']}</td>
                        </tr>
                        <tr>
                            <th>Current Functional Category</th>
                            <td>${property['Current Functional Category:']}</td>
                        </tr>
                        <tr>
                            <th>Current Functional Type</th>
                            <td>${property['Current Functional Type:']}</td>
                        </tr>
                    </table>
                `;
            } else {
                propertyDetails.innerHTML = '<p>Property not found.</p>';
            }
        })
        .catch(error => console.error('Error loading JSON:', error));
});
