import { getRatingHtml } from './helpers';

const backdrop = document.querySelector('.backdrop');
const modal    = document.querySelector('.modal');
const closeBtn = modal.querySelector('.close-btn');
const wrapper  = document.querySelector('.wrapper');

// modal event listeners
backdrop.addEventListener('click', hideModal);
closeBtn.addEventListener('click', hideModal);
modal.addEventListener('click', ev => {
    ev.stopPropagation();
    if (ev.target.classList.contains('close-confirm-modal')) {
        hideModal();
    }

    // delete plan
    if (ev.target.classList.contains('confirm-delete-plan')) {
        const planId = ev.target.dataset.planId;
        const urlParams = new URLSearchParams(window.location.search);
        document.querySelector(`.plan-wrapper[data-plan-id="${planId}"]`).remove();
        localStorage.removeItem(planId);
        hideModal();
        if (urlParams.get('id') === planId) {
            window.location = './index.html';
        }
    }

    // remove event
    if (ev.target.classList.contains('remove-event-btn')) {
        const eventId = ev.target.dataset.eventId;
        $('.fullcalendar').fullCalendar('removeEvents', eventId);
        hideModal();
    }

    // edit event name
    if (ev.target.classList.contains('edit-title-btn')) {
        document.querySelector('.title-wrapper').style.display = 'none';
        document.querySelector('.edit-title-form').style.display = 'block';
        const input = document.querySelector('.edit-title-input');
        input.value = ev.target.dataset.title;
        input.select();
    }

    // cancel event name edit
    if (ev.target.classList.contains('edit-title-cancel-btn')) {
        document.querySelector('.edit-title-form').style.display = 'none';
        document.querySelector('.title-wrapper').style.display = 'block';
    }
});

// submit event name edit
modal.addEventListener('submit', ev => {
    ev.preventDefault();
    if (ev.target.classList.contains('edit-title-form')) {
        titleFormSubmit(ev.target.dataset.eventId);
    }
});

modal.addEventListener('blur', ev => {
    if (ev.target.classList.contains('edit-title-input')) {
        titleFormSubmit(ev.target.parentNode.dataset.eventId);
    }
}, true);

function titleFormSubmit(eventId) {
    const eventObj = $('.fullcalendar').fullCalendar('clientEvents', eventId)[0];
    const newTitle = document.querySelector('.edit-title-input').value;
    eventObj.title = newTitle;
    $('.fullcalendar').fullCalendar('updateEvent', eventObj);
    document.querySelector('.event-title').innerHTML = newTitle;
    document.querySelector('.edit-title-btn').dataset.title = newTitle;
    document.querySelector('.title-wrapper').style.display = 'block';
    document.querySelector('.edit-title-form').style.display = 'none';
}

export function setModalSize(width, height) {
    modal.style.width = width;
    modal.style.height = height;
}

export function setModalContent(val) {
    modal.querySelector('.content').innerHTML = val;
}

export function showModal() {
    backdrop.classList.add('active');
    modal.classList.add('active');
    wrapper.classList.add('modal-active');
}

export function hideModal() {
    backdrop.classList.remove('active');
    modal.classList.remove('active');
    wrapper.classList.remove('modal-active');
}

// has eventId -> for calendar
export function populateVenueModal(data, eventId, title) {
    const venue = data.response.venue;
    const categoriesHtml = venue.categories.length > 0 ? ` <span class="divider">|</span> ${venue.categories.map(category => category.shortName).join(', ')}` : '';
    const address = venue.location.formattedAddress.join('<br/>');
    const websiteHtml = venue.url ? `<div class="website"><i class="fa fa-globe"></i> <a href="${venue.url}">${venue.url}</a></div>` : '';
    const phoneHtml = venue.contact.formattedPhone ? `<div class="phone"><i class="fa fa-phone"></i> ${venue.contact.formattedPhone}</div>` : '';

    let titleHtml = `<div class="venue-name">${venue.name}</div>`;
    let buttonHtml = '';

    if (eventId) {
        titleHtml = `
            <div class="title-wrapper">
                <span class="event-title">${title}</span> <i class="fa fa-pencil edit-title-btn" data-title="${title}"></i>
            </div>
            <form class="edit-title-form" data-event-id="${eventId}">
                <input type="text" class="edit-title-input">
                <input type="button" class="edit-title-cancel-btn" value="&#10006">
            </form>
            <div class="venue-name">${venue.name}</div>`;
        buttonHtml = `<button class="remove-event-btn" data-event-id="${eventId}">Remove Event</button>`;
    }

    // populate modal content
    setModalContent(`
        <div class="venue-info left">
            ${titleHtml}
            <div class="subtitle">${getRatingHtml(venue.rating)}${categoriesHtml}</div>
            <div class="address">${address}</div>
            ${websiteHtml}
            ${phoneHtml}
        </div>
        <div class="map right"></div>
        <div class="clear">
        ${buttonHtml}
    `);

    // initialize map
    const loc = {
        lat: venue.location.lat,
        lng: venue.location.lng
    };
    const map = new google.maps.Map(document.querySelector('.map'), {
        zoom: 16,
        center: loc,
        mapTypeControl: false
    });
    // eslint-disable-next-line no-unused-vars
    const marker = new google.maps.Marker({
        position: loc,
        map: map
    });
}
