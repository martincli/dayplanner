import { setModalSize, setModalContent, showModal } from './modal';

function initSidebar() {
    const sidebarIcon  = document.querySelector('.sidebar-icon');
    const sidebar      = document.querySelector('.sidebar');
    const modal        = document.querySelector('.modal');
    const plansDiv     = sidebar.querySelector('.plans');
    const plans = [];

    // delay transition effects until first hover
    sidebarIcon.addEventListener('mouseover', function() {
        sidebar.classList.remove('preload');
        modal.classList.remove('preload');
    }, {once: true});

    sidebarIcon.addEventListener('click', function() {
        this.classList.toggle('shifted');
        sidebar.classList.toggle('opened');
    });

    // delete plan
    sidebar.addEventListener('click', function(ev) {
        var el = ev.target;
        if (el.classList.contains('delete-icon')) {
            setModalSize('400px','auto');
            setModalContent(`
                <p>Are you sure you want to delete this plan?</p>
                <button class="confirm-btn confirm-delete-plan" data-plan-id="${el.parentNode.dataset.planId}">Yes</button>
                <button class="confirm-btn close-confirm-modal">Cancel</button>
            `);
            showModal();
        }
    });

    // parse saved plans
    const keys = Object.keys(localStorage);
    for(let i = 0, len = keys.length; i < len; i++) {
        const plan = localStorage[keys[i]];
        const data = JSON.parse(plan);

        // parse date text
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        const startDateText = `${startDate.getMonth()+1}/${startDate.getDate()}/${startDate.getFullYear()}`;
        const endDateText = `${endDate.getMonth()+1}/${endDate.getDate()}/${endDate.getFullYear()}`;

        plans.push({
            id: keys[i],
            location: data.location,
            startDate,
            startDateText,
            endDate,
            endDateText
        });
    }

    // sort + show saved plans
    plans.sort((a,b) => {
        return a.startDate.getTime() > b.startDate.getTime();
    }).forEach((plan) => {
        $(plansDiv).append(`
            <div class="plan-wrapper" data-plan-id="${plan.id}">
                <a class="plan" href="${window.location.href.split('?')[0]}?id=${plan.id}">
                    <div class="location">${plan.location}</div>
                    <div class="date">${plan.startDateText} – ${plan.endDateText}</div>
                </a>
                <i class="fa fa-trash-o delete-icon"></i>
            </div>
        `);
    });
}

export default initSidebar;
