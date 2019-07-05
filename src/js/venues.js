import { setModalSize, setModalContent, showModal, populateVenueModal } from './modal';

function initVenues(planData) {
    const venueForm    = document.getElementById('venue-form');
    const venueSearch  = document.getElementById('venue-search');
    const submitButton = venueForm.querySelector('button');
    const instructions = document.querySelector('.instructions');
    const loading      = document.querySelector('.venues-loading-wrapper');
    const results      = document.querySelector('.results');

    const location     = planData.location;
    const clientId     = '4CTSR1VBDV4PR5AETIVQJ0H3SJXVZ5CAN21RQ5LW2TSYF1H4';
    const clientSecret = 'FA0G1ZRTMNI2ERFSJ1WI3GPTKX4DWMSTAO1WGCITDEFWA0VP';
    const verDate      = '20170215';
    const limit        = 30;

    // submit button status
    venueSearch.addEventListener('keyup', ev => {
        submitButton.disabled = ev.target.value.length === 0;
    });

    // submit venue search form
    venueForm.addEventListener('submit', ev => {
        ev.preventDefault();
        results.innerHTML = '';
        instructions.style.display = 'none';
        loading.style.display = 'block';

        fetch(`https://api.foursquare.com/v2/venues/explore?client_id=${clientId}&client_secret=${clientSecret}&v=${verDate}&near=${location}&query=${venueSearch.value}&limit=${limit}`)
        .then(res => res.json())
        .then(data => {
            const arr = data.response.groups[0].items;
            let resultsHtml = '';

            // loop through results and populate html
            for (let i=0, len=arr.length; i<len; i++) {
                const venue = arr[i].venue;

                console.log(venue);

                const iconUrl = `${venue.categories[0].icon.prefix}bg_88${venue.categories[0].icon.suffix}`;
                const address = venue.location.address ? venue.location.address : 'Address unavailable';
                const crossStreetHtml = venue.location.crossStreet ? ` <span class="cross-street">(${venue.location.crossStreet})</span>` : '';
                const categoryHtml = venue.categories[0] ? venue.categories[0].name : '';

                resultsHtml += `
                    <div class="result clear-children" data-venue-id="${venue.id}" data-venue-name="${venue.name}">
                        <div class="index left">${i + 1}.</div>
                        <div class="info left">
                            <div class="name">${venue.name}</div>
                            <div class="subtitle">${categoryHtml}</div>
                            <div class="address">${address}${crossStreetHtml}</div>
                        </div>
                        <img class="icon right" src="${iconUrl}"/>
                    </div>
                `;
            }

            // update container
            results.innerHTML = resultsHtml;
            loading.style.display = 'none';

            // make results draggable to fullcalendar
            $('.result').each(function() {
                $(this).draggable({
                    zIndex: 9999,
                    revert: true,
                    revertDuration: 0.5,
                    appendTo: 'body',
                    containment: 'window',
                    scroll: false,
                    helper: 'clone',
                    start: function(evt, ui) {
                        $(ui.helper).addClass('ui-draggable-helper');
                    }
                });
            });
        });
    });

    // click on results
    results.addEventListener('click', ev => {
        const result = ev.target.closest('.result');
        if (result) {
            setModalSize('570px', 'auto');
            setModalContent(`
                <div class="modal-loading-wrapper">
                    <div class="loading"></div>
                </div>
            `);
            fetch(`https://api.foursquare.com/v2/venues/${result.dataset.venueId}?client_id=${clientId}&client_secret=${clientSecret}&v=${verDate}`)
            .then(res => res.json())
            .then(data => {
                populateVenueModal(data);
            });
            showModal();
        }
    });
}

export default initVenues;
