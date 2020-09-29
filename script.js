
document.body.onload = loadApp;


async function loadApp() {
    await appData.get();
    const app = document.getElementById("app");
    appData
    page.appendChild(page.create(), app);
    page.renderCountryList();

}






const page = {
    create: function () {
        return (
            `<div id="pageHolder">
                    <div id="modalHolder">
                        
                    </div>
                <div id="frame">
                    <header id="header">
                        <h1>${page.pageName}</h1>
                    </header>
                    <div id="sidebar">
                        <div id="countryNavHolder">
                            <nav id="countryNav">
                                <ul id="countryUl">
                                </ul>
                            </nav>
                        </div>
                    </div>
                    <div id="centerPage">
                        <div id="cityListHolder">
                            <div id="cityListContainer">
                                <ul id="cityUl">
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
        )
    },
    appendChild: function (child, parent) {
        parent.innerHTML = child;
        return;
    },
    renderCountryList: () => {
        appData.countries.forEach(country => {
            console.log(country)
            let li = document.createElement("li");
            li.setAttribute("class", "countryListItem");
            li.addEventListener("click", (e) => eventHandlers.onCountryClickEventHandler(e))
            li.innerHTML = country.countryname;
            document.getElementById("countryUl").appendChild(li);
        })
    },
    renderCityList: () => {
        if (page.currentCountry !== page.currentlyRenderedCountryCityList) {
            console.log("rendering city list");
            document.getElementById("cityUl").innerHTML = "";
            const citiesToRender = appData.cities.filter(cit => cit.countryid === page.currentCountry.id);
            citiesToRender.forEach(city => {
                let li = document.createElement("li");
                li.setAttribute("class", "cityListItem");
                li.addEventListener("click", (e) => eventHandlers.onCityClickEventHandler(e))
                li.innerHTML = city.stadname;
                document.getElementById("cityUl").appendChild(li);
            })
        }
    },
    renderCityModalPage: () => {

        //Skapar modal (är gömd för tillfället med css: translateY)
        document.getElementById("modalHolder").innerHTML = `
                        <div class="cityModal">
                            <div id="modalWindowHeader">
                                <div id="modalCloseBtnHolder">
                                    <button id="closeModalBtn">X</button>
                                </div>
                            </div>
                            <div id="modalContainer">
                                <header id="modalHeader">
                                </header>
                                <content id="modalContent">
                                    <div id="inputHolder">
                                        <button id="countryVisitedBtn">Add to visisted</button>
                                    </div>
                                </content
                            </div>
                        </div>
        `
        //Lägg till header dynamiskt

        let header = document.createElement("h2");
        header.innerText = page.currentCity.stadname;
        document.getElementById("modalHeader").appendChild(header);

        //Lägg till content dynamiskt

        let content = document.createElement("p");
        content.innerText = `
        ${page.currentCity.stadname} är en stad som ligger i ${page.currentCountry.countryname} och har ${page.currentCity.population} invånare.
        `
        document.getElementById("modalContent").prepend(content);

        //Lägg till class på modalContent som gör transition med translateY (med timeout annars blir det ingen animation)
        setTimeout(() => { document.getElementsByClassName("cityModal")[0].classList.add("open"); }, 10)

        //Skapa event handler på stäng-knapp
        document.getElementById("closeModalBtn").addEventListener("click", eventHandlers.onModalBtnClosedClickedEventHandler)

        //Skapa event handler på add-to-visited-knapp
        document.getElementById("countryVisitedBtn").addEventListener("click", eventHandlers.onCountryVisitedBtnClickedEventHandler)

        //Kryssa för eller ur add-to-visited-knapp
        page.renderVisitedButton();

    },
    renderVisitedButton: () => {
        let visitedBtn = document.getElementById("countryVisitedBtn");
        if (appData.citiesVisited.includes(page.currentCity.id)) {
            visitedBtn.innerText = "Remove from visited";
            visitedBtn.classList.add("visited");
        } else {
            visitedBtn.innerText = "Add to visited";
            visitedBtn.className = ""
        }
    },
    pageName: "Travel Partner",
    currentCountry: null,
    currentlyRenderedCountryCityList: null,
    currentCity: null
}

const appData = {
    get: (async url => {
        let countryData = await (await (fetch('./src/json/land.json')
            .then(res => {
                return res.json()
            })
            .catch(err => {
                console.log('Error: ', err)
            })
        ))
        let cityData = await (await (fetch('./src/json/stad.json')
            .then(res => {
                return res.json()
            })
            .catch(err => {
                console.log('Error: ', err)
            })
        ))

        console.log("countrydata", countryData);
        console.log("citydata", cityData);
        appData.countries = countryData;
        appData.cities = cityData;
        appData.hasBeenFetched = true;
    }),
    hasBeenFetched: false,
    cities: {},
    countries: {},
    citiesVisited: []
}


const eventHandlers = {
    onCountryClickEventHandler: e => {
        page.currentCountry = appData.countries.find(c => c.countryname === e.target.innerHTML);
        page.renderCityList();
    },
    onCityClickEventHandler: e => {
        page.currentCity = appData.cities.find(c => c.stadname == e.target.innerHTML);
        page.renderCityModalPage();
        console.log("curr city", page.currentCity);
    },
    onModalBtnClosedClickedEventHandler: () => {
        document.getElementsByClassName("cityModal")[0].classList.remove("open");
    },
    onCountryVisitedBtnClickedEventHandler: () => {
        if (!appData.citiesVisited.includes(page.currentCity.id)) {
            appData.citiesVisited.push(page.currentCity.id);
        } else {
            appData.citiesVisited = appData.citiesVisited.filter(c => c !== page.currentCity.id)
        }

        page.renderVisitedButton();
    }
}