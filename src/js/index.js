import '../css/index.scss';
import initCreate   from './create';
import initSidebar  from './sidebar';
import initCalendar from './calendar';
import initVenues   from './venues';

if (process.env.NODE_ENV !== 'production') {
    require('../index.html');
}

const urlParams = new URLSearchParams(window.location.search);

// planner view
if(urlParams.has('id') && localStorage.getItem(urlParams.get('id'))) {
    initCalendar(JSON.parse(localStorage.getItem(urlParams.get('id'))));
    initVenues(JSON.parse(localStorage.getItem(urlParams.get('id'))));
    initSidebar();
    showBody();
}

// create view
else {
    initCreate();
    initSidebar();
    showBody();
}

// to prevent unstyled content flash
function showBody() {
    document.querySelector('body').style.display = 'block';
}