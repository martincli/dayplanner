import { setModalSize, setModalContent, showModal, populateVenueModal } from './modal';
import { getRatingHtml } from './helpers';

function initCalendar(planData) {
    const plannerViewElements = document.querySelectorAll('.planner-view');
    const planInfo            = document.querySelector('.plan-info');
    const plannerLeft         = document.querySelector('.planner-left');

    const startDate = new Date(planData.startDate);
    const endDate = new Date(planData.endDate);
    const startDateText = `${startDate.getMonth()+1}/${startDate.getDate()}/${startDate.getFullYear()}`;
    const endDateText = `${endDate.getMonth()+1}/${endDate.getDate()}/${endDate.getFullYear()}`;

    const clientId     = '4CTSR1VBDV4PR5AETIVQJ0H3SJXVZ5CAN21RQ5LW2TSYF1H4';
    const clientSecret = 'FA0G1ZRTMNI2ERFSJ1WI3GPTKX4DWMSTAO1WGCITDEFWA0VP';
    const verDate      = '20170215';
    const limit        = 30;
    
    // set header text
    planInfo.textContent = `${planData.location} (${startDateText} – ${endDateText})`;

    // show planner view
    plannerViewElements.forEach((el) => { el.classList.add('active') });   

    // initialize fullcalendar
    $(document).ready(function() {
        $('.fullcalendar').fullCalendar({
            allDaySlot: false,
            columnFormat: 'dddd, M/D',
            defaultDate: startDate,
            defaultTimedEventDuration: '02:00:00',
            defaultView: 'agendaDay',
            droppable: true,
            editable: true,
            events: planData.events,
            header: {
                left:   'prev',
                center: 'title',
                right:  'next'
            },
            height: $(plannerLeft).height(),
            slotEventOverlap: false,
            titleFormat: 'dddd, M/D',

            // drop result into fullcalendar
            drop: function(date, jsEvent, ui, resourceId) {
                const eventObj = {
                    title: this.dataset.venueName,
                    venueId: this.dataset.venueId,
                    start: date,
                    end: date.clone().add('2', 'hours')
                }

                $('.fullcalendar').fullCalendar('renderEvent', eventObj, true);
            },

            // click on event
            eventClick: function(event, jsEvent, view) {
                setModalSize('570px','auto');
                setModalContent(`
                    <div class="modal-loading-wrapper">
                        <div class="loading"></div>
                    </div>
                `);
                $.get(`https://api.foursquare.com/v2/venues/${event.venueId}?client_id=${clientId}&client_secret=${clientSecret}&v=${verDate}`)
                .done(function(data) {
                    populateVenueModal(data, event._id);
                });
                showModal();
            },

            // save updates to localstorage
            eventAfterAllRender: function() {
                const planObj = JSON.parse(localStorage.getItem(planData.id));
                const events = $('.fullcalendar').fullCalendar('clientEvents');
                
                const copy = Object.assign({}, planObj);
                const newEvents = [];
                
                for (let event of events) {
                    const newEvent = {};
                    newEvent.title = event.title;
                    newEvent.venueId = event.venueId;
                    newEvent.start = event.start;
                    newEvent.end = event.end;
                    newEvents.push(newEvent);
                }
                copy.events = newEvents;
                localStorage.setItem(planData.id, JSON.stringify(copy));
            }
        });

        // handle window resize
        window.addEventListener('resize', function() {
            $('.fullcalendar').fullCalendar('option', 'height', $(plannerLeft).height());
        });

        // Get number of days
        // http://stackoverflow.com/a/2627493
        const oneDay = 24*60*60*1000;
        const firstDate = new Date(startDate);
        const secondDate = new Date(endDate);
        const totalDays = 1 + Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
        let currentDay = 1;

        const prevButton = document.querySelector('.fc-prev-button');
        const nextButton = document.querySelector('.fc-next-button');

        // logic for enabling/disabling prev/next buttons
        prevButton.disabled = true;
        if(currentDay === totalDays) { 
            nextButton.disabled = true;
            nextButton.classList.remove('fc-state-hover');
        }
        prevButton.addEventListener('click', function() {
            if(currentDay === 2) { 
                this.disabled = true;
                this.classList.remove('fc-state-hover');
            }
            nextButton.disabled = false;
            currentDay--;
        });
        nextButton.addEventListener('click', function() {
            if(currentDay === totalDays - 1) {
                this.disabled = true;
                this.classList.remove('fc-state-hover');
            }
            prevButton.disabled = false;
            currentDay++;
        });

        // inline styling overrides
        const tableHeader = document.querySelector('.fc-head-container > .fc-row');
        tableHeader.style.borderRight = 'none';
    });
}

export default initCalendar;
