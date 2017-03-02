import Hashids from 'hashids';

function initCreate() {
    const createViewElements = document.querySelectorAll('.create-view');
    const createForm         = document.getElementById('create-form');
    const locationField      = document.getElementById('location-search');
    const startDateField     = document.getElementById('start-date');
    const endDateField       = document.getElementById('end-date');
    const submitButton       = createForm.querySelector('button');

    let locationSelected = false;
    let dateSelected     = false;

    const autocomplete = new google.maps.places.Autocomplete(locationField, {
        types: ['(cities)']
    });
    const hashids = new Hashids();

    // only enable submit button if location and dates are selected
    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            locationSelected = true;
            if (dateSelected) {
                submitButton.disabled = false;
            }
        }
    });
    locationField.addEventListener('input', function() {
        locationSelected = false;
        submitButton.disabled = true;
    });
    startDateField.addEventListener('input', function() {
        dateSelected = false;
        submitButton.disabled = true;
    });
    endDateField.addEventListener('input', function() {
        dateSelected = false;
        submitButton.disabled = true;
    });

    // initialize datepicker
    $('#create-form .input-daterange').datepicker({
        orientation: 'bottom auto',
        autoclose: true,
        assumeNearbyYear: true,
        dateLimit: { days: 7 },
        startDate: '-0d'
    }).on('changeDate', function() {
        dateSelected = true;
        if (locationSelected) {
            submitButton.disabled = false;
        }
    });

    // submit form
    createForm.addEventListener('submit', function(ev) {
        ev.preventDefault();
        const location = locationField.value;
        const startDate = startDateField.value;
        const endDate = endDateField.value;
        const planId = hashids.encode(Date.now());

        // save plan in localstorage
        const planObj = {
            id: planId,
            location: location,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            events: []
        };
        localStorage.setItem(planId, JSON.stringify(planObj));

        // redirect to planner view
        window.location = `${window.location.href.split('?')[0]}?id=${planId}`;
    });

    // show create view
    createViewElements.forEach((el) => { el.classList.add('active'); });
}

export default initCreate;
