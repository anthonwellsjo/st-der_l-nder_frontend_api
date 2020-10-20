document.body.onload = start;

let cities = {};
let countries = [];

async function start() {
    getNav();
    createEventHandlers();
    getData();
}

const getData = async () => {
    cities = await (await (fetch('/data/cities')
        .then(res => {
            return res.json()
        })
        .catch(err => {
            console.log('Error: ', err)
        })));
    console.log(cities);

    countries = await (await (fetch('/data/countries')
        .then(res => {
            return res.json()
        })
        .catch(err => {
            console.log('Error: ', err)
        })
    ))
    console.log(countries);
}
const getNav = () => {
    document.getElementById("app").innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a id="logo" class="navbar-brand" style="font-size: 30px; border: 2px solid black;" href="#">S-O-L ADMIN</a>
    <div class="navbar-nav">
        <a class="nav-link active" href="/" id="add-country-btn">Add country <span class="sr-only">(current)</span></a>
        <a class="nav-link" href="/" id="add-city-btn">Add city</a>
    </div>
    </nav>
    <div id="page"></div>
`;
}
const getCountryPage = () => {
    document.getElementById("page").innerHTML = `
        <form>
            <div class="form-group">
                <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="Landsnamn">
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="Städer">
            </div>
            <div class="form-group">
                <input type="email" class="form-control" id="exampleFormControlInput1" placeholder="Invånare">
            </div>
        </form>
    `;
}
const getCityPage = () => {
    document.getElementById("page").innerHTML = `
        <form id="city-form">
            <div class="form-group">
                <input id="stad" type="text" class="form-control" id="exampleFormControlInput1" placeholder="Stadsnamn">
            </div>
            <label>En stad som ligger i: </label>
            <select class="form-control" id="exampleFormControlSelect1">
                ${countries.map(c => {
        return `<option value=${c.countryname} id="${c.id}">${c.countryname}</option>`
    })}
            </select>
            <div class="form-group">
                <input id="befolkning" type="number" class="form-control" id="exampleFormControlInput1" placeholder="Befolkning">
            </div>
            <br>
            <button type="submit">Spara</button>
        </form>
    `;
}
const createEventHandlers = () => {
    document.getElementById("add-country-btn").addEventListener("click", (e) => {
        e.preventDefault();
        getCountryPage();
    });
    document.getElementById("add-city-btn").addEventListener("click", (e) => {
        e.preventDefault();
        getCityPage();
        addCityEventHandlers();
    });
    document.getElementById("logo").addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("page").innerHTML = "";
    });
}
const addCityEventHandlers = () => {
    document.getElementById("city-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const stad = e.target.children[0].children[0].value;
        const land = e.target.children[2].options[e.target.children[2].selectedIndex].value;
        const landId = e.target.children[2].options[e.target.children[2].selectedIndex].id;
        const befolkning = e.target.children[3].children[0].value;
        console.log("stad", stad, "landid", landId, "land", land, "pop", befolkning);

        cities.push({
            id: cities.length + 1,
            stadname: stad,
            countryid: +landId,
            population: +befolkning
        });
        console.log(cities);

        fetch("/data/cities", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cities)
        })
            .then(res => res.json())
            .then(res => { console.log(res) });

    });
}